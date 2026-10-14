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
-- All operational and payment values below are synthetic; existing users are unchanged.
-- =============================================================================

-- 1.1 Parking Lots
INSERT IGNORE INTO parking_lots (id, name, address, total_capacity, status) VALUES
(1, 'Bashundhara City Parking', 'Panthapath, Dhaka', 120, 'ACTIVE'),
(2, 'Jamuna Future Park Parking', 'Kuril, Dhaka', 150, 'ACTIVE'),
(3, 'Dhanmondi Lake Parking', 'Dhanmondi, Dhaka', 48, 'ACTIVE'),
(4, 'Gulshan Avenue Parking', 'Gulshan-1, Dhaka', 72, 'ACTIVE'),
(5, 'Mirpur Shopping Complex Parking', 'Mirpur-10, Dhaka', 56, 'ACTIVE'),
(6, 'Uttara Sector 7 Parking', 'Sector 7, Uttara, Dhaka', 80, 'ACTIVE');

-- Representative sample bays across each facility; capacity reflects the full facility.
INSERT IGNORE INTO parking_slots (id, lot_id, slot_number, slot_type, status) VALUES
(1, 1, 'BC-A01', 'STANDARD_CAR', 'AVAILABLE'),
(2, 1, 'BC-A02', 'STANDARD_CAR', 'AVAILABLE'),
(3, 1, 'BC-B01', 'SUV', 'AVAILABLE'),
(4, 1, 'BC-B02', 'SUV', 'AVAILABLE'),
(5, 1, 'BC-C01', 'MOTORCYCLE', 'AVAILABLE'),
(6, 1, 'BC-C02', 'MOTORCYCLE', 'AVAILABLE'),
(7, 1, 'BC-D01', 'VAN', 'AVAILABLE'),
(8, 1, 'BC-D02', 'TRUCK', 'AVAILABLE'),
(9, 1, 'BC-E01', 'STANDARD_CAR', 'MAINTENANCE'),
(10, 1, 'BC-E02', 'STANDARD_CAR', 'INACTIVE'),
(11, 2, 'JFP-A01', 'STANDARD_CAR', 'AVAILABLE'),
(12, 2, 'JFP-A02', 'STANDARD_CAR', 'AVAILABLE'),
(13, 2, 'JFP-B01', 'SUV', 'AVAILABLE'),
(14, 2, 'JFP-B02', 'SUV', 'AVAILABLE'),
(15, 2, 'JFP-C01', 'MOTORCYCLE', 'AVAILABLE'),
(16, 2, 'JFP-C02', 'MOTORCYCLE', 'AVAILABLE'),
(17, 2, 'JFP-D01', 'VAN', 'AVAILABLE'),
(18, 2, 'JFP-D02', 'TRUCK', 'AVAILABLE'),
(19, 2, 'JFP-E01', 'STANDARD_CAR', 'MAINTENANCE'),
(20, 2, 'JFP-E02', 'STANDARD_CAR', 'INACTIVE'),
(21, 3, 'DHA-A01', 'STANDARD_CAR', 'AVAILABLE'),
(22, 3, 'DHA-A02', 'STANDARD_CAR', 'AVAILABLE'),
(23, 3, 'DHA-B01', 'SUV', 'AVAILABLE'),
(24, 3, 'DHA-B02', 'SUV', 'AVAILABLE'),
(25, 3, 'DHA-C01', 'MOTORCYCLE', 'AVAILABLE'),
(26, 3, 'DHA-C02', 'MOTORCYCLE', 'AVAILABLE'),
(27, 3, 'DHA-D01', 'VAN', 'AVAILABLE'),
(28, 3, 'DHA-D02', 'TRUCK', 'AVAILABLE'),
(29, 3, 'DHA-E01', 'STANDARD_CAR', 'MAINTENANCE'),
(30, 3, 'DHA-E02', 'STANDARD_CAR', 'INACTIVE'),
(31, 4, 'GUL-A01', 'STANDARD_CAR', 'AVAILABLE'),
(32, 4, 'GUL-A02', 'STANDARD_CAR', 'AVAILABLE'),
(33, 4, 'GUL-B01', 'SUV', 'AVAILABLE'),
(34, 4, 'GUL-B02', 'SUV', 'AVAILABLE'),
(35, 4, 'GUL-C01', 'MOTORCYCLE', 'AVAILABLE'),
(36, 4, 'GUL-C02', 'MOTORCYCLE', 'AVAILABLE'),
(37, 4, 'GUL-D01', 'VAN', 'AVAILABLE'),
(38, 4, 'GUL-D02', 'TRUCK', 'AVAILABLE'),
(39, 4, 'GUL-E01', 'STANDARD_CAR', 'MAINTENANCE'),
(40, 4, 'GUL-E02', 'STANDARD_CAR', 'INACTIVE'),
(41, 5, 'MIR-A01', 'STANDARD_CAR', 'AVAILABLE'),
(42, 5, 'MIR-A02', 'STANDARD_CAR', 'AVAILABLE'),
(43, 5, 'MIR-B01', 'SUV', 'AVAILABLE'),
(44, 5, 'MIR-B02', 'SUV', 'AVAILABLE'),
(45, 5, 'MIR-C01', 'MOTORCYCLE', 'AVAILABLE'),
(46, 5, 'MIR-C02', 'MOTORCYCLE', 'AVAILABLE'),
(47, 5, 'MIR-D01', 'VAN', 'AVAILABLE'),
(48, 5, 'MIR-D02', 'TRUCK', 'AVAILABLE'),
(49, 5, 'MIR-E01', 'STANDARD_CAR', 'MAINTENANCE'),
(50, 5, 'MIR-E02', 'STANDARD_CAR', 'INACTIVE'),
(51, 6, 'UTT-A01', 'STANDARD_CAR', 'AVAILABLE'),
(52, 6, 'UTT-A02', 'STANDARD_CAR', 'AVAILABLE'),
(53, 6, 'UTT-B01', 'SUV', 'AVAILABLE'),
(54, 6, 'UTT-B02', 'SUV', 'AVAILABLE'),
(55, 6, 'UTT-C01', 'MOTORCYCLE', 'AVAILABLE'),
(56, 6, 'UTT-C02', 'MOTORCYCLE', 'AVAILABLE'),
(57, 6, 'UTT-D01', 'VAN', 'AVAILABLE'),
(58, 6, 'UTT-D02', 'TRUCK', 'AVAILABLE'),
(59, 6, 'UTT-E01', 'STANDARD_CAR', 'MAINTENANCE'),
(60, 6, 'UTT-E02', 'STANDARD_CAR', 'INACTIVE');

