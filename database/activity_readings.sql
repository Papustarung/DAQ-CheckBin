-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: db:3306
-- Generation Time: Apr 19, 2026 at 03:54 PM
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
-- Table structure for table `activity_readings`
--

CREATE TABLE `activity_readings` (
  `id` bigint NOT NULL,
  `bin_id` varchar(50) NOT NULL,
  `recorded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Dumping data for table `activity_readings`
--

INSERT INTO `activity_readings` (`id`, `bin_id`, `recorded_at`) VALUES
(1, 'checkbin_02', '2026-04-17 11:37:24'),
(2, 'checkbin_02', '2026-04-17 11:38:01'),
(3, 'checkbin_02', '2026-04-17 11:38:30'),
(4, 'checkbin_02', '2026-04-17 11:39:04'),
(5, 'checkbin_02', '2026-04-17 11:39:31'),
(6, 'checkbin_02', '2026-04-17 11:40:02'),
(7, 'checkbin_02', '2026-04-17 11:41:22'),
(8, 'checkbin_02', '2026-04-17 11:46:46'),
(9, 'checkbin_02', '2026-04-17 11:47:17'),
(10, 'checkbin_02', '2026-04-17 11:47:47'),
(11, 'checkbin_02', '2026-04-17 11:48:15'),
(12, 'checkbin_02', '2026-04-17 11:48:48'),
(13, 'checkbin_02', '2026-04-17 11:49:17'),
(14, 'checkbin_02', '2026-04-17 11:50:37'),
(16, 'checkbin_02', '2026-04-17 11:53:06'),
(15, 'checkbin_02', '2026-04-17 11:54:40'),
(17, 'checkbin_02', '2026-04-18 01:26:41'),
(18, 'checkbin_02', '2026-04-18 01:40:40'),
(19, 'checkbin_02', '2026-04-18 01:41:09'),
(20, 'checkbin_02', '2026-04-18 01:41:37'),
(21, 'checkbin_02', '2026-04-18 01:50:15'),
(22, 'checkbin_02', '2026-04-18 01:50:49'),
(23, 'checkbin_02', '2026-04-18 01:56:21'),
(24, 'checkbin_02', '2026-04-18 02:02:33'),
(25, 'checkbin_02', '2026-04-18 02:22:32'),
(26, 'checkbin_02', '2026-04-18 03:58:51'),
(27, 'checkbin_02', '2026-04-18 04:06:27'),
(28, 'checkbin_02', '2026-04-18 04:21:36'),
(30, 'checkbin_02', '2026-04-18 04:43:29'),
(29, 'checkbin_02', '2026-04-18 04:57:38'),
(31, 'checkbin_02', '2026-04-18 05:00:06'),
(32, 'checkbin_02', '2026-04-18 05:15:06'),
(33, 'checkbin_02', '2026-04-18 05:18:15'),
(34, 'checkbin_02', '2026-04-18 05:18:44'),
(35, 'checkbin_02', '2026-04-18 05:19:14'),
(36, 'checkbin_02', '2026-04-18 05:19:42'),
(37, 'checkbin_02', '2026-04-18 05:23:02'),
(38, 'checkbin_02', '2026-04-18 05:37:13'),
(39, 'checkbin_02', '2026-04-18 05:53:56'),
(40, 'checkbin_02', '2026-04-18 05:59:42'),
(41, 'checkbin_02', '2026-04-18 07:58:32'),
(42, 'checkbin_02', '2026-04-18 07:58:59'),
(43, 'checkbin_02', '2026-04-18 09:18:21'),
(44, 'checkbin_02', '2026-04-18 09:20:33'),
(45, 'checkbin_02', '2026-04-18 09:23:45'),
(46, 'checkbin_02', '2026-04-19 06:37:04'),
(47, 'checkbin_02', '2026-04-19 09:02:46'),
(48, 'checkbin_02', '2026-04-19 09:03:00'),
(49, 'checkbin_02', '2026-04-19 09:03:16'),
(50, 'checkbin_02', '2026-04-19 09:03:20'),
(51, 'checkbin_02', '2026-04-19 09:03:25');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_readings`
--
ALTER TABLE `activity_readings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_bin_time` (`bin_id`,`recorded_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_readings`
--
ALTER TABLE `activity_readings`
  MODIFY `id` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_readings`
--
ALTER TABLE `activity_readings`
  ADD CONSTRAINT `activity_readings_ibfk_1` FOREIGN KEY (`bin_id`) REFERENCES `bins` (`bin_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
