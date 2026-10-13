/**
 * Pricing Rules Service — Day 22
 *
 * Business rules:
 * - Each vehicle_type may have multiple pricing_rules rows (history).
 * - The EFFECTIVE rate is the most recent active rule:
 *     WHERE vehicle_type = ? AND is_active = TRUE ORDER BY effective_from DESC LIMIT 1
 * - Creating a new rate for a vehicle_type deactivates the previous active rule
 *   for that type (via transaction), ensuring a clean single-active-rule invariant.
 * - Rates must be positive. No deletes — deactivate only.
 */

import { pool } from '../../config/database.js';

const VEHICLE_TYPES = ['MOTORCYCLE', 'STANDARD_CAR', 'SUV', 'VAN', 'TRUCK'];

export { VEHICLE_TYPES };

/** Format a raw pricing_rules row to a clean response object. */
export function formatRule(row) {
  if (!row) return null;
  return {
    id: row.id,
    vehicleType: row.vehicle_type,
    hourlyRate: Number(row.hourly_rate),
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
    isActive: Boolean(row.is_active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * List all pricing rules with optional filters.
 * @param {Object} filters - { vehicleType, isActive }
 */
export async function getPricingRules(filters = {}) {
  const { vehicleType, isActive } = filters;
  const whereClauses = [];
  const params = [];

  if (vehicleType && VEHICLE_TYPES.includes(vehicleType.toUpperCase())) {
    whereClauses.push('vehicle_type = ?');
    params.push(vehicleType.toUpperCase());
  }
  if (isActive !== undefined && isActive !== null && isActive !== '') {
    whereClauses.push('is_active = ?');
    params.push(isActive === 'true' || isActive === true ? 1 : 0);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const [rows] = await pool.execute(
    `SELECT * FROM pricing_rules ${whereSql} ORDER BY vehicle_type, effective_from DESC`,
    params
  );
  return rows.map(formatRule);
}

/**
 * Get the single currently-effective rate per vehicle type (all types).
 * Returns a map: { MOTORCYCLE: {…}, STANDARD_CAR: {…}, … }
 */
export async function getEffectiveRates() {
  const results = {};
  // Get the most recent active rule for each type in one query
  const [rows] = await pool.execute(`
    SELECT pr.*
    FROM pricing_rules pr
    INNER JOIN (
      SELECT vehicle_type, MAX(effective_from) AS max_from
      FROM pricing_rules
      WHERE is_active = TRUE
      GROUP BY vehicle_type
    ) latest ON pr.vehicle_type = latest.vehicle_type AND pr.effective_from = latest.max_from
    WHERE pr.is_active = TRUE
    ORDER BY pr.vehicle_type
  `);
  for (const row of rows) {
    results[row.vehicle_type] = formatRule(row);
  }
  return results;
}

/**
 * Get a single pricing rule by ID.
 */
export async function getPricingRuleById(id) {
  const [rows] = await pool.execute(
    'SELECT * FROM pricing_rules WHERE id = ? LIMIT 1',
    [id]
  );
  if (!rows || rows.length === 0) {
    const err = new Error(`Pricing rule #${id} not found.`);
    err.status = 404;
    throw err;
  }
  return formatRule(rows[0]);
}

/**
 * Create a new pricing rule for a vehicle type.
 *
 * Transaction:
 * 1. Deactivate any current active rule for the same vehicle_type.
 * 2. Insert new active rule with effective_from = NOW().
 * 3. Return the new rule ID.
 */
export async function createPricingRule({ vehicleType, hourlyRate }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Deactivate existing active rule for this vehicle type
    await conn.execute(
      `UPDATE pricing_rules
         SET is_active = FALSE, effective_to = NOW()
       WHERE vehicle_type = ? AND is_active = TRUE`,
      [vehicleType]
    );

    // Insert new active rule
    const [result] = await conn.execute(
      `INSERT INTO pricing_rules (vehicle_type, hourly_rate, is_active, effective_from)
       VALUES (?, ?, TRUE, NOW())`,
      [vehicleType, hourlyRate]
    );

    await conn.commit();
    return result.insertId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Deactivate a pricing rule (soft delete).
 * Only active rules can be deactivated.
 */
export async function deactivatePricingRule(id) {
  const [existing] = await pool.execute(
    'SELECT id, is_active, vehicle_type FROM pricing_rules WHERE id = ? LIMIT 1',
    [id]
  );
  if (!existing || existing.length === 0) {
    const err = new Error(`Pricing rule #${id} not found.`);
    err.status = 404;
    throw err;
  }
  if (!existing[0].is_active) {
    const err = new Error(`Pricing rule #${id} is already inactive.`);
    err.status = 400;
    throw err;
  }

  await pool.execute(
    'UPDATE pricing_rules SET is_active = FALSE, effective_to = NOW() WHERE id = ?',
    [id]
  );
  return getPricingRuleById(id);
}
