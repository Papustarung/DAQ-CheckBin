-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Apr 21, 2026 at 04:02 PM
-- Server version: 8.3.0
-- PHP Version: 8.2.27

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `b6710545989`
--

-- --------------------------------------------------------

--
-- Table structure for table `survey_responses`
--

CREATE TABLE `survey_responses` (
  `timestamp` datetime DEFAULT NULL,
  `usage_frequency` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `encountered_overflow` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `avoid_near_full` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `cleanliness_satisfaction` varchar(24) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  `suggested_location` varchar(30) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `survey_responses`
--

INSERT INTO `survey_responses` (`timestamp`, `usage_frequency`, `encountered_overflow`, `avoid_near_full`, `cleanliness_satisfaction`, `suggested_location`) VALUES
('2026-04-19 22:16:09', '11 - 15 ครั้ง', 'No', 'No', '5', 'ตำแหน่งเดิมเริ่ดอยู่แล้ว'),
('2026-04-19 22:47:09', '< 5 ครั้ง', 'Yes', 'No', '3', 'ในห้องเรียน'),
('2026-04-19 23:34:48', '< 5 ครั้ง', 'Yes', 'Yes', '3', 'นอกบ้าน'),
('2026-04-19 23:39:38', '16 - 20 ครั้ง', 'Yes', 'Yes', '3', 'หน้า hallway เเละบริเวณหน้าตึก'),
('2026-04-20 19:19:11', '< 5 ครั้ง', 'No', 'No', '4', 'ใต้โต๊ะ'),
('2026-04-20 22:36:45', '5 - 10 ครั้ง', 'No', 'Yes', '4', 'ทางเดิน'),
('2026-04-20 22:38:09', '> 20 ครั้ง', 'Yes', 'Yes', '2', 'โถงทางเดิน'),
('2026-04-20 22:40:55', '< 5 ครั้ง', 'Yes', 'No', '5', 'ไม่มี, ที่เดิมดีเเล้ว'),
('2026-04-20 22:42:36', '5 - 10 ครั้ง', 'No', 'No', '3', 'หน้าห้องเรียน'),
('2026-04-20 22:44:27', '5 - 10 ครั้ง', 'No', 'Yes', '1', 'ที่เดิมดีแล้ว'),
('2026-04-20 22:45:38', '> 20 ครั้ง', 'No', 'No', '2', 'หน้าห้องน้ำ'),
('2026-04-20 22:46:56', '11 - 15 ครั้ง', 'No', 'Yes', '3', 'หน้าลิฟต์'),
('2026-04-20 22:48:54', '< 5 ครั้ง', 'No', 'Yes', '3', 'ใกล้ๆ ระเบียงริมทางเดิน'),
('2026-04-20 22:50:27', '11 - 15 ครั้ง', 'Yes', 'No', '5', 'ด้านหลังห้องเรียน ใกล้ประตู'),
('2026-04-20 22:51:31', '11 - 15 ครั้ง', 'No', 'No', '4', 'ใกล้ลิฟต์');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
