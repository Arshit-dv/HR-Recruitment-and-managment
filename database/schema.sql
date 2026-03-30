-- ============================================================
-- HR Recruitment & Management System — Database Setup
-- Run this ONLY if you haven't already created the tables.
-- If your tables already exist, skip creation and only run
-- the INSERT statements at the bottom for seed data.
-- ============================================================

CREATE DATABASE IF NOT EXISTS hr_recruitment_db;
USE hr_recruitment_db;

-- ── Users (for authentication) ────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('hr','employee','candidate') NOT NULL DEFAULT 'candidate',
  created_at    DATETIME DEFAULT NOW()
);

-- ── Application ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application (
  application_id  INT AUTO_INCREMENT PRIMARY KEY,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(150) NOT NULL,
  phone           VARCHAR(20),
  position_applied VARCHAR(150) NOT NULL,
  resume_url      VARCHAR(255),
  cover_letter    TEXT,
  status          ENUM('pending','reviewed','shortlisted','rejected') DEFAULT 'pending',
  applied_date    DATETIME DEFAULT NOW()
);

-- ── Candidate ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidate (
  candidate_id    INT AUTO_INCREMENT PRIMARY KEY,
  application_id  INT,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(150),
  phone           VARCHAR(20),
  position_applied VARCHAR(150),
  screening_notes TEXT,
  screening_score DECIMAL(5,2),
  status          ENUM('screening','interview','offered','hired','rejected') DEFAULT 'screening',
  created_at      DATETIME DEFAULT NOW(),
  FOREIGN KEY (application_id) REFERENCES application(application_id) ON DELETE SET NULL
);

-- ── Interview ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS interview (
  interview_id    INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id    INT NOT NULL,
  interview_date  DATE NOT NULL,
  interview_time  TIME NOT NULL,
  interview_type  ENUM('in-person','online','phone') DEFAULT 'in-person',
  interviewer_name VARCHAR(150),
  location        VARCHAR(255),
  notes           TEXT,
  status          ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled',
  result          ENUM('pass','fail','pending') DEFAULT 'pending',
  feedback        TEXT,
  score           DECIMAL(5,2),
  created_at      DATETIME DEFAULT NOW(),
  FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id) ON DELETE CASCADE
);

-- ── Department ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS department (
  department_id   INT AUTO_INCREMENT PRIMARY KEY,
  department_name VARCHAR(150) NOT NULL UNIQUE,
  head_of_department VARCHAR(150),
  description     TEXT
);

-- ── Designation ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS designation (
  designation_id  INT AUTO_INCREMENT PRIMARY KEY,
  designation_title VARCHAR(150) NOT NULL,
  department_id   INT,
  description     TEXT,
  FOREIGN KEY (department_id) REFERENCES department(department_id) ON DELETE SET NULL
);

-- ── Employee ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employee (
  employee_id     INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id    INT,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  email           VARCHAR(150),
  phone           VARCHAR(20),
  department_id   INT,
  designation_id  INT,
  date_of_joining DATE,
  basic_salary    DECIMAL(10,2) DEFAULT 0,
  status          ENUM('active','inactive','terminated') DEFAULT 'active',
  created_at      DATETIME DEFAULT NOW(),
  FOREIGN KEY (candidate_id)   REFERENCES candidate(candidate_id) ON DELETE SET NULL,
  FOREIGN KEY (department_id)  REFERENCES department(department_id) ON DELETE SET NULL,
  FOREIGN KEY (designation_id) REFERENCES designation(designation_id) ON DELETE SET NULL
);

-- ── Offer Letter ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS offer_letter (
  offer_id        INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id    INT NOT NULL,
  salary_offered  DECIMAL(10,2) NOT NULL,
  position        VARCHAR(150) NOT NULL,
  joining_date    DATE NOT NULL,
  offer_expiry    DATE,
  benefits        TEXT,
  notes           TEXT,
  status          ENUM('pending','accepted','rejected','expired') DEFAULT 'pending',
  generated_at    DATETIME DEFAULT NOW(),
  responded_at    DATETIME,
  FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id) ON DELETE CASCADE
);

-- ── Training ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS training (
  training_id     INT AUTO_INCREMENT PRIMARY KEY,
  candidate_id    INT,
  employee_id     INT,
  training_name   VARCHAR(200) NOT NULL,
  trainer         VARCHAR(150),
  start_date      DATE NOT NULL,
  end_date        DATE,
  description     TEXT,
  status          ENUM('ongoing','completed','cancelled') DEFAULT 'ongoing',
  created_at      DATETIME DEFAULT NOW(),
  FOREIGN KEY (candidate_id) REFERENCES candidate(candidate_id) ON DELETE SET NULL,
  FOREIGN KEY (employee_id)  REFERENCES employee(employee_id) ON DELETE SET NULL
);

-- ── Salary ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary (
  salary_id       INT AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT NOT NULL,
  basic           DECIMAL(10,2) NOT NULL,
  allowances      DECIMAL(10,2) DEFAULT 0,
  deductions      DECIMAL(10,2) DEFAULT 0,
  net_salary      DECIMAL(10,2) NOT NULL,
  payment_date    DATE NOT NULL,
  payment_mode    ENUM('bank_transfer','cash','cheque') DEFAULT 'bank_transfer',
  status          ENUM('paid','pending') DEFAULT 'paid',
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- ── Contract ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract (
  contract_id     INT AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT NOT NULL,
  contract_type   ENUM('permanent','contract','internship','probation') DEFAULT 'permanent',
  start_date      DATE NOT NULL,
  end_date        DATE,
  terms           TEXT,
  status          ENUM('active','expired','terminated') DEFAULT 'active',
  created_at      DATETIME DEFAULT NOW(),
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- ── Complaint ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS complaint (
  complaint_id    INT AUTO_INCREMENT PRIMARY KEY,
  employee_id     INT NOT NULL,
  subject         VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  complaint_type  VARCHAR(100) DEFAULT 'general',
  status          ENUM('open','under_review','resolved','closed') DEFAULT 'open',
  resolution_notes TEXT,
  submitted_at    DATETIME DEFAULT NOW(),
  resolved_at     DATETIME,
  FOREIGN KEY (employee_id) REFERENCES employee(employee_id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA — Sample departments and designations
-- ============================================================
INSERT IGNORE INTO department (department_name, head_of_department, description) VALUES
('Engineering',     'Alice Johnson', 'Software development and IT'),
('Human Resources', 'Bob Smith',     'HR and recruitment'),
('Finance',         'Carol White',   'Finance and accounts'),
('Marketing',       'Dave Clark',    'Marketing and sales');

INSERT IGNORE INTO designation (designation_title, department_id, description) VALUES
('Software Engineer',     1, 'Develops software products'),
('Senior Engineer',       1, 'Leads technical projects'),
('HR Manager',            2, 'Manages HR operations'),
('HR Executive',          2, 'Recruitment and onboarding'),
('Finance Analyst',       3, 'Financial analysis'),
('Marketing Executive',   4, 'Handles marketing campaigns');
