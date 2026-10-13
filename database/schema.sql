-- ParkEase Smart Parking Slot Management System
-- Database Schema: users, vehicles, and core foundations

CREATE DATABASE IF NOT EXISTS parkease_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE parkease_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  phone VARCHAR(30) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vehicles table
-- One customer can own multiple vehicles; plate_number is unique per user.
CREATE TABLE IF NOT EXISTS vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  plate_number VARCHAR(50) NOT NULL,
  vehicle_type ENUM('MOTORCYCLE', 'STANDARD_CAR', 'SUV', 'VAN', 'TRUCK') NOT NULL DEFAULT 'STANDARD_CAR',
  make_model VARCHAR(100) NULL COMMENT 'Optional: e.g. Toyota Corolla',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_plate (user_id, plate_number),
  INDEX idx_vehicles_user_id (user_id),
  CONSTRAINT fk_vehicles_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parking Lots table
CREATE TABLE IF NOT EXISTS parking_lots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  total_capacity INT NOT NULL DEFAULT 0,
  status ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_parking_lots_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parking Slots table
CREATE TABLE IF NOT EXISTS parking_slots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lot_id INT NOT NULL,
  slot_number VARCHAR(20) NOT NULL,
  slot_type ENUM('MOTORCYCLE', 'STANDARD_CAR', 'SUV', 'VAN', 'TRUCK') NOT NULL DEFAULT 'STANDARD_CAR',
  status ENUM('AVAILABLE', 'MAINTENANCE', 'INACTIVE') NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_lot_slot_number (lot_id, slot_number),
  INDEX idx_parking_slots_lot_id (lot_id),
  INDEX idx_parking_slots_type (slot_type),
  INDEX idx_parking_slots_status (status),
  CONSTRAINT fk_slots_lot
    FOREIGN KEY (lot_id) REFERENCES parking_lots (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pricing Rules table
CREATE TABLE IF NOT EXISTS pricing_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  vehicle_type ENUM('MOTORCYCLE', 'STANDARD_CAR', 'SUV', 'VAN', 'TRUCK') NOT NULL,
  hourly_rate DECIMAL(10, 2) NOT NULL,
  effective_from TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  effective_to TIMESTAMP NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_pricing_rules_type (vehicle_type),
  INDEX idx_pricing_rules_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  vehicle_id INT NOT NULL,
  slot_id INT NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  hourly_rate_snapshot DECIMAL(10, 2) NOT NULL,
  total_estimated_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'CONFIRMED',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_res_slot_time (slot_id, start_time, end_time),
  INDEX idx_res_user (user_id),
  INDEX idx_res_vehicle (vehicle_id),
  INDEX idx_res_status (status),
  CONSTRAINT fk_reservations_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_reservations_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_reservations_slot
    FOREIGN KEY (slot_id) REFERENCES parking_slots (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Parking Sessions table (Day 20)
CREATE TABLE IF NOT EXISTS parking_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT NULL UNIQUE,
  vehicle_id INT NOT NULL,
  slot_id INT NOT NULL,
  entry_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  exit_time TIMESTAMP NULL,
  hourly_rate_snapshot DECIMAL(10, 2) NOT NULL,
  total_fee DECIMAL(10, 2) NULL,
  status ENUM('ACTIVE', 'COMPLETED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sessions_slot (slot_id),
  INDEX idx_sessions_vehicle (vehicle_id),
  INDEX idx_sessions_status (status),
  INDEX idx_sessions_entry_time (entry_time),
  CONSTRAINT fk_sessions_reservation
    FOREIGN KEY (reservation_id) REFERENCES reservations (id)
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_sessions_vehicle
    FOREIGN KEY (vehicle_id) REFERENCES vehicles (id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_sessions_slot
    FOREIGN KEY (slot_id) REFERENCES parking_slots (id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Payments table (Day 21: Simulated Demo Payments)
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  demo_method ENUM('SIMULATED_CARD', 'SIMULATED_MOBILE_WALLET', 'SIMULATED_CASH') NOT NULL DEFAULT 'SIMULATED_CARD',
  status ENUM('PAID', 'REFUNDED', 'FAILED') NOT NULL DEFAULT 'PAID',
  transaction_reference VARCHAR(100) NOT NULL UNIQUE,
  paid_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_payments_session (session_id),
  INDEX idx_payments_status (status),
  INDEX idx_payments_paid_at (paid_at),
  CONSTRAINT fk_payments_session
    FOREIGN KEY (session_id) REFERENCES parking_sessions (id)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


