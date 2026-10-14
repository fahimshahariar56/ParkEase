import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { pool } from '../src/config/database.js';
import { getDemoPaymentsReport } from '../src/modules/reports/reports.service.js';
import { validateReportFilters } from '../src/modules/reports/reports.validation.js';

function createMockReqRes(query) {
  const req = { query };
  let statusCode = 200;
  let jsonResponse = null;
  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      jsonResponse = data;
      return this;
    },
    get statusCode() {
      return statusCode;
    },
    get jsonResponse() {
      return jsonResponse;
    },
  };
  return {
    req,
    res,
  };
}

describe('Day 23 report correctness', () => {
  const originalQuery = pool.query;
  afterEach(() => {
    pool.query = originalQuery;
  });

  it('normalizes Dhaka date boundaries to the database UTC timezone', () => {
    const { req, res } = createMockReqRes({
      startDate: '2026-10-14',
      endDate: '2026-10-14',
    });
    let calledNext = false;

    validateReportFilters(req, res, () => { calledNext = true; });

    assert.equal(calledNext, true);
    assert.equal(req.validatedQuery.startDate, '2026-10-13 18:00:00');
    assert.equal(req.validatedQuery.endDate, '2026-10-14 17:59:59');
  });

  it('normalizes ISO timestamps to UTC MySQL datetime strings', () => {
    const { req, res } = createMockReqRes({
      startDate: '2026-10-14T09:00:00.000Z',
      endDate: '2026-10-14T18:00:00+06:00',
    });
    let calledNext = false;

    validateReportFilters(req, res, () => { calledNext = true; });

    assert.equal(calledNext, true);
    assert.equal(req.validatedQuery.startDate, '2026-10-14 09:00:00');
    assert.equal(req.validatedQuery.endDate, '2026-10-14 12:00:00');
  });

  it('rejects impossible calendar dates instead of accepting date rollover', () => {
    const { req, res } = createMockReqRes({ startDate: '2026-02-30' });
    let calledNext = false;

    validateReportFilters(req, res, () => { calledNext = true; });

    assert.equal(res.statusCode, 400);
    assert.match(res.jsonResponse.message, /Invalid startDate format/);
    assert.equal(calledNext, false);
  });

  it('applies the selected lot filter to every payment aggregate and detail query', async () => {
    const queries = [];
    pool.query = async (sql, params) => {
      queries.push({ sql, params });
      return queries.length === 1 ? [[{}], []] : [[], []];
    };

    const report = await getDemoPaymentsReport({
      startDate: '2026-10-13 18:00:00',
      endDate: '2026-10-14 17:59:59',
      lotId: 7,
    });

    assert.equal(queries.length, 4);
    for (const { sql, params } of queries) {
      assert.match(sql, /JOIN parking_lots pl ON ps\.lot_id = pl\.id/);
      assert.match(sql, /pl\.id = \?/);
      assert.equal(params[2], 7);
    }
    assert.equal((queries[3].sql.match(/JOIN parking_slots ps/g) || []).length, 1);
    assert.equal((queries[3].sql.match(/JOIN parking_lots pl/g) || []).length, 1);
    assert.equal(report.isDemoTransaction, true);
  });
});