-- 1.3 Vehicles linked to the existing customer IDs.
INSERT IGNORE INTO vehicles (id, user_id, plate_number, vehicle_type, make_model) VALUES
(1, 1, 'DHAKA METRO-GA-11-2233', 'STANDARD_CAR', 'Toyota Corolla 2021'),
(2, 1, 'DHAKA METRO-GHA-15-7788', 'SUV', 'Honda Vezel 2020'),
(3, 2, 'DHAKA METRO-HA-12-8899', 'MOTORCYCLE', 'Yamaha FZ-S V3');

INSERT IGNORE INTO pricing_rules (id, vehicle_type, hourly_rate, effective_from, effective_to, is_active) VALUES
(1, 'MOTORCYCLE', 40.00, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, TRUE),
(2, 'STANDARD_CAR', 80.00, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, TRUE),
(3, 'SUV', 100.00, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, TRUE),
(4, 'VAN', 110.00, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, TRUE),
(5, 'TRUCK', 130.00, DATE_SUB(NOW(), INTERVAL 30 DAY), NULL, TRUE);

-- 1.4 Historical, active, upcoming, and cancelled reservations.
INSERT IGNORE INTO reservations (id, user_id, vehicle_id, slot_id, start_time, end_time, hourly_rate_snapshot, total_estimated_fee, status) VALUES
(1, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 HOUR, 80.00, 160.00, 'COMPLETED'),
(2, 1, 2, 13, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 3 HOUR, 100.00, 300.00, 'COMPLETED'),
(3, 1, 1, 2, DATE_SUB(NOW(), INTERVAL 45 MINUTE), NOW() + INTERVAL 135 MINUTE, 80.00, 240.00, 'ACTIVE'),
(4, 2, 3, 15, NOW() + INTERVAL 2 HOUR, NOW() + INTERVAL 4 HOUR, 40.00, 80.00, 'CONFIRMED'),
(5, 1, 1, 11, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY) + INTERVAL 2 HOUR, 80.00, 160.00, 'CANCELLED'),
(6, 2, 3, 16, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR, 40.00, 120.00, 'COMPLETED');

-- 1.5 Completed and active sessions linked to their matching reservations.
INSERT IGNORE INTO parking_sessions (id, reservation_id, vehicle_id, slot_id, entry_time, exit_time, hourly_rate_snapshot, total_fee, status) VALUES
(1, 1, 1, 1, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 HOUR, 80.00, 160.00, 'COMPLETED'),
(2, 2, 2, 13, DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 3 HOUR, 100.00, 300.00, 'COMPLETED'),
(3, 3, 1, 2, DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 80.00, NULL, 'ACTIVE'),
(4, 6, 3, 16, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR, 40.00, 120.00, 'COMPLETED');

-- 1.6 Synthetic simulated payments; no live payment provider is contacted.
INSERT IGNORE INTO payments (id, session_id, amount, demo_method, status, transaction_reference, paid_at) VALUES
(1, 1, 160.00, 'SIMULATED_CARD', 'PAID', CONCAT('TXN-', DATE_FORMAT(NOW(), '%Y%m%d'), '-8F3K21'), DATE_SUB(NOW(), INTERVAL 3 DAY) + INTERVAL 2 HOUR),
(2, 2, 300.00, 'SIMULATED_MOBILE_WALLET', 'PAID', CONCAT('TXN-', DATE_FORMAT(NOW(), '%Y%m%d'), '-M9P742'), DATE_SUB(NOW(), INTERVAL 2 DAY) + INTERVAL 3 HOUR),
(3, 4, 120.00, 'SIMULATED_MOBILE_WALLET', 'PAID', CONCAT('PAY-', DATE_FORMAT(NOW(), '%Y%m%d'), '-A72K91'), DATE_SUB(NOW(), INTERVAL 1 DAY) + INTERVAL 3 HOUR);


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
