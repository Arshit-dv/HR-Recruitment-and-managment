-- ============================================================
-- Run this ONE TIME in MySQL Workbench on your 'vit' database
-- to add the authentication table (the only missing piece)
-- ============================================================
USE vit;

CREATE TABLE IF NOT EXISTS users (
  UserID       INT AUTO_INCREMENT PRIMARY KEY,
  Username     VARCHAR(100) NOT NULL UNIQUE,
  PasswordHash VARCHAR(255) NOT NULL,
  Role         ENUM('hr','employee') NOT NULL DEFAULT 'employee',
  ReferenceID  INT DEFAULT NULL,   -- EmployeeID for employee role
  CreatedAt    DATETIME DEFAULT NOW()
);

-- Default HR admin account  (password: admin123)
INSERT IGNORE INTO users (Username, PasswordHash, Role)
VALUES ('admin', '$2a$10$mQpBVQESkwpQrFnqVgC1AeHzMdRXCPEJ4qLGqf.3r7cxbKAT3w.vy', 'hr');
