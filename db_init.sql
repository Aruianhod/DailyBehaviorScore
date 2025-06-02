DROP DATABASE IF EXISTS score_system;
CREATE DATABASE score_system DEFAULT CHARSET utf8mb4;
USE score_system;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(32) NOT NULL UNIQUE,
  password VARCHAR(64) NOT NULL,
  user_type ENUM('admin','teacher','student') NOT NULL,
  name VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32) NOT NULL UNIQUE,
  name VARCHAR(64) NOT NULL,
  grade YEAR NOT NULL,
  class VARCHAR(16) NOT NULL,
  score INT DEFAULT 100,
  status ENUM('active', 'archived') DEFAULT 'active',
  FOREIGN KEY (student_id) REFERENCES users(username)
);

CREATE TABLE score_records (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32) NOT NULL,
  operator VARCHAR(32) NOT NULL,
  reason VARCHAR(128) NOT NULL,
  delta INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('active', 'archived') DEFAULT 'active',
  FOREIGN KEY (student_id) REFERENCES students(student_id)
);

CREATE TABLE IF NOT EXISTS score_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(32), 
  student_name VARCHAR(64),
  student_ids TEXT, 
  student_names TEXT,
  delta INT NOT NULL,
  reason VARCHAR(128) NOT NULL,
  date DATE NOT NULL,
  status ENUM('pending','approved','rejected') DEFAULT 'pending',
  archive_status ENUM('active', 'archived') DEFAULT 'active',
  teacher VARCHAR(64),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user VARCHAR(32) NOT NULL,
  content VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 归档记录表
CREATE TABLE archive_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  archive_date DATE NOT NULL,
  grades_archived JSON NOT NULL,
  file_path VARCHAR(500),
  student_count INT NOT NULL,
  record_count INT NOT NULL,
  application_count INT NOT NULL,
  file_size BIGINT,
  archive_reason VARCHAR(255),
  created_by VARCHAR(32) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_archive_date (archive_date)
);

INSERT INTO users (username, password, user_type, name) VALUES
('admin', 'admin123', 'admin', '管理员'),
('teacher1', 'teacher123', 'teacher', '张老师'),
('2025000001', '2025000001', 'student', '李明');

INSERT INTO students (student_id, name, grade, class, score) VALUES
('2025000001', '李明', 2022, '2204103', 100);
