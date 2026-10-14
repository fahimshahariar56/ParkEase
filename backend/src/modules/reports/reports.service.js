/**
 * Reports Service — Day 22: Reports and Database Demonstration
 *
 * Implements real MySQL aggregate queries, multi-table JOINs,
 * conditional aggregation, and performance-optimized reporting logic.
 */

import { pool } from '../../config/database.js';

// ─── 1. Parking Occupancy Report ──────────────────────────────────────────────

export async function getOccupancyReport(filters = {}) {
  const { lotId } = filters;

  const lotConditions = [];
  const lotParams = [];

  if (lotId) {
    lotConditions.push('pl.id = ?');
    lotParams.push(lotId);
  }

  const lotWhereClause = lotConditions.length > 0 ? `WHERE ${lotConditions.join(' AND ')}` : '';

  // Query 1: Overall Slot Status & Real-time Occupancy Aggregates
  // Correlated subqueries ensure zero join multiplication.
  const summarySql = `
    SELECT
      COUNT(ps.id) AS total_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND s.is_occupied = 1 THEN 1 ELSE 0 END), 0) AS occupied_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied IS NULL OR s.is_occupied = 0) AND r.is_reserved = 1 THEN 1 ELSE 0 END), 0) AS reserved_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied IS NULL OR s.is_occupied = 0) AND (r.is_reserved IS NULL OR r.is_reserved = 0) THEN 1 ELSE 0 END), 0) AS available_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'MAINTENANCE' THEN 1 ELSE 0 END), 0) AS maintenance_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'INACTIVE' THEN 1 ELSE 0 END), 0) AS inactive_slots
    FROM parking_slots ps
    JOIN parking_lots pl ON ps.lot_id = pl.id
    LEFT JOIN (
      SELECT slot_id, 1 AS is_occupied
      FROM parking_sessions
      WHERE status = 'ACTIVE' AND exit_time IS NULL
      GROUP BY slot_id
    ) s ON ps.id = s.slot_id
    LEFT JOIN (
      SELECT slot_id, 1 AS is_reserved
      FROM reservations
      WHERE status IN ('CONFIRMED', 'ACTIVE')
        AND start_time <= NOW()
        AND end_time >= NOW()
      GROUP BY slot_id
    ) r ON ps.id = r.slot_id
    ${lotWhereClause}
  `;

  // Query 2: Breakdown by Parking Lot
  const lotsBreakdownSql = `
    SELECT
      pl.id AS lot_id,
      pl.name AS lot_name,
      pl.address AS lot_address,
      pl.total_capacity,
      pl.status AS lot_status,
      COUNT(ps.id) AS total_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND s.is_occupied = 1 THEN 1 ELSE 0 END), 0) AS occupied_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied IS NULL OR s.is_occupied = 0) AND r.is_reserved = 1 THEN 1 ELSE 0 END), 0) AS reserved_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied IS NULL OR s.is_occupied = 0) AND (r.is_reserved IS NULL OR r.is_reserved = 0) THEN 1 ELSE 0 END), 0) AS available_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'MAINTENANCE' THEN 1 ELSE 0 END), 0) AS maintenance_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'INACTIVE' THEN 1 ELSE 0 END), 0) AS inactive_slots
    FROM parking_lots pl
    LEFT JOIN parking_slots ps ON pl.id = ps.lot_id
    LEFT JOIN (
      SELECT slot_id, 1 AS is_occupied
      FROM parking_sessions
      WHERE status = 'ACTIVE' AND exit_time IS NULL
      GROUP BY slot_id
    ) s ON ps.id = s.slot_id
    LEFT JOIN (
      SELECT slot_id, 1 AS is_reserved
      FROM reservations
      WHERE status IN ('CONFIRMED', 'ACTIVE')
        AND start_time <= NOW()
        AND end_time >= NOW()
      GROUP BY slot_id
    ) r ON ps.id = r.slot_id
    ${lotWhereClause}
    GROUP BY pl.id, pl.name, pl.address, pl.total_capacity, pl.status
    ORDER BY pl.name ASC
  `;

  // Query 3: Breakdown by Slot Type
  const slotTypeBreakdownSql = `
    SELECT
      ps.slot_type,
      COUNT(ps.id) AS total_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND s.is_occupied = 1 THEN 1 ELSE 0 END), 0) AS occupied_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied IS NULL OR s.is_occupied = 0) AND r.is_reserved = 1 THEN 1 ELSE 0 END), 0) AS reserved_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied IS NULL OR s.is_occupied = 0) AND (r.is_reserved IS NULL OR r.is_reserved = 0) THEN 1 ELSE 0 END), 0) AS available_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'MAINTENANCE' THEN 1 ELSE 0 END), 0) AS maintenance_slots,
      COALESCE(SUM(CASE WHEN ps.status = 'INACTIVE' THEN 1 ELSE 0 END), 0) AS inactive_slots
    FROM parking_slots ps
    JOIN parking_lots pl ON ps.lot_id = pl.id
    LEFT JOIN (
      SELECT slot_id, 1 AS is_occupied
      FROM parking_sessions
      WHERE status = 'ACTIVE' AND exit_time IS NULL
      GROUP BY slot_id
    ) s ON ps.id = s.slot_id
    LEFT JOIN (
      SELECT slot_id, 1 AS is_reserved
      FROM reservations
      WHERE status IN ('CONFIRMED', 'ACTIVE')
        AND start_time <= NOW()
        AND end_time >= NOW()
      GROUP BY slot_id
    ) r ON ps.id = r.slot_id
    ${lotWhereClause}
    GROUP BY ps.slot_type
    ORDER BY ps.slot_type ASC
  `;

  const [[summaryRow = {}]] = await pool.query(summarySql, lotParams);
  const [lotRows] = await pool.query(lotsBreakdownSql, lotParams);
  const [typeRows] = await pool.query(slotTypeBreakdownSql, lotParams);

  const totalSlots = Number(summaryRow.total_slots || 0);
  const occupiedSlots = Number(summaryRow.occupied_slots || 0);
  const reservedSlots = Number(summaryRow.reserved_slots || 0);
  const availableSlots = Number(summaryRow.available_slots || 0);
  const maintenanceSlots = Number(summaryRow.maintenance_slots || 0);
  const inactiveSlots = Number(summaryRow.inactive_slots || 0);

  // Utilization rates
  const occupancyRate = totalSlots > 0
    ? Number((((occupiedSlots + reservedSlots) / totalSlots) * 100).toFixed(1))
    : 0;
  const physicalOccupancyRate = totalSlots > 0
    ? Number(((occupiedSlots / totalSlots) * 100).toFixed(1))
    : 0;

  const lotsBreakdown = lotRows.map((lot) => {
    const lTotal = Number(lot.total_slots || 0);
    const lOccupied = Number(lot.occupied_slots || 0);
    const lReserved = Number(lot.reserved_slots || 0);
    return {
      lotId: lot.lot_id,
      lotName: lot.lot_name,
      address: lot.lot_address,
      status: lot.lot_status,
      totalCapacity: Number(lot.total_capacity || 0),
      totalSlots: lTotal,
      occupiedSlots: lOccupied,
      reservedSlots: lReserved,
      availableSlots: Number(lot.available_slots || 0),
      maintenanceSlots: Number(lot.maintenance_slots || 0),
      inactiveSlots: Number(lot.inactive_slots || 0),
      occupancyRate: lTotal > 0
        ? Number((((lOccupied + lReserved) / lTotal) * 100).toFixed(1))
        : 0,
    };
  });

  const slotTypeBreakdown = typeRows.map((t) => {
    const tTotal = Number(t.total_slots || 0);
    const tOccupied = Number(t.occupied_slots || 0);
    const tReserved = Number(t.reserved_slots || 0);
    return {
      slotType: t.slot_type,
      totalSlots: tTotal,
      occupiedSlots: tOccupied,
      reservedSlots: tReserved,
      availableSlots: Number(t.available_slots || 0),
      maintenanceSlots: Number(t.maintenance_slots || 0),
      inactiveSlots: Number(t.inactive_slots || 0),
      occupancyRate: tTotal > 0
        ? Number((((tOccupied + tReserved) / tTotal) * 100).toFixed(1))
        : 0,
    };
  });

  return {
    summary: {
      totalSlots,
      availableSlots,
      occupiedSlots,
      reservedSlots,
      maintenanceSlots,
      inactiveSlots,
      occupancyRate,
      physicalOccupancyRate,
    },
    byLot: lotsBreakdown,
    bySlotType: slotTypeBreakdown,
  };
}

