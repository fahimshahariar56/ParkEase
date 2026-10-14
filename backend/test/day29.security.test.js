import { spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/database.js';
import { app } from '../src/app.js';
import { authenticate } from '../src/middleware/authenticate.js';
import {
  getSessionById,
  getSessions,
} from '../src/modules/sessions/sessions.service.js';

const backendRoot = fileURLToPath(new URL('..', import.meta.url));
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  if (!server) return;
  server.closeAllConnections();
  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

describe('Day 29 security and edge cases', () => {
  it('fails startup when JWT_SECRET is missing or too short', () => {
    for (const secret of ['', 'too-short']) {
      const result = spawnSync(
        process.execPath,
        [
          '--input-type=module',
          '-e',
          "await import('./src/config/env.js');",
        ],
        {
          cwd: backendRoot,
          env: { ...process.env, JWT_SECRET: secret },
          encoding: 'utf8',
        }
      );

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /JWT_SECRET must be configured/i);
    }
  });

  it('rejects expired and incorrectly signed JWTs', () => {
    const expiredToken = jwt.sign(
      { id: 7, role: 'CUSTOMER' },
      env.JWT_SECRET,
      { expiresIn: -1 }
    );
    const incorrectlySignedToken = jwt.sign(
      { id: 7, role: 'CUSTOMER' },
      'not-the-configured-secret'
    );

    for (const token of [expiredToken, incorrectlySignedToken]) {
      let statusCode;
      let payload;
      let nextCalled = false;
      authenticate(
        { headers: { authorization: `Bearer ${token}` } },
        {
          status(code) {
            statusCode = code;
            return {
              json(body) {
                payload = body;
              },
            };
          },
        },
        () => {
          nextCalled = true;
        }
      );

      assert.equal(statusCode, 401);
      assert.equal(payload.success, false);
      assert.equal(nextCalled, false);
    }
  });

  it('denies unauthenticated direct session and admin API requests', async () => {
    for (const path of [
      '/api/v1/sessions',
      '/api/v1/sessions/1',
      '/api/v1/admin/protected-ping',
      '/api/v1/reports/sessions',
    ]) {
      const response = await fetch(`${baseUrl}${path}`);
      assert.equal(response.status, 401, `${path} must require authentication`);
    }
  });

  it('rejects customer tokens and role-manipulated tokens at admin endpoints', async () => {
    const customerToken = jwt.sign(
      { id: 7, email: 'customer@example.test', role: 'CUSTOMER' },
      env.JWT_SECRET
    );
    const customerResponse = await fetch(`${baseUrl}/api/v1/admin/protected-ping`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    assert.equal(customerResponse.status, 403);

    const [header] = customerToken.split('.');
    const manipulatedPayload = Buffer.from(
      JSON.stringify({ id: 7, email: 'customer@example.test', role: 'ADMIN' })
    ).toString('base64url');
    const manipulatedToken = `${header}.${manipulatedPayload}.${customerToken.split('.')[2]}`;
    const manipulatedResponse = await fetch(`${baseUrl}/api/v1/admin/protected-ping`, {
      headers: { Authorization: `Bearer ${manipulatedToken}` },
    });
    assert.equal(manipulatedResponse.status, 401);
  });

  it('binds customer ownership and user-controlled filters as SQL parameters', async () => {
    const originalExecute = pool.execute;
    const calls = [];
    pool.execute = async (sql, params = []) => {
      calls.push({ sql, params });
      return [[], []];
    };

    try {
      await getSessions(
        { status: 'ACTIVE', search: "x%' OR 1=1 --" },
        { id: 19, role: 'CUSTOMER' }
      );
      await assert.rejects(
        getSessionById('1 OR 1=1', { id: 19, role: 'CUSTOMER' }),
        (err) => err.status === 404
      );

      assert.match(calls[0].sql, /v\.user_id = \?/);
      assert.deepEqual(calls[0].params, [
        19,
        'ACTIVE',
        "%x%' OR 1=1 --%",
        "%x%' OR 1=1 --%",
        "%x%' OR 1=1 --%",
        "%x%' OR 1=1 --%",
      ]);
      assert.doesNotMatch(calls[0].sql, /x%' OR 1=1/);

      assert.match(calls[1].sql, /ps\.id = \? AND v\.user_id = \?/);
      assert.deepEqual(calls[1].params, ['1 OR 1=1', 19]);
    } finally {
      pool.execute = originalExecute;
    }
  });

  it('allows administrators to query sessions without customer scoping', async () => {
    const originalExecute = pool.execute;
    let capturedQuery;
    let capturedParams;
    pool.execute = async (sql, params = []) => {
      capturedQuery = sql;
      capturedParams = params;
      return [[], []];
    };

    try {
      await getSessions({}, { id: 1, role: 'ADMIN' });
    } finally {
      pool.execute = originalExecute;
    }

    assert.doesNotMatch(capturedQuery, /v\.user_id = \?/);
    assert.deepEqual(capturedParams, []);
  });
});
