-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 06, 2024 at 02:28 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 7.4.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `eventdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `admin_id` int(11) NOT NULL,
  `admin_username` varchar(255) NOT NULL,
  `admin_password` varchar(255) NOT NULL,
  `admin_active_status` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`admin_id`, `admin_username`, `admin_password`, `admin_active_status`) VALUES
(1, 'eventadmin', '$2a$10$V9qXP.c5Xb8EKbGc1bqFDuUK31d4e6p.dAyuY.YMRs1m1YX.em58q', 1),
(2, 'eventadmin', '$2a$10$Z2SvAyEMCtSRBYUCiRK.SudTcP8KgCfPcgtK/gfC6DFA1Pf2M7wXS', 1),
(3, 'eventadmin', '$2a$10$CO3GPRj8rW0dabUz5H3/2.tLC0wljaOO/kBEp78eyAIXxVhJbWe6O', 1),
(4, 'Arun', '$2a$10$X3yC4of5CZ.8LNEP0ZfiV.tJAdxCmlm/VpH4Gj6zB92UCUcBPSnRa', 1),
(7, 'admin', '$2a$10$YWOoyQuyJZ59xeRpEgtctOylAJAKlMvPNShrqiKyvLHBTm85Nw0Hm', 1),
(8, 'admin', '$2a$10$klNKry1OgDIp4tAqRuMfpOp9Tg8EQGjnOq11RzrvQ3cj0wj.9ru6C', 1);

-- --------------------------------------------------------

--
-- Table structure for table `admin_logs`
--

CREATE TABLE `admin_logs` (
  `id` int(11) NOT NULL,
  `admin_id` int(11) NOT NULL,
  `action` varchar(1000) NOT NULL,
  `date_time` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_logs`
--

INSERT INTO `admin_logs` (`id`, `admin_id`, `action`, `date_time`) VALUES
(1, 1, 'Admin logged in', '2024-06-04 11:21:36'),
(2, 7, 'Admin logged in', '2024-06-06 11:59:25'),
(3, 7, 'Admin logged in', '2024-06-06 12:32:51'),
(5, 7, 'Payment done for college: St.josephs', '2024-06-06 12:55:45'),
(6, 7, 'Payment done for college: Sahrdaya', '2024-06-06 13:30:45'),
(7, 7, 'Admin logged in', '2024-06-06 17:41:52');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `added_date` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `session_id`, `student_id`, `status`, `added_date`) VALUES
(1, 1, 71, 0, '2024-06-03');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_college`
--

CREATE TABLE `certificate_college` (
  `certificate_id` int(11) NOT NULL,
  `certificate_private_event_id` int(11) NOT NULL,
  `certificate_student_id` int(11) NOT NULL,
  `certificate_name` varchar(150) NOT NULL,
  `issued_date` date NOT NULL DEFAULT current_timestamp(),
  `Issued_By` varchar(100) NOT NULL,
  `status` enum('approved','denied','pending') NOT NULL DEFAULT 'pending',
  `expiration_date` date GENERATED ALWAYS AS (`issued_date` + interval 6 month) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_college`
--