// ─── 2. Reservation Report ────────────────────────────────────────────────────

export async function getReservationsReport(filters = {}) {
  const { startDate, endDate, lotId, status, page = 1, limit = 50, offset = 0 } = filters;

  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push('r.start_time >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('r.start_time <= ?');
    params.push(endDate);
  }
  if (lotId) {
    conditions.push('pl.id = ?');
    params.push(lotId);
  }
  if (status) {
    conditions.push('r.status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 1. Overview aggregates
  const summarySql = `
    SELECT
      COUNT(r.id) AS total_reservations,
      COALESCE(SUM(CASE WHEN r.status = 'CONFIRMED' THEN 1 ELSE 0 END), 0) AS confirmed_count,
      COALESCE(SUM(CASE WHEN r.status = 'PENDING' THEN 1 ELSE 0 END), 0) AS pending_count,
      COALESCE(SUM(CASE WHEN r.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS active_count,
      COALESCE(SUM(CASE WHEN r.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_count,
      COALESCE(SUM(CASE WHEN r.status = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelled_count,
      COALESCE(SUM(CASE WHEN r.status = 'NO_SHOW' THEN 1 ELSE 0 END), 0) AS no_show_count,
      COALESCE(SUM(r.total_estimated_fee), 0) AS total_estimated_revenue,
      COALESCE(AVG(TIMESTAMPDIFF(MINUTE, r.start_time, r.end_time)), 0) AS avg_duration_minutes
    FROM reservations r
    JOIN parking_slots ps ON r.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
  `;

  // 2. Breakdown by status
  const statusSql = `
    SELECT
      r.status,
      COUNT(r.id) AS count,
      COALESCE(SUM(r.total_estimated_fee), 0) AS estimated_revenue
    FROM reservations r
    JOIN parking_slots ps ON r.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
    GROUP BY r.status
    ORDER BY count DESC
  `;

  // 3. Breakdown over time (by date)
  const timelineSql = `
    SELECT
      DATE(r.start_time) AS date_bucket,
      COUNT(r.id) AS total_reservations,
      COALESCE(SUM(CASE WHEN r.status = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelled_count,
      COALESCE(SUM(r.total_estimated_fee), 0) AS estimated_revenue
    FROM reservations r
    JOIN parking_slots ps ON r.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
    GROUP BY DATE(r.start_time)
    ORDER BY date_bucket DESC
    LIMIT 30
  `;

  // 4. Breakdown by parking lot
  const lotSql = `
    SELECT
      pl.id AS lot_id,
      pl.name AS lot_name,
      COUNT(r.id) AS reservation_count,
      COALESCE(SUM(CASE WHEN r.status = 'CONFIRMED' THEN 1 ELSE 0 END), 0) AS confirmed_count,
      COALESCE(SUM(CASE WHEN r.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS active_count,
      COALESCE(SUM(CASE WHEN r.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_count,
      COALESCE(SUM(CASE WHEN r.status = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelled_count,
      COALESCE(SUM(r.total_estimated_fee), 0) AS total_estimated_revenue
    FROM reservations r
    JOIN parking_slots ps ON r.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
    GROUP BY pl.id, pl.name
    ORDER BY reservation_count DESC
  `;

  // 5. Detailed paginated table records
  const detailsSql = `
    SELECT
      r.id,
      r.user_id,
      u.full_name AS customer_name,
      u.email AS customer_email,
      v.plate_number,
      v.vehicle_type,
      pl.name AS lot_name,
      ps.slot_number,
      ps.slot_type,
      r.start_time,
      r.end_time,
      TIMESTAMPDIFF(MINUTE, r.start_time, r.end_time) AS duration_minutes,
      r.hourly_rate_snapshot,
      r.total_estimated_fee,
      r.status,
      r.created_at
    FROM reservations r
    JOIN users u ON r.user_id = u.id
    JOIN vehicles v ON r.vehicle_id = v.id
    JOIN parking_slots ps ON r.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
    ORDER BY r.start_time DESC
    LIMIT ? OFFSET ?
  `;

  const detailsParams = [...params, limit, offset];

  const [[summary = {}]] = await pool.query(summarySql, params);
  const [statusRows] = await pool.query(statusSql, params);
  const [timelineRows] = await pool.query(timelineSql, params);
  const [lotRows] = await pool.query(lotSql, params);
  const [records] = await pool.query(detailsSql, detailsParams);

  const totalReservations = Number(summary.total_reservations || 0);
  const cancelledCount = Number(summary.cancelled_count || 0);
  const cancellationRate = totalReservations > 0
    ? Number(((cancelledCount / totalReservations) * 100).toFixed(1))
    : 0;

  return {
    summary: {
      totalReservations,
      confirmedCount: Number(summary.confirmed_count || 0),
      pendingCount: Number(summary.pending_count || 0),
      activeCount: Number(summary.active_count || 0),
      completedCount: Number(summary.completed_count || 0),
      cancelledCount,
      noShowCount: Number(summary.no_show_count || 0),
      cancellationRate,
      totalEstimatedRevenue: Number(Number(summary.total_estimated_revenue || 0).toFixed(2)),
      avgDurationMinutes: Math.round(Number(summary.avg_duration_minutes || 0)),
    },
    byStatus: statusRows.map((r) => ({
      status: r.status,
      count: Number(r.count || 0),
      estimatedRevenue: Number(Number(r.estimated_revenue || 0).toFixed(2)),
    })),
    timeline: timelineRows.map((t) => ({
      date: t.date_bucket ? new Date(t.date_bucket).toISOString().split('T')[0] : 'N/A',
      count: Number(t.total_reservations || 0),
      cancelledCount: Number(t.cancelled_count || 0),
      estimatedRevenue: Number(Number(t.estimated_revenue || 0).toFixed(2)),
    })),
    byLot: lotRows.map((l) => ({
      lotId: l.lot_id,
      lotName: l.lot_name,
      count: Number(l.reservation_count || 0),
      confirmedCount: Number(l.confirmed_count || 0),
      activeCount: Number(l.active_count || 0),
      completedCount: Number(l.completed_count || 0),
      cancelledCount: Number(l.cancelled_count || 0),
      estimatedRevenue: Number(Number(l.total_estimated_revenue || 0).toFixed(2)),
    })),
    pagination: {
      page,
      limit,
      totalRecords: totalReservations,
      totalPages: Math.ceil(totalReservations / limit) || 1,
    },
    records: records.map((rec) => ({
      id: rec.id,
      userId: rec.user_id,
      customerName: rec.customer_name,
      customerEmail: rec.customer_email,
      plateNumber: rec.plate_number,
      vehicleType: rec.vehicle_type,
      lotName: rec.lot_name,
      slotNumber: rec.slot_number,
      slotType: rec.slot_type,
      startTime: rec.start_time,
      endTime: rec.end_time,
      durationMinutes: rec.duration_minutes,
      hourlyRateSnapshot: Number(rec.hourly_rate_snapshot || 0),
      totalEstimatedFee: Number(rec.total_estimated_fee || 0),
      status: rec.status,
      createdAt: rec.created_at,
    })),
  };
}

// ─── 3. Parking Session Report ────────────────────────────────────────────────

export async function getSessionsReport(filters = {}) {
  const { startDate, endDate, lotId, status, page = 1, limit = 50, offset = 0 } = filters;

  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push('s.entry_time >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('s.entry_time <= ?');
    params.push(endDate);
  }
  if (lotId) {
    conditions.push('pl.id = ?');
    params.push(lotId);
  }
  if (status) {
    conditions.push('s.status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 1. Overall session summary
  // Uses strictly historical recorded total_fee and duration
  const summarySql = `
    SELECT
      COUNT(s.id) AS total_sessions,
      COALESCE(SUM(CASE WHEN s.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS active_sessions,
      COALESCE(SUM(CASE WHEN s.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_sessions,
      COALESCE(SUM(CASE WHEN s.status = 'COMPLETED' THEN s.total_fee ELSE 0 END), 0) AS total_recorded_fees,
      COALESCE(AVG(CASE WHEN s.status = 'COMPLETED' THEN s.total_fee END), 0) AS avg_completed_fee,
      COALESCE(AVG(CASE WHEN s.status = 'COMPLETED' AND s.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, s.entry_time, s.exit_time) END), 0) AS avg_duration_minutes,
      COALESCE(SUM(CASE WHEN s.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, s.entry_time, s.exit_time) ELSE TIMESTAMPDIFF(MINUTE, s.entry_time, NOW()) END), 0) AS total_duration_minutes
    FROM parking_sessions s
    JOIN parking_slots ps ON s.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
  `;

  // 2. Timeline aggregation (daily entry trends)
  const timelineSql = `
    SELECT
      DATE(s.entry_time) AS date_bucket,
      COUNT(s.id) AS total_sessions,
      COALESCE(SUM(CASE WHEN s.status = 'COMPLETED' THEN s.total_fee ELSE 0 END), 0) AS total_fees,
      COALESCE(AVG(CASE WHEN s.status = 'COMPLETED' AND s.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, s.entry_time, s.exit_time) END), 0) AS avg_duration_minutes
    FROM parking_sessions s
    JOIN parking_slots ps ON s.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
    GROUP BY DATE(s.entry_time)
    ORDER BY date_bucket DESC
    LIMIT 30
  `;

  // 3. Breakdown by parking lot
  const lotSql = `
    SELECT
      pl.id AS lot_id,
      pl.name AS lot_name,
      COUNT(s.id) AS total_sessions,
      COALESCE(SUM(CASE WHEN s.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS active_sessions,
      COALESCE(SUM(CASE WHEN s.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_sessions,
      COALESCE(SUM(CASE WHEN s.status = 'COMPLETED' THEN s.total_fee ELSE 0 END), 0) AS total_fees,
      COALESCE(AVG(CASE WHEN s.status = 'COMPLETED' AND s.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, s.entry_time, s.exit_time) END), 0) AS avg_duration_minutes
    FROM parking_sessions s
    JOIN parking_slots ps ON s.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
    GROUP BY pl.id, pl.name
    ORDER BY total_sessions DESC
  `;

  // 4. Detailed session records
  const detailsSql = `
    SELECT
      s.id,
      s.reservation_id,
      v.plate_number,
      v.vehicle_type,
      u.full_name AS customer_name,
      u.email AS customer_email,
      pl.name AS lot_name,
      ps.slot_number,
      ps.slot_type,
      s.entry_time,
      s.exit_time,
      CASE
        WHEN s.exit_time IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, s.entry_time, s.exit_time)
        ELSE TIMESTAMPDIFF(MINUTE, s.entry_time, NOW())
      END AS duration_minutes,
      s.hourly_rate_snapshot,
      s.total_fee,
      s.status,
      s.created_at
    FROM parking_sessions s
    JOIN vehicles v ON s.vehicle_id = v.id
    JOIN users u ON v.user_id = u.id
    JOIN parking_slots ps ON s.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
    ${whereClause}
    ORDER BY s.entry_time DESC
    LIMIT ? OFFSET ?
  `;

  const detailsParams = [...params, limit, offset];

  const [[summary = {}]] = await pool.query(summarySql, params);
  const [timelineRows] = await pool.query(timelineSql, params);
  const [lotRows] = await pool.query(lotSql, params);
  const [records] = await pool.query(detailsSql, detailsParams);

  const totalSessions = Number(summary.total_sessions || 0);
  const totalDurationMinutes = Number(summary.total_duration_minutes || 0);

  return {
    summary: {
      totalSessions,
      activeSessions: Number(summary.active_sessions || 0),
      completedSessions: Number(summary.completed_sessions || 0),
      totalRecordedFees: Number(Number(summary.total_recorded_fees || 0).toFixed(2)),
      avgCompletedFee: Number(Number(summary.avg_completed_fee || 0).toFixed(2)),
      avgDurationMinutes: Math.round(Number(summary.avg_duration_minutes || 0)),
      totalDurationHours: Number((totalDurationMinutes / 60).toFixed(1)),
    },
    timeline: timelineRows.map((t) => ({
      date: t.date_bucket ? new Date(t.date_bucket).toISOString().split('T')[0] : 'N/A',
      sessionsCount: Number(t.total_sessions || 0),
      totalFees: Number(Number(t.total_fees || 0).toFixed(2)),
      avgDurationMinutes: Math.round(Number(t.avg_duration_minutes || 0)),
    })),
    byLot: lotRows.map((l) => ({
      lotId: l.lot_id,
      lotName: l.lot_name,
      totalSessions: Number(l.total_sessions || 0),
      activeSessions: Number(l.active_sessions || 0),
      completedSessions: Number(l.completed_sessions || 0),
      totalFees: Number(Number(l.total_fees || 0).toFixed(2)),
      avgDurationMinutes: Math.round(Number(l.avg_duration_minutes || 0)),
    })),
    pagination: {
      page,
      limit,
      totalRecords: totalSessions,
      totalPages: Math.ceil(totalSessions / limit) || 1,
    },
    records: records.map((rec) => ({
      id: rec.id,
      reservationId: rec.reservation_id,
      plateNumber: rec.plate_number,
      vehicleType: rec.vehicle_type,
      customerName: rec.customer_name,
      customerEmail: rec.customer_email,
      lotName: rec.lot_name,
      slotNumber: rec.slot_number,
      slotType: rec.slot_type,
      entryTime: rec.entry_time,
      exitTime: rec.exit_time,
      durationMinutes: rec.duration_minutes,
      hourlyRateSnapshot: Number(rec.hourly_rate_snapshot || 0),
      totalFee: rec.total_fee !== null ? Number(rec.total_fee) : null,
      status: rec.status,
      createdAt: rec.created_at,
    })),
  };
}

// ─── 4. Demo Payment Report ───────────────────────────────────────────────────

export async function getDemoPaymentsReport(filters = {}) {
  const { startDate, endDate, lotId, demoMethod, status, page = 1, limit = 50, offset = 0 } = filters;

  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push('p.paid_at >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('p.paid_at <= ?');
    params.push(endDate);
  }
  if (lotId) {
    conditions.push('pl.id = ?');
    params.push(lotId);
  }
  if (demoMethod) {
    conditions.push('p.demo_method = ?');
    params.push(demoMethod);
  }
  if (status) {
    conditions.push('p.status = ?');
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const reportFromClause = `
    FROM payments p
    JOIN parking_sessions s ON p.session_id = s.id
    JOIN parking_slots ps ON s.slot_id = ps.id
    JOIN parking_lots pl ON ps.lot_id = pl.id
  `;

  // 1. Overview summary: excludes failed & refunded from successful simulated revenue!
  const summarySql = `
    SELECT
      COUNT(p.id) AS total_transactions,
      COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN 1 ELSE 0 END), 0) AS successful_count,
      COALESCE(SUM(CASE WHEN p.status = 'REFUNDED' THEN 1 ELSE 0 END), 0) AS refunded_count,
      COALESCE(SUM(CASE WHEN p.status = 'FAILED' THEN 1 ELSE 0 END), 0) AS failed_count,
      COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN p.amount ELSE 0 END), 0) AS successful_total_amount,
      COALESCE(AVG(CASE WHEN p.status = 'PAID' THEN p.amount END), 0) AS avg_successful_amount
    ${reportFromClause}
    ${whereClause}
  `;

  // 2. Breakdown by Demo Payment Method
  const methodSql = `
    SELECT
      p.demo_method,
      COUNT(p.id) AS transaction_count,
      COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN 1 ELSE 0 END), 0) AS successful_count,
      COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN p.amount ELSE 0 END), 0) AS successful_amount
    ${reportFromClause}
    ${whereClause}
    GROUP BY p.demo_method
    ORDER BY transaction_count DESC
  `;

  // 3. Breakdown over time (by date)
  const timelineSql = `
    SELECT
      DATE(p.paid_at) AS date_bucket,
      COUNT(p.id) AS transaction_count,
      COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN 1 ELSE 0 END), 0) AS successful_count,
      COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN p.amount ELSE 0 END), 0) AS successful_amount
    ${reportFromClause}
    ${whereClause}
    GROUP BY DATE(p.paid_at)
    ORDER BY date_bucket DESC
    LIMIT 30
  `;

  // 4. Detailed demo payment records
  const detailsSql = `
    SELECT
      p.id,
      p.session_id,
      p.transaction_reference,
      p.amount,
      p.demo_method,
      p.status,
      p.paid_at,
      p.created_at,
      v.plate_number,
      v.vehicle_type,
      u.full_name AS customer_name,
      u.email AS customer_email,
      pl.name AS lot_name,
      ps.slot_number
    ${reportFromClause}
    JOIN vehicles v ON s.vehicle_id = v.id
    JOIN users u ON v.user_id = u.id
    ${whereClause}
    ORDER BY p.paid_at DESC
    LIMIT ? OFFSET ?
  `;

  const detailsParams = [...params, limit, offset];

  const [[summary = {}]] = await pool.query(summarySql, params);
  const [methodRows] = await pool.query(methodSql, params);
  const [timelineRows] = await pool.query(timelineSql, params);
  const [records] = await pool.query(detailsSql, detailsParams);

  const totalTransactions = Number(summary.total_transactions || 0);

  return {
    isDemoTransaction: true,
    disclaimer: 'All payments shown are simulated demo transactions. No real financial transaction occurred.',
    summary: {
      totalTransactions,
      successfulCount: Number(summary.successful_count || 0),
      refundedCount: Number(summary.refunded_count || 0),
      failedCount: Number(summary.failed_count || 0),
      successfulTotalAmount: Number(Number(summary.successful_total_amount || 0).toFixed(2)),
      avgSuccessfulAmount: Number(Number(summary.avg_successful_amount || 0).toFixed(2)),
    },
    byMethod: methodRows.map((m) => ({
      demoMethod: m.demo_method,
      transactionCount: Number(m.transaction_count || 0),
      successfulCount: Number(m.successful_count || 0),
      successfulAmount: Number(Number(m.successful_amount || 0).toFixed(2)),
    })),
    timeline: timelineRows.map((t) => ({
      date: t.date_bucket ? new Date(t.date_bucket).toISOString().split('T')[0] : 'N/A',
      transactionCount: Number(t.transaction_count || 0),
      successfulCount: Number(t.successful_count || 0),
      successfulAmount: Number(Number(t.successful_amount || 0).toFixed(2)),
    })),
    pagination: {
      page,
      limit,
      totalRecords: totalTransactions,
      totalPages: Math.ceil(totalTransactions / limit) || 1,
    },
    records: records.map((rec) => ({
      id: rec.id,
      sessionId: rec.session_id,
      transactionReference: rec.transaction_reference,
      amount: Number(rec.amount || 0),
      demoMethod: rec.demo_method,
      status: rec.status,
      paidAt: rec.paid_at,
      createdAt: rec.created_at,
      plateNumber: rec.plate_number,
      vehicleType: rec.vehicle_type,
      customerName: rec.customer_name,
      customerEmail: rec.customer_email,
      lotName: rec.lot_name,
      slotNumber: rec.slot_number,
      isDemoTransaction: true,
    })),
  };
}

// ─── 5. Combined Dashboard Summary Report ─────────────────────────────────────

export async function getDashboardSummaryReport() {
  const [occupancy, reservations, sessions, payments] = await Promise.all([
    getOccupancyReport(),
    getReservationsReport({ limit: 1 }),
    getSessionsReport({ limit: 1 }),
    getDemoPaymentsReport({ limit: 1 }),
  ]);

  return {
    occupancy: occupancy.summary,
    reservations: reservations.summary,
    sessions: sessions.summary,
    demoPayments: {
      ...payments.summary,
      isDemoTransaction: true,
      disclaimer: payments.disclaimer,
    },
  };
}
