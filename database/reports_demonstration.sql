-- =============================================================================
-- ParkEase — Smart Parking Slot Management System
-- Day 22: Academic Database Demonstration & SQL Reporting Evidence
-- Database: MySQL 8+ (InnoDB)
-- =============================================================================
-- This script provides structured SQL evidence demonstrating:
-- 1. Schema integrity & foreign key constraints
-- 2. Multi-table JOIN operations (INNER & LEFT OUTER JOIN)
-- 3. Aggregate functions (COUNT, SUM, AVG, MIN, MAX, COALESCE, ROUND)
-- 4. Grouping & filtering (GROUP BY and HAVING)
-- 5. Conditional aggregation (CASE WHEN ... THEN ...)
-- 6. Correlated subqueries and Common Table Expressions (CTEs)
-- 7. Reporting Views for dashboard and analytical queries
-- 8. Query execution plan verification (EXPLAIN)
-- 9. Non-destructive demonstration seed data (INSERT IGNORE)
-- =============================================================================

USE parkease_db;

-- =============================================================================
-- PART 1: OPTIONAL SEED DATA FOR DEMONSTRATION (NON-DESTRUCTIVE)
-- Populates representative records if not already present.
-- =============================================================================

-- 1.1 Parking Lots
INSERT IGNORE INTO parking_lots (id, name, address, total_capacity, status) VALUES
(1, 'Central Plaza Garage', '101 Main Street, Downtown', 20, 'ACTIVE'),
(2, 'Northside Commuter Hub', '450 North Avenue, Uptown', 15, 'ACTIVE'),
(3, 'Metro Transit Bay', '12 Terminal Road, Metro Station', 10, 'ACTIVE');

-- 1.2 Parking Slots for Central Plaza Garage (Lot 1)
INSERT IGNORE INTO parking_slots (id, lot_id, slot_number, slot_type, status) VALUES
(1, 1, 'CP-01', 'STANDARD_CAR', 'AVAILABLE'),
(2, 1, 'CP-02', 'STANDARD_CAR', 'AVAILABLE'),
(3, 1, 'CP-03', 'STANDARD_CAR', 'AVAILABLE'),
(4, 1, 'CP-04', 'SUV', 'AVAILABLE'),
(5, 1, 'CP-05', 'SUV', 'AVAILABLE'),
(6, 1, 'CP-06', 'VAN', 'AVAILABLE'),
(7, 1, 'CP-07', 'MOTORCYCLE', 'AVAILABLE'),
(8, 1, 'CP-08', 'MOTORCYCLE', 'AVAILABLE'),
(9, 1, 'CP-09', 'TRUCK', 'MAINTENANCE'),
(10, 1, 'CP-10', 'STANDARD_CAR', 'INACTIVE');

-- 1.3 Parking Slots for Northside Commuter Hub (Lot 2)
INSERT IGNORE INTO parking_slots (id, lot_id, slot_number, slot_type, status) VALUES
(11, 2, 'NS-01', 'STANDARD_CAR', 'AVAILABLE'),
(12, 2, 'NS-02', 'STANDARD_CAR', 'AVAILABLE'),
(13, 2, 'NS-03', 'SUV', 'AVAILABLE'),
(14, 2, 'NS-04', 'MOTORCYCLE', 'AVAILABLE'),
(15, 2, 'NS-05', 'STANDARD_CAR', 'AVAILABLE');

-- 1.4 Vehicles for Registered Customer (Fahim - user_id 1)
INSERT IGNORE INTO vehicles (id, user_id, plate_number, vehicle_type, make_model) VALUES
(1, 1, 'DHK-METRO-GA-1122', 'STANDARD_CAR', 'Toyota Corolla 2022'),
(2, 1, 'DHK-METRO-KHA-4455', 'SUV', 'Honda CR-V 2023'),
(3, 2, 'CTG-METRO-HA-8899', 'MOTORCYCLE', 'Yamaha FZ-S 2021');

-- 1.5 Historical & Active Reservations
INSERT IGNORE INTO reservations (id, user_id, vehicle_id, slot_id, start_time, end_time, hourly_rate_snapshot, total_estimated_fee, status) VALUES
(1, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 2 HOUR, 4.00, 8.00, 'COMPLETED'),
(2, 1, 2, 4, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR, 5.50, 16.50, 'COMPLETED'),
(3, 1, 1, 2, DATE_SUB(NOW(), INTERVAL 1 HOUR), NOW() + INTERVAL 2 HOUR, 4.00, 12.00, 'ACTIVE'),
(4, 2, 3, 7, NOW() + INTERVAL 1 HOUR, NOW() + INTERVAL 3 HOUR, 2.00, 4.00, 'CONFIRMED'),
(5, 1, 1, 3, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 HOUR, 4.00, 8.00, 'CANCELLED');

