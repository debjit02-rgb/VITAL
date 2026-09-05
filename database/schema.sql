-- ============================================================
-- VITAL DATABASE SCHEMA
-- ============================================================
CREATE DATABASE IF NOT EXISTS vital;
USE vital;

-- Table: assignment_results
CREATE TABLE `assignment_results` (
  `result_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `assignment_id` int NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `student_id` (`student_id`,`assignment_id`),
  KEY `assignment_id` (`assignment_id`),
  CONSTRAINT `assignment_results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `assignment_results_ibfk_2` FOREIGN KEY (`assignment_id`) REFERENCES `assignments` (`assignment_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: assignments
CREATE TABLE `assignments` (
  `assignment_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `total_marks` int NOT NULL,
  `assignment_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`assignment_id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: attendance
CREATE TABLE `attendance` (
  `attendance_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `session_id` int NOT NULL,
  `status` enum('Present','Absent') NOT NULL DEFAULT 'Present',
  `marked_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`attendance_id`),
  UNIQUE KEY `student_id` (`student_id`,`session_id`),
  KEY `session_id` (`session_id`),
  CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `attendance_ibfk_2` FOREIGN KEY (`session_id`) REFERENCES `attendance_sessions` (`session_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: attendance_sessions
CREATE TABLE `attendance_sessions` (
  `session_id` int NOT NULL AUTO_INCREMENT,
  `subject` varchar(100) NOT NULL,
  `session_date` date NOT NULL,
  `start_time` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: predictions
CREATE TABLE `predictions` (
  `prediction_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `attendance_percentage` decimal(5,2) NOT NULL,
  `quiz_score` decimal(5,2) NOT NULL,
  `assignment_score` decimal(5,2) NOT NULL,
  `understanding_level` enum('Poor','Average','Good','Excellent') NOT NULL,
  `prediction_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`prediction_id`),
  KEY `student_id` (`student_id`),
  CONSTRAINT `predictions_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: quiz_questions
CREATE TABLE `quiz_questions` (
  `question_id` int NOT NULL AUTO_INCREMENT,
  `quiz_id` int NOT NULL,
  `question` text NOT NULL,
  `option_a` varchar(500) NOT NULL,
  `option_b` varchar(500) NOT NULL,
  `option_c` varchar(500) NOT NULL,
  `option_d` varchar(500) NOT NULL,
  `correct_option` char(1) NOT NULL,
  PRIMARY KEY (`question_id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_questions_ibfk_1` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: quiz_results
CREATE TABLE `quiz_results` (
  `result_id` int NOT NULL AUTO_INCREMENT,
  `student_id` int NOT NULL,
  `quiz_id` int NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `submitted_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`result_id`),
  UNIQUE KEY `student_id` (`student_id`,`quiz_id`),
  KEY `quiz_id` (`quiz_id`),
  CONSTRAINT `quiz_results_ibfk_1` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  CONSTRAINT `quiz_results_ibfk_2` FOREIGN KEY (`quiz_id`) REFERENCES `quizzes` (`quiz_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: quizzes
CREATE TABLE `quizzes` (
  `quiz_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(200) NOT NULL,
  `subject` varchar(100) NOT NULL,
  `total_marks` int NOT NULL,
  `quiz_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`quiz_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Table: students
CREATE TABLE `students` (
  `student_id` int NOT NULL AUTO_INCREMENT,
  `roll_number` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `face_encoding` blob,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`student_id`),
  UNIQUE KEY `roll_number` (`roll_number`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
