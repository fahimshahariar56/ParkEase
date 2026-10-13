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