-- 1.6 Parking Sessions (Historical & Ongoing)
INSERT IGNORE INTO parking_sessions (id, reservation_id, vehicle_id, slot_id, entry_time, exit_time, hourly_rate_snapshot, total_fee, status) VALUES
(1, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 2 HOUR, 4.00, 8.00, 'COMPLETED'),
(2, 2, 2, 4, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR, 5.50, 16.50, 'COMPLETED'),
(3, 3, 1, 2, DATE_SUB(NOW(), INTERVAL 1 HOUR), NULL, 4.00, NULL, 'ACTIVE');

-- 1.7 Simulated Demo Payments (Strictly Demo)
INSERT IGNORE INTO payments (id, session_id, amount, demo_method, status, transaction_reference, paid_at) VALUES
(1, 1, 8.00, 'SIMULATED_CARD', 'PAID', 'DEMO-TXN-20261012-001', DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 2 HOUR),
(2, 2, 16.50, 'SIMULATED_MOBILE_WALLET', 'PAID', 'DEMO-TXN-20261013-002', DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR);


-- =============================================================================
-- PART 2: MULTI-TABLE JOIN OPERATIONS
-- Demonstrates INNER and LEFT OUTER JOIN across 6 core tables.
-- =============================================================================

-- Query 2.1: Full Operational Audit Trail
-- Joins: users -> vehicles -> reservations -> parking_sessions -> payments -> slots -> lots
SELECT
  p.transaction_reference AS demo_reference,
  u.full_name AS customer_name,
  u.email AS customer_email,
  v.plate_number,
  v.vehicle_type,
  pl.name AS lot_name,
  ps.slot_number,
  s.entry_time,
  s.exit_time,
  TIMESTAMPDIFF(MINUTE, s.entry_time, s.exit_time) AS duration_minutes,
  s.hourly_rate_snapshot,
  p.amount AS simulated_payment,
  p.demo_method,
  p.status AS payment_status
FROM payments p
INNER JOIN parking_sessions s ON p.session_id = s.id
INNER JOIN vehicles v ON s.vehicle_id = v.id
INNER JOIN users u ON v.user_id = u.id
INNER JOIN parking_slots ps ON s.slot_id = ps.id
INNER JOIN parking_lots pl ON ps.lot_id = pl.id
ORDER BY p.paid_at DESC;


-- =============================================================================
-- PART 3: AGGREGATE FUNCTIONS & METRICS
-- Demonstrates COUNT, SUM, AVG, MIN, MAX, COALESCE, and ROUND.
-- =============================================================================

-- Query 3.1: Session Duration and Financial Aggregates
SELECT
  COUNT(s.id) AS total_recorded_sessions,
  COALESCE(SUM(CASE WHEN s.status = 'COMPLETED' THEN s.total_fee ELSE 0 END), 0) AS total_completed_revenue,
  ROUND(COALESCE(AVG(CASE WHEN s.status = 'COMPLETED' THEN s.total_fee END), 0), 2) AS avg_completed_fee,
  ROUND(COALESCE(AVG(CASE WHEN s.status = 'COMPLETED' THEN TIMESTAMPDIFF(MINUTE, s.entry_time, s.exit_time) END), 0), 0) AS avg_duration_minutes,
  MIN(s.hourly_rate_snapshot) AS min_applied_rate,
  MAX(s.hourly_rate_snapshot) AS max_applied_rate
FROM parking_sessions s;


-- =============================================================================
-- PART 4: GROUP BY AND HAVING
-- Demonstrates aggregation by facility and filtering on aggregate thresholds.
-- =============================================================================

-- Query 4.1: Facility Occupancy & Capacity Utilization with HAVING
-- Identifies facilities that have at least 1 active bay and calculates occupancy percentage.
SELECT
  pl.id AS lot_id,
  pl.name AS lot_name,
  pl.total_capacity,
  COUNT(ps.id) AS total_installed_slots,
  COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND sess.is_active = 1 THEN 1 ELSE 0 END), 0) AS occupied_slots,
  COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (sess.is_active IS NULL OR sess.is_active = 0) THEN 1 ELSE 0 END), 0) AS available_slots,
  ROUND((COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND sess.is_active = 1 THEN 1 ELSE 0 END), 0) / COUNT(ps.id)) * 100, 1) AS occupancy_rate_percent
FROM parking_lots pl
INNER JOIN parking_slots ps ON pl.id = ps.lot_id
LEFT JOIN (
  SELECT slot_id, 1 AS is_active
  FROM parking_sessions
  WHERE status = 'ACTIVE' AND exit_time IS NULL
  GROUP BY slot_id
) sess ON ps.id = sess.slot_id
GROUP BY pl.id, pl.name, pl.total_capacity
HAVING COUNT(ps.id) > 0
ORDER BY occupancy_rate_percent DESC;


-- =============================================================================
-- PART 5: CONDITIONAL AGGREGATION & STATUS DISTRIBUTION
-- Demonstrates CASE WHEN ... THEN ... inside aggregate functions.
-- =============================================================================

