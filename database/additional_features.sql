-- Additional Features for HR Recruitment System

-- Payscale & Grade
CREATE TABLE IF NOT EXISTS payscale (
  PayscaleID   INT PRIMARY KEY,
  Grade        VARCHAR(50) NOT NULL,
  BaseSalary   DECIMAL(10,2) NOT NULL,
  HRA          DECIMAL(10,2) DEFAULT 0,
  DA           DECIMAL(10,2) DEFAULT 0,
  Others       DECIMAL(10,2) DEFAULT 0
);

-- Attendance
CREATE TABLE IF NOT EXISTS attendance (
  AttendanceID INT PRIMARY KEY,
  EmployeeID   INT NOT NULL,
  Date         DATE NOT NULL,
  Status       ENUM('Present', 'Absent', 'Leave', 'Half-Day') DEFAULT 'Present',
  CheckIn      TIME,
  CheckOut     TIME,
  FOREIGN KEY (EmployeeID) REFERENCES employee(EmployeeID) ON DELETE CASCADE
);

-- Seed some Payscales
INSERT IGNORE INTO payscale (PayscaleID, Grade, BaseSalary, HRA, DA, Others) VALUES
(1, 'Grade A', 100000, 20000, 10000, 5000),
(2, 'Grade B', 80000, 15000, 8000, 4000),
(3, 'Grade C', 60000, 10000, 6000, 3000),
(4, 'Grade D', 40000, 5000, 4000, 2000);