INSERT INTO `certificate_college` (`certificate_id`, `certificate_private_event_id`, `certificate_student_id`, `certificate_name`, `issued_date`, `Issued_By`, `status`) VALUES
(5, 1, 4, 'Thanks For Participating', '2024-03-20', 'Logix Space Technologies', 'pending'),
(6, 1, 2, 'Thanks For Participating', '2024-03-20', 'Logix Space Technologies', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_stud`
--

CREATE TABLE `certificate_stud` (
  `certificate_id` int(11) NOT NULL,
  `certificate_private_event_id` int(11) NOT NULL,
  `certificate_student_id` int(11) NOT NULL,
  `certificate_name` varchar(150) NOT NULL,
  `issued_date` date NOT NULL DEFAULT current_timestamp(),
  `Issued_By` varchar(100) NOT NULL,
  `status` enum('approved','denied','pending') NOT NULL DEFAULT 'pending',
  `expiration_date` date GENERATED ALWAYS AS (`issued_date` + interval 6 month) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `certificate_stud`
--

INSERT INTO `certificate_stud` (`certificate_id`, `certificate_private_event_id`, `certificate_student_id`, `certificate_name`, `issued_date`, `Issued_By`, `status`) VALUES
(5, 1, 4, 'Thanks For Participating', '2024-03-20', 'Logix Space Technologies', 'pending'),
(6, 1, 2, 'Thanks For Participating', '2024-03-20', 'Logix Space Technologies', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `certificate_user`
--

CREATE TABLE `certificate_user` (
  `certificate_id` int(11) NOT NULL,
  `certificate_public_event_id` int(11) NOT NULL,
  `certificate_user_id` int(11) NOT NULL,
  `certificate_name` varchar(150) NOT NULL,
  `issued_date` date NOT NULL DEFAULT current_timestamp(),
  `Issued_By` varchar(100) NOT NULL,
  `status` enum('approved','denied','pending') NOT NULL DEFAULT 'pending',
  `expiration_date` date GENERATED ALWAYS AS (`issued_date` + interval 6 month) VIRTUAL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `college`
--

CREATE TABLE `college` (
  `college_id` int(11) NOT NULL,
  `college_name` varchar(255) NOT NULL,
  `college_email` varchar(255) NOT NULL,
  `college_phone` bigint(255) NOT NULL,
  `college_website` varchar(255) NOT NULL,
  `college_password` varchar(255) DEFAULT NULL,
  `college_image` varchar(255) DEFAULT NULL,
  `college_certificate_request` tinyint(1) NOT NULL DEFAULT 0,
  `delete_status` tinyint(1) NOT NULL DEFAULT 0,
  `college_addedby` int(11) NOT NULL,
  `college_updatedby` int(11) NOT NULL,
  `college_added_date` date NOT NULL DEFAULT current_timestamp(),
  `college_updated_date` date NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `college`
--

INSERT INTO `college` (`college_id`, `college_name`, `college_email`, `college_phone`, `college_website`, `college_password`, `college_image`, `college_certificate_request`, `delete_status`, `college_addedby`, `college_updatedby`, `college_added_date`, `college_updated_date`) VALUES
(1, 'FISAT', 'fisat@ac.in', 9823843293, '', '$2a$10$VsWwtxzgcmaTOpDC6QMUHu14hn2bEfKwWdiMdJJl6S/NE1pXt5KEC', 'uploads\\colleges\\image-1715752752515-172661939.png', 0, 0, 1, 1, '2024-05-15', '2024-05-15'),
(2, 'SCMS', 'scms@ac.in', 8934923425, '', '$2a$10$VsWwtxzgcmaTOpDC6QMUHu14hn2bEfKwWdiMdJJl6S/NE1pXt5KEC', 'uploads\\colleges\\image-1715752752515-172661939.png', 0, 0, 1, 1, '2024-05-15', '2024-05-15'),
(14, 'Sahrdaya', 'sahrdaya@edu.in', 422, '', '$2a$10$VsWwtxzgcmaTOpDC6QMUHu14hn2bEfKwWdiMdJJl6S/NE1pXt5KEC', 'uploads\\colleges\\image-1715752752515-172661939.png', 0, 0, 1, 1, '2024-05-15', '2024-05-15'),
(15, 'NSS', 'nss@gmail.com', 7907252037, '', '$2a$10$zkgX6P/VGJSP86SBPlmoX.OIBKtEcvLnae7dFQBEG2e0CHjtwWyUG', 'uploads\\colleges\\image-1715752752515-172661939.png', 0, 0, 1, 1, '2024-05-15', '2024-05-15'),
(16, 'St.josephs', 'Stjosephs@gmail.com', 8642531072, '', '$2a$10$tM7Jqfyx/dXEZIjPnvSoiO7TMOLDPV6SrWSeCR.ueQYVzyZecAPvC', 'uploads\\colleges\\image-1715752752515-172661939.png', 0, 1, 2, 2, '2024-05-15', '2024-05-15'),
(17, 'UHSS', 'uhss@gmail.com', 9638527410, '', '$2a$10$M.IUxtMV/xx6gAmL.OxvzuR2EK6wy6o2wh9CmXu4z6w3JvRu3i/LC', 'uploads\\colleges\\image-1717388211359-23916325.jpg', 0, 0, 7, 7, '2024-06-03', '2024-06-03');

-- --------------------------------------------------------

--
-- Table structure for table `counter`
--

CREATE TABLE `counter` (
  `id` int(11) NOT NULL,
  `value` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `counter`
--

INSERT INTO `counter` (`id`, `value`) VALUES
(1, 10001);

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `department_id` int(11) NOT NULL,
  `college_id` int(11) NOT NULL,
  `department_name` varchar(255) NOT NULL,
  `faculty_name` varchar(255) NOT NULL,
  `faculty_email` varchar(255) NOT NULL,
  `faculty_phone` bigint(20) NOT NULL,
  `faculty_password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`department_id`, `college_id`, `department_name`, `faculty_name`, `faculty_email`, `faculty_phone`, `faculty_password`) VALUES
(1, 2, 'MCA', 'joyna ', 'per24joyna@gmail.com', 9634521080, '$2a$10$YtRX.O/w/nvJUKtW3mZRHuVkjC9I.K58QfOYgN0cgRoc.V/XnBzCi'),
(2, 14, 'Btech', 'Anna W ', 'Anna123@gmail.com', 7536204120, '$2a$10$93RwlOdp16SQWAiLs/FBBO92ZnHnDnZLsmiXdTv5MJ.MTwRLdyzJi'),
(3, 1, 'BCA', 'Jasmine M ', 'Jasmine123@gmail.com', 9642301570, '$2a$10$WztW4dhzeIwS.KJpBXH1tu.Arp3olqSDvXRyEMj3aSrQeWeGYWT26'),
(4, 15, 'EEE', 'Taniya', 'itaniya122001@gmail.com', 8578321060, '$2a$10$B.nBzVYVrz0EvVIM.Qcs6ur5fh7ibBbdjrtB5gP7FxI3I4QWj9urC'),
(5, 15, 'EEE', 'Flower R', 'Flower123@gmail.com', 7634205312, '$2a$10$hBedJT9NYl246m5/izQ6c.b4.fUzZXPbizsDkfk7vDQaQVHpNg9G2'),
(6, 16, 'MCA', 'Anex', 'axpauly@gmail.com', 7025637399, '$2a$10$UcXTlxlPrBWf4rX169TjfO.VXARkRZzFiR/AoiWnNIlPCzkbmPgI.');

