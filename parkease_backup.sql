-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: parkease_db
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `parking_lots`
--

DROP TABLE IF EXISTS `parking_lots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking_lots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `address` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_capacity` int NOT NULL DEFAULT '0',
  `status` enum('ACTIVE','INACTIVE','MAINTENANCE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_parking_lots_name` (`name`),
  KEY `idx_parking_lots_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking_lots`
--

LOCK TABLES `parking_lots` WRITE;
/*!40000 ALTER TABLE `parking_lots` DISABLE KEYS */;
INSERT INTO `parking_lots` VALUES (1,'Bashundhara City Parking','Panthapath, Dhaka',120,'ACTIVE',NOW(),NOW()),(2,'Jamuna Future Park Parking','Kuril, Dhaka',150,'ACTIVE',NOW(),NOW()),(3,'Dhanmondi Lake Parking','Dhanmondi, Dhaka',48,'ACTIVE',NOW(),NOW());
/*!40000 ALTER TABLE `parking_lots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parking_sessions`
--

DROP TABLE IF EXISTS `parking_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reservation_id` int DEFAULT NULL,
  `vehicle_id` int NOT NULL,
  `slot_id` int NOT NULL,
  `entry_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `exit_time` timestamp NULL DEFAULT NULL,
  `hourly_rate_snapshot` decimal(10,2) NOT NULL,
  `total_fee` decimal(10,2) DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservation_id` (`reservation_id`),
  KEY `idx_sessions_slot` (`slot_id`),
  KEY `idx_sessions_vehicle` (`vehicle_id`),
  KEY `idx_sessions_status` (`status`),
  KEY `idx_sessions_entry_time` (`entry_time`),
  CONSTRAINT `fk_sessions_reservation` FOREIGN KEY (`reservation_id`) REFERENCES `reservations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sessions_slot` FOREIGN KEY (`slot_id`) REFERENCES `parking_slots` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_sessions_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking_sessions`
--

LOCK TABLES `parking_sessions` WRITE;
/*!40000 ALTER TABLE `parking_sessions` DISABLE KEYS */;
INSERT INTO `parking_sessions` VALUES (1,1,1,1,DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY)+INTERVAL 2 HOUR,80.00,160.00,'COMPLETED',NOW(),NOW()),(2,2,2,4,DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY)+INTERVAL 3 HOUR,100.00,300.00,'COMPLETED',NOW(),NOW()),(3,3,1,2,DATE_SUB(NOW(),INTERVAL 45 MINUTE),NULL,80.00,NULL,'ACTIVE',NOW(),NOW()),(4,6,3,8,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY)+INTERVAL 3 HOUR,40.00,120.00,'COMPLETED',NOW(),NOW());
/*!40000 ALTER TABLE `parking_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `parking_slots`
--

DROP TABLE IF EXISTS `parking_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `parking_slots` (
  `id` int NOT NULL AUTO_INCREMENT,
  `lot_id` int NOT NULL,
  `slot_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `slot_type` enum('MOTORCYCLE','STANDARD_CAR','SUV','VAN','TRUCK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STANDARD_CAR',
  `status` enum('AVAILABLE','MAINTENANCE','INACTIVE') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'AVAILABLE',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_lot_slot_number` (`lot_id`,`slot_number`),
  KEY `idx_parking_slots_lot_id` (`lot_id`),
  KEY `idx_parking_slots_type` (`slot_type`),
  KEY `idx_parking_slots_status` (`status`),
  CONSTRAINT `fk_slots_lot` FOREIGN KEY (`lot_id`) REFERENCES `parking_lots` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `parking_slots`
--

LOCK TABLES `parking_slots` WRITE;
/*!40000 ALTER TABLE `parking_slots` DISABLE KEYS */;
INSERT INTO `parking_slots` VALUES (1,1,'BC-A01','STANDARD_CAR','AVAILABLE',NOW(),NOW()),(2,1,'BC-A02','STANDARD_CAR','AVAILABLE',NOW(),NOW()),(3,1,'BC-B01','SUV','AVAILABLE',NOW(),NOW()),(4,1,'BC-B02','SUV','AVAILABLE',NOW(),NOW()),(5,1,'BC-C01','VAN','AVAILABLE',NOW(),NOW()),(6,1,'BC-C02','MOTORCYCLE','AVAILABLE',NOW(),NOW()),(7,1,'BC-D01','MOTORCYCLE','AVAILABLE',NOW(),NOW()),(8,1,'BC-D02','MOTORCYCLE','AVAILABLE',NOW(),NOW()),(9,1,'BC-E01','TRUCK','MAINTENANCE',NOW(),NOW()),(10,1,'BC-E02','STANDARD_CAR','INACTIVE',NOW(),NOW()),(11,2,'JFP-A01','STANDARD_CAR','AVAILABLE',NOW(),NOW()),(12,2,'JFP-A02','STANDARD_CAR','AVAILABLE',NOW(),NOW()),(13,2,'JFP-B01','SUV','AVAILABLE',NOW(),NOW()),(14,2,'JFP-C01','MOTORCYCLE','AVAILABLE',NOW(),NOW()),(15,2,'JFP-A03','STANDARD_CAR','AVAILABLE',NOW(),NOW()),(16,3,'DHA-A01','STANDARD_CAR','AVAILABLE',NOW(),NOW()),(17,3,'DHA-B01','SUV','AVAILABLE',NOW(),NOW()),(18,3,'DHA-C01','MOTORCYCLE','AVAILABLE',NOW(),NOW()),(19,3,'DHA-D01','VAN','AVAILABLE',NOW(),NOW()),(20,3,'DHA-E01','STANDARD_CAR','MAINTENANCE',NOW(),NOW());
/*!40000 ALTER TABLE `parking_slots` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `session_id` int NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `demo_method` enum('SIMULATED_CARD','SIMULATED_MOBILE_WALLET','SIMULATED_CASH') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SIMULATED_CARD',
  `status` enum('PAID','REFUNDED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PAID',
  `transaction_reference` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `paid_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transaction_reference` (`transaction_reference`),
  KEY `idx_payments_session` (`session_id`),
  KEY `idx_payments_status` (`status`),
  KEY `idx_payments_paid_at` (`paid_at`),
  CONSTRAINT `fk_payments_session` FOREIGN KEY (`session_id`) REFERENCES `parking_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments`
--

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;
INSERT INTO `payments` VALUES (1,1,160.00,'SIMULATED_CARD','PAID',CONCAT('TXN-',DATE_FORMAT(NOW(),'%Y%m%d'),'-8F3K21'),DATE_SUB(NOW(),INTERVAL 3 DAY)+INTERVAL 2 HOUR,NOW()),(2,2,300.00,'SIMULATED_MOBILE_WALLET','PAID',CONCAT('TXN-',DATE_FORMAT(NOW(),'%Y%m%d'),'-M9P742'),DATE_SUB(NOW(),INTERVAL 2 DAY)+INTERVAL 3 HOUR,NOW()),(3,4,120.00,'SIMULATED_MOBILE_WALLET','PAID',CONCAT('PAY-',DATE_FORMAT(NOW(),'%Y%m%d'),'-A72K91'),DATE_SUB(NOW(),INTERVAL 1 DAY)+INTERVAL 3 HOUR,NOW());
/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pricing_rules`
--

DROP TABLE IF EXISTS `pricing_rules`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pricing_rules` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehicle_type` enum('MOTORCYCLE','STANDARD_CAR','SUV','VAN','TRUCK') COLLATE utf8mb4_unicode_ci NOT NULL,
  `hourly_rate` decimal(10,2) NOT NULL,
  `effective_from` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `effective_to` timestamp NULL DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_pricing_rules_type` (`vehicle_type`),
  KEY `idx_pricing_rules_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pricing_rules`
--

LOCK TABLES `pricing_rules` WRITE;
/*!40000 ALTER TABLE `pricing_rules` DISABLE KEYS */;
INSERT INTO `pricing_rules` VALUES (1,'MOTORCYCLE',40.00,DATE_SUB(NOW(),INTERVAL 30 DAY),NULL,1,NOW(),NOW()),(2,'STANDARD_CAR',80.00,DATE_SUB(NOW(),INTERVAL 30 DAY),NULL,1,NOW(),NOW()),(3,'SUV',100.00,DATE_SUB(NOW(),INTERVAL 30 DAY),NULL,1,NOW(),NOW()),(4,'VAN',110.00,DATE_SUB(NOW(),INTERVAL 30 DAY),NULL,1,NOW(),NOW()),(5,'TRUCK',130.00,DATE_SUB(NOW(),INTERVAL 30 DAY),NULL,1,NOW(),NOW());
/*!40000 ALTER TABLE `pricing_rules` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `vehicle_id` int NOT NULL,
  `slot_id` int NOT NULL,
  `start_time` timestamp NOT NULL,
  `end_time` timestamp NOT NULL,
  `hourly_rate_snapshot` decimal(10,2) NOT NULL,
  `total_estimated_fee` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('PENDING','CONFIRMED','ACTIVE','COMPLETED','CANCELLED','NO_SHOW') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CONFIRMED',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_res_slot_time` (`slot_id`,`start_time`,`end_time`),
  KEY `idx_res_user` (`user_id`),
  KEY `idx_res_vehicle` (`vehicle_id`),
  KEY `idx_res_status` (`status`),
  KEY `idx_reservations_start_time` (`start_time`),
  KEY `idx_res_start_time` (`start_time`),
  CONSTRAINT `fk_reservations_slot` FOREIGN KEY (`slot_id`) REFERENCES `parking_slots` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_reservations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_reservations_vehicle` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reservations`
--

LOCK TABLES `reservations` WRITE;
/*!40000 ALTER TABLE `reservations` DISABLE KEYS */;
INSERT INTO `reservations` VALUES (1,1,1,1,DATE_SUB(NOW(),INTERVAL 3 DAY),DATE_SUB(NOW(),INTERVAL 3 DAY)+INTERVAL 2 HOUR,80.00,160.00,'COMPLETED',NOW(),NOW()),(2,1,2,4,DATE_SUB(NOW(),INTERVAL 2 DAY),DATE_SUB(NOW(),INTERVAL 2 DAY)+INTERVAL 3 HOUR,100.00,300.00,'COMPLETED',NOW(),NOW()),(3,1,1,2,DATE_SUB(NOW(),INTERVAL 45 MINUTE),NOW()+INTERVAL 135 MINUTE,80.00,240.00,'ACTIVE',NOW(),NOW()),(4,2,3,7,NOW()+INTERVAL 2 HOUR,NOW()+INTERVAL 4 HOUR,40.00,80.00,'CONFIRMED',NOW(),NOW()),(5,1,1,3,DATE_SUB(NOW(),INTERVAL 4 DAY),DATE_SUB(NOW(),INTERVAL 4 DAY)+INTERVAL 2 HOUR,80.00,160.00,'CANCELLED',NOW(),NOW()),(6,2,3,8,DATE_SUB(NOW(),INTERVAL 1 DAY),DATE_SUB(NOW(),INTERVAL 1 DAY)+INTERVAL 3 HOUR,40.00,120.00,'COMPLETED',NOW(),NOW());
/*!40000 ALTER TABLE `reservations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `full_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('CUSTOMER','ADMIN') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'CUSTOMER',
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`),
  KEY `idx_users_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Fahim Ahmed','fahim.ahmed@example.com','$2a$10$cloDf3xuvLZr39JPBoh7Ee3fGIVdGwZ.uUJLA1Sh5dEbDNZNo/.iS','CUSTOMER',NULL,DATE_SUB(NOW(),INTERVAL 180 DAY),DATE_SUB(NOW(),INTERVAL 30 DAY)),(2,'Saif Rahman','saif.rahman@example.com','$2a$10$4a9CA2ZhY7JPQLN4JVjq/.LSnjcZBLhrwmcFLy0mo7bFxb.3sv6xe','CUSTOMER',NULL,DATE_SUB(NOW(),INTERVAL 90 DAY),DATE_SUB(NOW(),INTERVAL 14 DAY)),(3,'ParkEase Operations','admin@parkease.example.com','$2a$12$/zE1m0nry0NG369jbmraneDu3fcu6s8KQnGt//kc6V6qP8Jfu/xR2','ADMIN',NULL,DATE_SUB(NOW(),INTERVAL 365 DAY),NOW());
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles`
--

DROP TABLE IF EXISTS `vehicles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vehicles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plate_number` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vehicle_type` enum('MOTORCYCLE','STANDARD_CAR','SUV','VAN','TRUCK') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'STANDARD_CAR',
  `make_model` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Optional: e.g. Toyota Corolla',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_plate` (`user_id`,`plate_number`),
  KEY `idx_vehicles_user_id` (`user_id`),
  CONSTRAINT `fk_vehicles_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles`
--

LOCK TABLES `vehicles` WRITE;
/*!40000 ALTER TABLE `vehicles` DISABLE KEYS */;
INSERT INTO `vehicles` VALUES (1,1,'DHAKA METRO-GA-11-2233','STANDARD_CAR','Toyota Corolla 2021',NOW(),NOW()),(2,1,'DHAKA METRO-GHA-15-7788','SUV','Honda Vezel 2020',NOW(),NOW()),(3,2,'DHAKA METRO-HA-12-8899','MOTORCYCLE','Yamaha FZ-S V3',NOW(),NOW());
/*!40000 ALTER TABLE `vehicles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `vw_demo_daily_revenue`
--

DROP TABLE IF EXISTS `vw_demo_daily_revenue`;
/*!50001 DROP VIEW IF EXISTS `vw_demo_daily_revenue`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_demo_daily_revenue` AS SELECT 
 1 AS `transaction_date`,
 1 AS `demo_method`,
 1 AS `transaction_count`,
 1 AS `successful_simulated_total`,
 1 AS `is_demo_transaction`*/;
