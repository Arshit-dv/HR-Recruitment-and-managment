# 📑 Project Report Content: HR Recruitment & Management System

This document contains the structured content for your project report. You can copy and paste these sections directly.

---

## 1. Abstract
**Brief Summary:**
The HR Recruitment & Management System is a comprehensive full-stack web application designed to digitize and automate the human resource lifecycle. Built using the **MERN-like stack (MySQL, Express, React, Node.js)**, the system provides a centralized platform for managing job applications, candidate shortlisting, structured interview scheduling, and offer generation. Beyond recruitment, it seamlessly transitions hired candidates into the employee database, allowing for the management of training programs, salary disbursement, and internal grievances.

**Problem Statement & Solution Overview:**
Organizations often struggle with fragmented HR processes involving manual spreadsheets, lost resumes, and inconsistent communication during hiring. This leads to data redundancy and hiring delays. The solution provided here is a robust, database-driven application that ensures data integrity through a centralized **MySQL** database. It replaces manual workflows with automated transitions—such as converting a successful candidate into an employee with a single click—thereby improving organizational efficiency and record accuracy.

---

## 2. Introduction
**Background of the Problem:**
In the modern corporate world, the talent acquisition process is the backbone of organizational growth. However, many small to medium-sized enterprises still rely on legacy methods for tracking applicants. Managing diverse data points like interview scores, offer expiry dates, and training progress across multiple departments becomes a significant challenge without a dedicated management system.

**Objective of the Project:**
The primary objective is to create a secure, scalable, and user-friendly system that:
- Automates the recruitment funnel from application to hire.
- Provides a transparent interface for HR managers to track candidate progress.
- Maintains a permanent digital record of employees, their designations, and salary history.
- Handles post-hiring activities like training and complaint management.

**Scope and Applications:**
The scope of this project encompasses the entire "Hire-to-Retire" journey. Key applications include:
- **Recruitment Firms:** For managing high volumes of job seekers.
- **Corporate HR Departments:** For internal team management and payroll tracking.
- **Educational Institutions:** For managing faculty recruitment and staff records.
- **Startups:** As a cost-effective alternative to expensive enterprise HR software.

---

## 3. System Requirements

### Hardware Requirements
- **Processor:** Dual Core 2.0 GHz or higher.
- **RAM:** Minimum 4 GB (8 GB recommended for development).
- **Hard Disk:** 500 MB of free space for project files and database.
- **Internet:** Required for downloading dependencies (npm) and accessing the app locally.

### Software Requirements
- **Operating System:** Windows 10/11, macOS, or Linux.
- **Database Management System:** MySQL 8.0 or higher.
- **Runtime Environment:** Node.js (v16.x or higher).
- **Frontend Framework:** React.js (built with Vite).
- **Development Tools:** 
  - Visual Studio Code (Editor)
  - MySQL Workbench or phpMyAdmin (Database GUI)
  - Web Browser (Google Chrome, Firefox, or Edge)

---

## 4. Demo Description
**The demonstration of this project showcases a high-performance, real-time integration between a modern React UI and a robust MySQL backend.**

**o Database Creation & Schema Design:**
The demo begins by executing the `schema.sql` script within the MySQL environment. This initializes the `hr_recruitment_db` with normalized tables, enforcing ACID properties through:
- **Foreign Key Constraints:** Ensuring data consistency across Employees, Departments, and Designations.
- **Enumerated Types (ENUMs):** Restricting application and interview statuses to predefined valid states.
- **Relational Integrity:** Automated cascading deletes to prevent orphaned records.

**o Core Table Operations (CRUD):**
We demonstrate the complete lifecycle of HR data through standard DML operations:
- **CREATE:** Capturing candidate talent via public-facing application forms and resume ingestion.
- **READ:** Real-time synchronization where the HR Dashboard reflects data changes globally.
- **UPDATE:** A "single-click" conversion process that promotes a candidate to an active Employee, automatically calculating JoinDates and linking to Salary structures.
- **DELETE:** Secure removal of outdated training records or disqualified applications, demonstrating database triggers and cleanups.

**o Advanced Query Execution & Analytics:**
The highlight of the demo is the use of complex SQL to drive business intelligence:
- **Relational JOINs:** The Dashboard dynamically pulls a "Department Distribution" summary by joining `Employee`, `Department`, and `Designation` tables in a single optimized query.
- **Interactive Aggregation (SUM/AVG):** On the Salary page, users can select any department from a dropdown to instantly see the **Total Salary Expenditure** and **Average Salary** for that specific group, calculated on-the-fly via backend SQL.
- **Dynamic Headcount:** The Departments page avoids static data by performing a live sub-query count of employees, ensuring the "People" column always shows the current organizational reality.
- **Multi-Level Filtering:** Sophisticated search and filter mechanisms allow HR to isolate records based on performance ratings, salary thresholds, or specific recruitment milestones (e.g., "Passed but no offer").