-- --------------------------------------------------------

--
-- Table structure for table `event_private`
--

CREATE TABLE `event_private` (
  `event_private_id` int(11) NOT NULL,
  `event_private_name` varchar(255) NOT NULL,
  `event_private_amount` varchar(255) NOT NULL,
  `event_private_description` varchar(255) NOT NULL,
  `event_private_date` date NOT NULL,
  `event_private_time` time NOT NULL,
  `event_private_duration` int(11) NOT NULL,
  `event_private_online` int(11) NOT NULL,
  `event_private_offline` int(11) NOT NULL,
  `event_private_recorded` int(11) NOT NULL,
  `event_private_image` varchar(200) NOT NULL,
  `event_private_syllabus` varchar(255) NOT NULL,
  `event_private_clgid` int(11) NOT NULL,
  `event_addedby` int(11) NOT NULL,
  `event_updatedby` int(11) NOT NULL,
  `event_added_date` date NOT NULL DEFAULT current_timestamp(),
  `event_updated_date` date NOT NULL DEFAULT current_timestamp(),
  `delete_status` tinyint(1) NOT NULL DEFAULT 0,
  `cancel_status` tinyint(1) NOT NULL DEFAULT 0,
  `is_completed` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_private`
--

INSERT INTO `event_private` (`event_private_id`, `event_private_name`, `event_private_amount`, `event_private_description`, `event_private_date`, `event_private_time`, `event_private_duration`, `event_private_online`, `event_private_offline`, `event_private_recorded`, `event_private_image`, `event_private_syllabus`, `event_private_clgid`, `event_addedby`, `event_updatedby`, `event_added_date`, `event_updated_date`, `delete_status`, `cancel_status`, `is_completed`) VALUES
(1, 'C programming', '2000', '2 days', '2024-03-20', '10:00:00', 0, 0, 0, 0, 'uploads\\events\\image-1712640971452-73087301.jpg', '', 1, 7, 7, '0000-00-00', '0000-00-00', 0, 1, 0),
(2, 'Java Programming', '1500', '1 day', '2024-03-20', '00:00:00', 0, 0, 0, 0, 'uploads\\events\\image-1712640971452-73087301.jpg', '', 1, 7, 7, '0000-00-00', '0000-00-00', 0, 0, 0),
(3, 'Flutter Bootcamp', '544', 'Flutter full stack development bootcamp', '2024-05-21', '00:00:00', 0, 0, 0, 0, 'uploads\\events\\image-1712640971452-73087301.jpg', '', 2, 8, 8, '0000-00-00', '0000-00-00', 0, 0, 0),
(8, 'Swift', '566', '4 days', '0000-00-00', '00:00:00', 0, 0, 0, 0, 'uploads\\events\\image-1712595131629-784866462.jpg', '', 2, 7, 1, '0000-00-00', '0000-00-00', 0, 0, 0),
(9, 'Swift', '2000', 'bootcamp', '2024-04-20', '10:00:00', 0, 0, 0, 0, 'uploads\\events\\image-1712640971452-73087301.jpg', '', 14, 8, 8, '0000-00-00', '0000-00-00', 0, 0, 0),
(11, 'Flutter Bootcamp', '544', 'Flutter full stack development bootcamp', '2024-04-10', '10:00:00', 0, 0, 0, 0, 'uploads\\events\\image-1712657304843-341196556.jpg', '', 14, 7, 7, '0000-00-00', '0000-00-00', 0, 1, 0),
(12, 'JEFFIN', '500', 'fsdfsdfdfdfdfd', '2024-04-30', '10:00:00', 0, 0, 0, 0, 'uploads\\eventimages\\image-1713336218718-442811497.jpg', '', 15, 1, 1, '0000-00-00', '0000-00-00', 0, 0, 0),
(13, 'Swift Programming', '1000', 'Covers all the basics and functionalities of Swift Programming', '2024-06-03', '09:30:00', 8, 0, 1, 0, 'uploads\\eventimages\\image-1713345115424-678848681.jpg', 'Swift Programming 8-Day Syllabus\n\n1. Day 1: Introduction to Swift and Xcode; basic syntax and control flow.\n2. Day 2: Functions, closures, and hands-on lab with sorting function.\n3. Day 3: Object-oriented programming: classes, inheritance.', 16, 1, 1, '2024-05-01', '2024-06-01', 0, 0, 0),
(14, 'MERN', '600', '5  days', '2024-03-20', '10:00:00', 0, 0, 0, 0, 'uploads\\eventimages\\image-1716274301463-309057262.png', '', 16, 1, 1, '2024-05-21', '2024-05-21', 0, 1, 0),
(16, 'test', '2000', 'test', '2024-05-25', '10:00:00', 15, 5, 5, 5, 'uploads\\eventimages\\image-1717242392620-862608458.jpg', 'uploads\\eventpdfs\\pdf-1717242392623-971260707.pdf', 16, 7, 7, '2024-06-01', '2024-06-01', 0, 0, 1),
(17, 'flutter', '10000', 'flutter bootcamp', '2024-06-07', '10:30:00', 0, 0, 0, 0, 'uploads\\eventimages\\image-1717388476625-651341267.jpg', '', 17, 7, 7, '2024-06-03', '2024-06-03', 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `event_public`
--

CREATE TABLE `event_public` (
  `event_public_id` int(11) NOT NULL,
  `event_public_name` varchar(255) NOT NULL,
  `event_public_amount` varchar(255) NOT NULL,
  `event_public_description` varchar(255) NOT NULL,
  `event_public_date` date NOT NULL,
  `event_public_time` time NOT NULL,
  `event_public_image` varchar(255) DEFAULT NULL,
  `event_syllabus` varchar(255) NOT NULL,
  `event_venue` varchar(255) NOT NULL,
  `event_addedby` int(11) NOT NULL,
  `event_updatedby` int(11) NOT NULL,
  `event_added_date` date NOT NULL DEFAULT current_timestamp(),
  `event_updated_date` date NOT NULL DEFAULT current_timestamp(),
  `delete_status` tinyint(1) NOT NULL DEFAULT 0,
  `cancel_status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_public`
--

INSERT INTO `event_public` (`event_public_id`, `event_public_name`, `event_public_amount`, `event_public_description`, `event_public_date`, `event_public_time`, `event_public_image`, `event_syllabus`, `event_venue`, `event_addedby`, `event_updatedby`, `event_added_date`, `event_updated_date`, `delete_status`, `cancel_status`) VALUES
(2, 'C++ program', '2500', '5 days Programming', '2024-03-23', '12:30:00', NULL, '', 'At FISAT College', 1, 1, '2024-05-15', '2024-05-15', 1, 1),
(3, 'code 4', '700', 'Coding in four different programming languages', '2024-03-21', '00:00:00', NULL, '', 'At Company', 1, 1, '2024-05-15', '2024-05-15', 1, 1),
(6, 'Python', '1500', 'Python Full Stack for 3 days', '2024-05-05', '10:30:00', '', '', 'At CUSAT College', 2, 2, '2024-05-15', '2024-05-15', 1, 1),
(7, 'Flutter BootCamp', '!040', '8 days', '2024-03-21', '12:30:00', 'uploads\\eventimages\\image-1716274383237-662114330.png', 'Google Flutter Full Stack', 'SRM', 1, 1, '2024-05-21', '2024-05-21', 0, 0),
(8, 'Flutter BootCamp', '!040', '8 days', '2024-03-21', '12:30:00', 'uploads\\eventimages\\image-1716274437895-130415057.png', 'Google Flutter Full Stack', 'SRM', 1, 1, '2024-05-21', '2024-05-21', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `faculty_logs`
--

CREATE TABLE `faculty_logs` (
  `id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `action` varchar(1000) NOT NULL,
  `date_time` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback_session_private`
--

CREATE TABLE `feedback_session_private` (
  `feedback_id` int(11) NOT NULL,
  `student_id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `feedback_contents` varchar(1000) NOT NULL,
  `addedby_date` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback_session_private`
--

INSERT INTO `feedback_session_private` (`feedback_id`, `student_id`, `session_id`, `feedback_contents`, `addedby_date`) VALUES
(1, 96, 1, 'Be specific—give actionable suggestions. It becomes much easier to streamline the workflow when the reviewer says why they want to change something', '2024-06-04 10:08:19'),
(2, 97, 1, 'You exceeded expectations', '2024-06-04 10:08:19'),
(4, 26, 1, 'Occasionally, struggles to identify effective solutions for complex problems.', '2024-06-02 10:08:19'),
(5, 64, 1, 'Balancing quality and speed is sometimes a challenge', '2024-06-05 12:08:19'),
(6, 10, 1, 'time-saving strategies', '2024-06-03 05:08:19');

-- --------------------------------------------------------

--
-- Table structure for table `feedback_stud`
--

CREATE TABLE `feedback_stud` (
  `feedback_id` int(11) NOT NULL,
  `feedback_student_id` int(11) NOT NULL,
  `feedback_event_id` int(11) NOT NULL,
  `feedback_content` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `feedback_user`
--

CREATE TABLE `feedback_user` (
  `feedback_id` int(11) NOT NULL,
  `feedback_user_id` int(11) NOT NULL,
  `feedback_event_id` int(11) NOT NULL,
  `feedback_content` varchar(200) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_college`
--

CREATE TABLE `payment_college` (
  `payment_college_id` int(11) NOT NULL,
  `college_id` int(11) NOT NULL,
  `private_event_id` int(11) NOT NULL,
  `college_payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `amount` int(11) NOT NULL,
  `invoice_no` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_college`
--

INSERT INTO `payment_college` (`payment_college_id`, `college_id`, `private_event_id`, `college_payment_date`, `amount`, `invoice_no`) VALUES
(11, 16, 14, '2024-06-06 11:08:12', 50000, 2147483647),
(12, 14, 11, '2024-06-06 12:31:17', 30000, 2147483647);

-- --------------------------------------------------------

--
-- Table structure for table `payment_user`
--

CREATE TABLE `payment_user` (
  `payment_user_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `payment_event_id` int(11) NOT NULL,
  `payment_amount` int(11) NOT NULL,
  `payment_date` date NOT NULL DEFAULT current_timestamp(),
  `invoice_no` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_user`
--

INSERT INTO `payment_user` (`payment_user_id`, `user_id`, `payment_event_id`, `payment_amount`, `payment_date`, `invoice_no`) VALUES
(2, 3, 3, 0, '2024-03-21', 0),
(3, 3, 3, 700, '2024-04-11', NULL),
(4, 3, 3, 700, '2024-04-11', NULL),
(5, 3, 3, 700, '2024-04-11', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `session_private`
--

CREATE TABLE `session_private` (
  `session_private_id` int(11) NOT NULL,
  `event_private_id` int(11) DEFAULT NULL,
  `session_date` date DEFAULT NULL,
  `session_start_time` datetime DEFAULT NULL,
  `session_topic_description` varchar(255) DEFAULT NULL,
  `type` varchar(100) NOT NULL,
  `venue` varchar(100) NOT NULL,
  `is_completed` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `session_private`
--

INSERT INTO `session_private` (`session_private_id`, `event_private_id`, `session_date`, `session_start_time`, `session_topic_description`, `type`, `venue`, `is_completed`) VALUES
(1, 13, '2024-06-03', '2024-06-03 11:00:00', 'Basics of Swift Programming', 'Recorded', 'College Auditorium', 0);

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` int(11) NOT NULL,
  `student_name` varchar(255) NOT NULL,
  `student_rollno` int(11) NOT NULL,
  `student_admno` varchar(255) NOT NULL,
  `student_email` varchar(255) NOT NULL,
  `student_phone_no` bigint(11) NOT NULL,
  `event_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`student_id`, `student_name`, `student_rollno`, `student_admno`, `student_email`, `student_phone_no`, `event_id`) VALUES
(2, 'Aj', 0, '1001', 'aj@gmail.com', 0, 1),
(3, 'AP', 0, '1002', 'ap@gmail.com', 0, 2),
(4, 'basil', 0, '4001', 'basil@gmail.com', 0, 1),
(7, 'Ammu k.k', 0, '090MCA22', 'ammu@gmail.com', 0, 1),
(8, 'Leon', 0, '1231', 'leon@gmail.com', 0, 3),
(9, 'Ciril', 0, '1232', 'ciril@gmail.com', 0, 3),
(10, 'Arjun', 0, '1233', 'arjun@gmail.com', 0, 3),
(11, 'Vivek', 0, '1234', 'vivek@gmail.com', 0, 3),
(22, 'Bezos', 0, '092MCA22', 'jeffinjosev1@gmail.com', 0, 1),
(24, 'jeff', 0, '104MCA22', 'jeffinjosev2@gmail.com', 0, 1),
(25, 'jeff', 0, '104MCA22', 'jeffinjosev2@gmail.com', 0, 1),
(26, 'jeff', 0, '104MCA22', 'jeffinjosev2@gmail.com', 0, 1),
(27, 'jeff', 0, '104MCA22', 'jeffinjosev2@gmail.com', 0, 1),
(28, 'jeff', 0, '104MCA22', 'jeffinmjtcr@gmail.com', 0, 1),
(29, 'Anex', 0, '1522', 'anex@gmail.com', 0, 1),
(30, 'Jeffin', 0, '9638', 'jeffin@gmail.com', 0, 1),
(31, 'Mahadevan', 0, '7531', 'mahadevan@gmail.com', 0, 1),
(60, 'Alex', 0, '21548', 'arunkp1515@gmail.com', 0, 1),
(61, 'Geomon', 0, '18547', 'arunkp1515@gmail.com', 0, 1),
(62, 'Elphin', 0, '47586', 'arunkp1515@gmail.com', 0, 1),
(63, 'Amal', 0, '84514', 'arunkp1515@gmail.com', 0, 1),
(64, 'Alex', 0, '21548', 'arunkp1515@gmail.com', 0, 1),
(65, 'Geomon', 0, '18547', 'arunkp1515@gmail.com', 0, 1),
(66, 'Elphin', 0, '47586', 'arunkp1515@gmail.com', 0, 1),
(67, 'Amal', 0, '84514', 'arunkp1515@gmail.com', 0, 1),
(68, 'Alex', 0, '21548', 'arunkp1515@gmail.com', 0, 1),
(69, 'Geomon', 0, '18547', 'arunkp1515@gmail.com', 0, 1),
(70, 'Elphin', 0, '47586', 'arunkp1515@gmail.com', 0, 1),
(71, 'Amal', 0, '84514', 'arunkp1515@gmail.com', 0, 1),
(72, 'Alex', 0, '21548', 'arunkp1515@gmail.com', 0, 1),
(73, 'Geomon', 0, '18547', 'arunkp1515@gmail.com', 0, 1),
(74, 'Elphin', 0, '47586', 'arunkp1515@gmail.com', 0, 1),
(75, 'Amal', 0, '84514', 'arunkp1515@gmail.com', 0, 1),
(76, 'Alex', 0, '21548', 'arunkp1515@gmail.com', 0, 1),
(77, 'Geomon', 0, '18547', 'arunkp1515@gmail.com', 0, 1),
(78, 'Elphin', 0, '47586', 'arunkp1515@gmail.com', 0, 1),
(79, 'Amal', 0, '84514', 'arunkp1515@gmail.com', 0, 1),
(80, 'Alex', 0, '21548', 'arunkp1515@gmail.com', 0, 1),
(81, 'Geomon', 0, '18547', 'arunkp1515@gmail.com', 0, 1),
(82, 'Elphin', 0, '47586', 'arunkp1515@gmail.com', 0, 1),
(83, 'Amal', 0, '84514', 'arunkp1515@gmail.com', 0, 1),
(84, 'Alex', 0, '21548', 'arunkp1515@gmail.com', 0, 1),
(85, 'Geomon', 0, '18547', 'arunkp1515@gmail.com', 0, 1),
(86, 'Elphin', 0, '47586', 'arunkp1515@gmail.com', 0, 1),
(87, 'Amal', 0, '84514', 'arunkp1515@gmail.com', 0, 1),
(88, 'Alex', 0, '21548', 'arunkp1515@gmail.com', 0, 1),
(89, 'Geomon', 0, '18547', 'arunkp1515@gmail.com', 0, 1),
(90, 'Elphin', 0, '47586', 'arunkp1515@gmail.com', 0, 1),
(91, 'Amal', 0, '84514', 'arunkp1515@gmail.com', 0, 1),
(92, 'Arun', 1, 'mca01', 'arun@gmail.com', 96385207410, 17),
(93, 'Mahadevan', 2, 'mca02', 'mahi17700@gmail.com', 9638527411, 17),
(94, 'Taniya', 3, 'mca03', 'taniya@gmail.com', 9638527412, 17),
(95, 'Arun', 1, 'mca01', 'arun@gmail.com', 96385207410, 17),
(96, 'Mahadevan', 2, 'mca02', 'mahi17700@gmail.com', 9638527411, 17),
(97, 'Taniya', 3, 'mca03', 'taniya@gmail.com', 9638527412, 17);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `user_name` varchar(255) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_password` varchar(255) NOT NULL,
  `user_contact_no` bigint(11) NOT NULL,
  `user_image` varchar(255) DEFAULT NULL,
  `user_qualification` varchar(255) NOT NULL,
  `user_skills` varchar(255) NOT NULL,
  `user_delete_status` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`user_id`, `user_name`, `user_email`, `user_password`, `user_contact_no`, `user_image`, `user_qualification`, `user_skills`, `user_delete_status`) VALUES
(3, 'jeffuser', 'jeffuser@gmail.com', '$2a$10$/W.vPNPoiW1MxDDsHS3DtOdVWUip4srzKJUhoY0/nJpkXxjyRaB3a', 0, 'uploads\\users\\profilepic.jpg', '', '', 0),
(6, 'Jeffin', 'jeffinjosev2@gmail.com', '$2a$10$nCaLJ4q0Kyjz2z8u9Y3QxO7Z0VVWCVWHaJieGK/XqiXq8bNQrBy4q', 0, 'uploads\\users\\profilepic.jpg', '', '', 0),
(16, 'jeffuser', 'jeffinjosev1@gmail.com', '$2a$10$oKxpSOsScP4nGOd6HlepVuoigt9T4HwfwNqdzsHEkY.YnOavndfMW', 0, 'uploads\\users\\profilepic.jpg', '', '', 1),
(22, 'Arun', 'arunkp1515@gmail.com', '$2a$10$7lQvKZB0CI7Ed8CWaGSHcuTKCi2TJpHj/znjCzNpKhx6b2AEf.lo2', 0, 'uploads\\users\\profilepic.jpg', '', '', 0),
(23, 'Jeffin', 'jeffinmjtcr@gmail.com', '$2a$10$P3uEi/NvcFDHA3ZFlAiAXOUmV/ei.FUBKkYipPtArkPIhKM4oZ47u', 234234343, 'uploads\\users\\profilepic.jpg', 'MCA', 'Flutter', 0),
(24, 'Ram', 'ram@gmail.com', '$2a$10$gSN.ReznMzSfzjYHPJTYzuD7vux1L6uhKWSfoovInF8M/FvVoK5ve', 0, 'uploads\\users\\profilepic.jpg', '', '', 0),
(25, 'Flower', 'flower123@gmail.com', '$2a$10$UEm3caJSNdT7qE1b6YB/4OgQlZhNWcEVDATKmjhWxpID/KcekpbWG', 0, 'uploads\\users\\profilepic.jpg', '', '', 0),
(26, 'Flower', 'flower24@gmail.com', '$2a$10$u7j3xDXWx0a0Uqv3T67mVuEz90shCrzmmX5smYX7xU0KC11Q0oJmS', 9208567320, 'uploads\\users\\profilepic.jpg', '', '', 0),
(27, 'Anni V', 'Anni123@gmail.com', '$2a$10$kcDTHR2vNDArKK4s355iBeOxhktGDULSN2opZpRBphlR1uTccRAmq', 8642301570, 'uploads\\users\\profilepic.jpg', 'MBA', 'analytical skills', 0),
(31, 'Jasmin', 'Jasmin123@gmail.com', '$2a$10$ucpdNQuJMMMenNZK.xeE6ur9XUbbkK4B9jR2boIuGRYW/c6E5j5cG', 9566107230, 'uploads\\users\\image-1715754152522-22134008.png', 'MCA', 'C++', 1),
(32, 'Joyna', 'joyna@gmail.com', '$2a$10$qyVNtMFtsZawPwRNXx4F9.VyQE1uL79iqnmG27JNAoUVn0C3iPq8i', 123456789, 'uploads\\users\\image-1715768927007-661131994.jpg', 'MCA', 'Java', 0),
(33, 'Suhaila', 'suhu@gmail.com', '$2a$10$IhFs4xHaHEaYUBOzJ.NkKe2ZvXMeVZRVt2b4izxm7O52Leokcpjny', 9784621537, 'uploads\\users\\image-1715844066290-380733309.jpg', 'MCA', 'C', 0),
(34, 'Anna', 'anna@gmail.com', '$2a$10$bYK5tbL7eP8JEA0fzcFr0e5xSMP.eokIED3uCHydYQDMjaQiZXXpC', 9463258451, 'uploads\\users\\image-1716264730896-381966780.jpg', 'MCA', 'C++', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_logs`
--

CREATE TABLE `user_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(1000) NOT NULL,
  `date_time` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`admin_id`);

--
-- Indexes for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `certificate_college`
--
ALTER TABLE `certificate_college`
  ADD PRIMARY KEY (`certificate_id`),
  ADD KEY `certificate_private_event_id` (`certificate_private_event_id`),
  ADD KEY `certificate_student_id` (`certificate_student_id`);

--
-- Indexes for table `certificate_stud`
--
ALTER TABLE `certificate_stud`
  ADD PRIMARY KEY (`certificate_id`),
  ADD KEY `certificate_private_event_id` (`certificate_private_event_id`),
  ADD KEY `certificate_student_id` (`certificate_student_id`);

--
-- Indexes for table `certificate_user`
--
ALTER TABLE `certificate_user`
  ADD PRIMARY KEY (`certificate_id`),
  ADD KEY `certificate_private_event_id` (`certificate_public_event_id`),
  ADD KEY `certificate_student_id` (`certificate_user_id`);

--
-- Indexes for table `college`
--
ALTER TABLE `college`
  ADD PRIMARY KEY (`college_id`),
  ADD KEY `college_addedby` (`college_addedby`),
  ADD KEY `college_updatedby` (`college_updatedby`);

--
-- Indexes for table `counter`
--
ALTER TABLE `counter`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`department_id`),
  ADD KEY `college_id` (`college_id`);

--
-- Indexes for table `event_private`
--
ALTER TABLE `event_private`
  ADD PRIMARY KEY (`event_private_id`),
  ADD KEY `event_addedby` (`event_addedby`),
  ADD KEY `event_updatedby` (`event_updatedby`),
  ADD KEY `event_private_clgid` (`event_private_clgid`);

--
-- Indexes for table `event_public`
--
ALTER TABLE `event_public`
  ADD PRIMARY KEY (`event_public_id`),
  ADD KEY `event_addedby` (`event_addedby`),
  ADD KEY `event_updatedby` (`event_updatedby`);

--
-- Indexes for table `faculty_logs`
--
ALTER TABLE `faculty_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `college_id` (`department_id`);

--
-- Indexes for table `feedback_session_private`
--
ALTER TABLE `feedback_session_private`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `student_id` (`student_id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `feedback_stud`
--
ALTER TABLE `feedback_stud`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `feedback_event_id` (`feedback_event_id`),
  ADD KEY `feedback_student_id` (`feedback_student_id`);

--
-- Indexes for table `feedback_user`
--
ALTER TABLE `feedback_user`
  ADD PRIMARY KEY (`feedback_id`),
  ADD KEY `feedback_user_id` (`feedback_user_id`),
  ADD KEY `feedback_event_id` (`feedback_event_id`);

--
-- Indexes for table `payment_college`
--
ALTER TABLE `payment_college`
  ADD PRIMARY KEY (`payment_college_id`),
  ADD KEY `private_event_id` (`private_event_id`),
  ADD KEY `college_id` (`college_id`);

--
-- Indexes for table `payment_user`
--
ALTER TABLE `payment_user`
  ADD PRIMARY KEY (`payment_user_id`),
  ADD KEY `payment_event_id` (`payment_event_id`),
  ADD KEY `payment_user_id` (`user_id`);

--
-- Indexes for table `session_private`
--
ALTER TABLE `session_private`
  ADD PRIMARY KEY (`session_private_id`),
  ADD KEY `event_private_id` (`event_private_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `event_id` (`event_id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`);

--
-- Indexes for table `user_logs`
--
ALTER TABLE `user_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `admin_logs`
--
ALTER TABLE `admin_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `certificate_college`
--
ALTER TABLE `certificate_college`
  MODIFY `certificate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `certificate_stud`
--
ALTER TABLE `certificate_stud`
  MODIFY `certificate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `certificate_user`
--
ALTER TABLE `certificate_user`
  MODIFY `certificate_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `college`
--
ALTER TABLE `college`
  MODIFY `college_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `counter`
--
ALTER TABLE `counter`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `event_private`
--
ALTER TABLE `event_private`
  MODIFY `event_private_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `event_public`
--
ALTER TABLE `event_public`
  MODIFY `event_public_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `faculty_logs`
--
ALTER TABLE `faculty_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `feedback_session_private`
--
ALTER TABLE `feedback_session_private`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `feedback_stud`
--
ALTER TABLE `feedback_stud`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `feedback_user`
--
ALTER TABLE `feedback_user`
  MODIFY `feedback_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `payment_college`
--
ALTER TABLE `payment_college`
  MODIFY `payment_college_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `payment_user`
--
ALTER TABLE `payment_user`
  MODIFY `payment_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `session_private`
--
ALTER TABLE `session_private`
  MODIFY `session_private_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `student`
--
ALTER TABLE `student`
  MODIFY `student_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `user_logs`
--
ALTER TABLE `user_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_logs`
--
ALTER TABLE `admin_logs`
  ADD CONSTRAINT `admin_logs_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `admin` (`admin_id`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`session_id`) REFERENCES `session_private` (`session_private_id`),
  ADD CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`);

--
-- Constraints for table `certificate_stud`
--
ALTER TABLE `certificate_stud`
  ADD CONSTRAINT `certificate_stud_ibfk_1` FOREIGN KEY (`certificate_private_event_id`) REFERENCES `event_private` (`event_private_id`),
  ADD CONSTRAINT `certificate_stud_ibfk_3` FOREIGN KEY (`certificate_student_id`) REFERENCES `student` (`student_id`);

--
-- Constraints for table `certificate_user`
--
ALTER TABLE `certificate_user`
  ADD CONSTRAINT `certificate_user_ibfk_1` FOREIGN KEY (`certificate_public_event_id`) REFERENCES `event_public` (`event_public_id`),
  ADD CONSTRAINT `certificate_user_ibfk_2` FOREIGN KEY (`certificate_user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `college`
--
ALTER TABLE `college`
  ADD CONSTRAINT `college_ibfk_1` FOREIGN KEY (`college_addedby`) REFERENCES `admin` (`admin_id`),
  ADD CONSTRAINT `college_ibfk_2` FOREIGN KEY (`college_updatedby`) REFERENCES `admin` (`admin_id`);

--
-- Constraints for table `department`
--
ALTER TABLE `department`
  ADD CONSTRAINT `department_ibfk_1` FOREIGN KEY (`college_id`) REFERENCES `college` (`college_id`);

--
-- Constraints for table `event_private`
--
ALTER TABLE `event_private`
  ADD CONSTRAINT `event_private_ibfk_1` FOREIGN KEY (`event_addedby`) REFERENCES `admin` (`admin_id`),
  ADD CONSTRAINT `event_private_ibfk_3` FOREIGN KEY (`event_updatedby`) REFERENCES `admin` (`admin_id`),
  ADD CONSTRAINT `event_private_ibfk_4` FOREIGN KEY (`event_private_clgid`) REFERENCES `college` (`college_id`);

--
-- Constraints for table `event_public`
--
ALTER TABLE `event_public`
  ADD CONSTRAINT `event_public_ibfk_1` FOREIGN KEY (`event_addedby`) REFERENCES `admin` (`admin_id`),
  ADD CONSTRAINT `event_public_ibfk_2` FOREIGN KEY (`event_updatedby`) REFERENCES `admin` (`admin_id`);

--
-- Constraints for table `faculty_logs`
--
ALTER TABLE `faculty_logs`
  ADD CONSTRAINT `faculty_logs_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`);

--
-- Constraints for table `feedback_session_private`
--
ALTER TABLE `feedback_session_private`
  ADD CONSTRAINT `feedback_session_private_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `feedback_session_private_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `session_private` (`session_private_id`);

--
-- Constraints for table `feedback_stud`
--
ALTER TABLE `feedback_stud`
  ADD CONSTRAINT `feedback_stud_ibfk_1` FOREIGN KEY (`feedback_event_id`) REFERENCES `event_private` (`event_private_id`),
  ADD CONSTRAINT `feedback_stud_ibfk_2` FOREIGN KEY (`feedback_student_id`) REFERENCES `student` (`student_id`);

--
-- Constraints for table `feedback_user`
--
ALTER TABLE `feedback_user`
  ADD CONSTRAINT `feedback_user_ibfk_1` FOREIGN KEY (`feedback_user_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `feedback_user_ibfk_2` FOREIGN KEY (`feedback_event_id`) REFERENCES `event_public` (`event_public_id`);

--
-- Constraints for table `payment_college`
--
ALTER TABLE `payment_college`
  ADD CONSTRAINT `payment_college_ibfk_2` FOREIGN KEY (`private_event_id`) REFERENCES `event_private` (`event_private_id`),
  ADD CONSTRAINT `payment_college_ibfk_3` FOREIGN KEY (`college_id`) REFERENCES `college` (`college_id`);

--
-- Constraints for table `payment_user`
--
ALTER TABLE `payment_user`
  ADD CONSTRAINT `payment_user_ibfk_1` FOREIGN KEY (`payment_event_id`) REFERENCES `event_public` (`event_public_id`),
  ADD CONSTRAINT `payment_user_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);

--
-- Constraints for table `session_private`
--
ALTER TABLE `session_private`
  ADD CONSTRAINT `session_private_ibfk_1` FOREIGN KEY (`event_private_id`) REFERENCES `event_private` (`event_private_id`);

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `student_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `event_private` (`event_private_id`);

--
-- Constraints for table `user_logs`
--
ALTER TABLE `user_logs`
  ADD CONSTRAINT `user_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