SET character_set_client = @saved_cs_client;

--
-- Temporary view structure for view `vw_occupancy_by_lot`
--

DROP TABLE IF EXISTS `vw_occupancy_by_lot`;
/*!50001 DROP VIEW IF EXISTS `vw_occupancy_by_lot`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `vw_occupancy_by_lot` AS SELECT 
 1 AS `lot_id`,
 1 AS `lot_name`,
 1 AS `lot_address`,
 1 AS `total_capacity`,
 1 AS `total_slots`,
 1 AS `occupied_slots`,
 1 AS `reserved_slots`,
 1 AS `available_slots`,
 1 AS `maintenance_slots`,
 1 AS `inactive_slots`,
 1 AS `total_utilization_percent`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `vw_demo_daily_revenue`
--

/*!50001 DROP VIEW IF EXISTS `vw_demo_daily_revenue`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_demo_daily_revenue` AS select cast(`p`.`paid_at` as date) AS `transaction_date`,`p`.`demo_method` AS `demo_method`,count(`p`.`id`) AS `transaction_count`,coalesce(sum((case when (`p`.`status` = 'PAID') then `p`.`amount` else 0 end)),0) AS `successful_simulated_total`,true AS `is_demo_transaction` from `payments` `p` group by cast(`p`.`paid_at` as date),`p`.`demo_method` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `vw_occupancy_by_lot`
--

/*!50001 DROP VIEW IF EXISTS `vw_occupancy_by_lot`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `vw_occupancy_by_lot` AS select `pl`.`id` AS `lot_id`,`pl`.`name` AS `lot_name`,`pl`.`address` AS `lot_address`,`pl`.`total_capacity` AS `total_capacity`,count(`ps`.`id`) AS `total_slots`,coalesce(sum((case when ((`ps`.`status` = 'AVAILABLE') and (`s`.`is_occupied` = 1)) then 1 else 0 end)),0) AS `occupied_slots`,coalesce(sum((case when ((`ps`.`status` = 'AVAILABLE') and ((`s`.`is_occupied` is null) or (`s`.`is_occupied` = 0)) and (`r`.`is_reserved` = 1)) then 1 else 0 end)),0) AS `reserved_slots`,coalesce(sum((case when ((`ps`.`status` = 'AVAILABLE') and ((`s`.`is_occupied` is null) or (`s`.`is_occupied` = 0)) and ((`r`.`is_reserved` is null) or (`r`.`is_reserved` = 0))) then 1 else 0 end)),0) AS `available_slots`,coalesce(sum((case when (`ps`.`status` = 'MAINTENANCE') then 1 else 0 end)),0) AS `maintenance_slots`,coalesce(sum((case when (`ps`.`status` = 'INACTIVE') then 1 else 0 end)),0) AS `inactive_slots`,round(((coalesce(sum((case when ((`ps`.`status` = 'AVAILABLE') and ((`s`.`is_occupied` = 1) or (`r`.`is_reserved` = 1))) then 1 else 0 end)),0) / count(`ps`.`id`)) * 100),1) AS `total_utilization_percent` from (((`parking_lots` `pl` left join `parking_slots` `ps` on((`pl`.`id` = `ps`.`lot_id`))) left join (select `parking_sessions`.`slot_id` AS `slot_id`,1 AS `is_occupied` from `parking_sessions` where ((`parking_sessions`.`status` = 'ACTIVE') and (`parking_sessions`.`exit_time` is null)) group by `parking_sessions`.`slot_id`) `s` on((`ps`.`id` = `s`.`slot_id`))) left join (select `reservations`.`slot_id` AS `slot_id`,1 AS `is_reserved` from `reservations` where ((`reservations`.`status` in ('CONFIRMED','ACTIVE')) and (`reservations`.`start_time` <= now()) and (`reservations`.`end_time` >= now())) group by `reservations`.`slot_id`) `r` on((`ps`.`id` = `r`.`slot_id`))) group by `pl`.`id`,`pl`.`name`,`pl`.`address`,`pl`.`total_capacity` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-14 10:59:02