-- Query 5.1: Reservation Status Breakdown & Cancellation Statistics
SELECT
  COUNT(r.id) AS total_reservations,
  COALESCE(SUM(CASE WHEN r.status = 'CONFIRMED' THEN 1 ELSE 0 END), 0) AS confirmed_count,
  COALESCE(SUM(CASE WHEN r.status = 'ACTIVE' THEN 1 ELSE 0 END), 0) AS active_count,
  COALESCE(SUM(CASE WHEN r.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_count,
  COALESCE(SUM(CASE WHEN r.status = 'CANCELLED' THEN 1 ELSE 0 END), 0) AS cancelled_count,
  COALESCE(SUM(CASE WHEN r.status = 'NO_SHOW' THEN 1 ELSE 0 END), 0) AS no_show_count,
  ROUND((COALESCE(SUM(CASE WHEN r.status = 'CANCELLED' THEN 1 ELSE 0 END), 0) / COUNT(r.id)) * 100, 1) AS cancellation_rate_percent,
  ROUND(COALESCE(SUM(r.total_estimated_fee), 0), 2) AS total_estimated_value
FROM reservations r;


-- =============================================================================
-- PART 6: CORRELATED SUBQUERIES AND COMMON TABLE EXPRESSIONS (CTEs)
-- Demonstrates CTEs for daily running totals without join multiplication.
-- =============================================================================

-- Query 6.1: CTE for Daily Session Inflow and Recorded Revenue
WITH DailySessionSummary AS (
  SELECT
    DATE(entry_time) AS session_date,
    COUNT(id) AS total_sessions,
    COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN total_fee ELSE 0 END), 0) AS total_fees,
    COALESCE(AVG(CASE WHEN status = 'COMPLETED' THEN TIMESTAMPDIFF(MINUTE, entry_time, exit_time) END), 0) AS avg_duration
  FROM parking_sessions
  GROUP BY DATE(entry_time)
)
SELECT
  session_date,
  total_sessions,
  ROUND(total_fees, 2) AS total_fees,
  ROUND(avg_duration, 0) AS avg_duration_minutes
FROM DailySessionSummary
ORDER BY session_date DESC;


-- =============================================================================
-- PART 7: ACADEMIC DATABASE REPORTING VIEWS
-- Safe reporting views for fast dashboard querying.
-- =============================================================================

-- View 7.1: Real-time Facility Occupancy View
CREATE OR REPLACE VIEW vw_occupancy_by_lot AS
SELECT
  pl.id AS lot_id,
  pl.name AS lot_name,
  pl.address AS lot_address,
  pl.total_capacity,
  COUNT(ps.id) AS total_slots,
  COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND s.is_occupied = 1 THEN 1 ELSE 0 END), 0) AS occupied_slots,
  COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied IS NULL OR s.is_occupied = 0) AND r.is_reserved = 1 THEN 1 ELSE 0 END), 0) AS reserved_slots,
  COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied IS NULL OR s.is_occupied = 0) AND (r.is_reserved IS NULL OR r.is_reserved = 0) THEN 1 ELSE 0 END), 0) AS available_slots,
  COALESCE(SUM(CASE WHEN ps.status = 'MAINTENANCE' THEN 1 ELSE 0 END), 0) AS maintenance_slots,
  COALESCE(SUM(CASE WHEN ps.status = 'INACTIVE' THEN 1 ELSE 0 END), 0) AS inactive_slots,
  ROUND(
    (COALESCE(SUM(CASE WHEN ps.status = 'AVAILABLE' AND (s.is_occupied = 1 OR r.is_reserved = 1) THEN 1 ELSE 0 END), 0) / COUNT(ps.id)) * 100,
    1
  ) AS total_utilization_percent
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
GROUP BY pl.id, pl.name, pl.address, pl.total_capacity;

-- View 7.2: Daily Demo Revenue View (Strictly Demo)
CREATE OR REPLACE VIEW vw_demo_daily_revenue AS
SELECT
  DATE(p.paid_at) AS transaction_date,
  p.demo_method,
  COUNT(p.id) AS transaction_count,
  COALESCE(SUM(CASE WHEN p.status = 'PAID' THEN p.amount ELSE 0 END), 0) AS successful_simulated_total,
  TRUE AS is_demo_transaction
FROM payments p
GROUP BY DATE(p.paid_at), p.demo_method;


-- =============================================================================
-- PART 8: QUERY EXECUTION PLAN VERIFICATION (EXPLAIN)
-- Demonstrates query optimization using index lookups.
-- =============================================================================

-- Explain 8.1: Verifies index usage on session entry_time range query
EXPLAIN SELECT id, vehicle_id, slot_id, total_fee
FROM parking_sessions
WHERE entry_time >= DATE_SUB(NOW(), INTERVAL 7 DAY);

-- Explain 8.2: Verifies index usage on demo payment timestamp lookup
EXPLAIN SELECT id, amount, demo_method, status
FROM payments
WHERE paid_at >= DATE_SUB(NOW(), INTERVAL 30 DAY);
