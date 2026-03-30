# 📘 Project Guide: HR Recruitment & Management System

Welcome! This guide is designed to explain how this project works, especially if you're coming from a background where you primarily know **MySQL** and are new to "web projects."

---

## 1. The "Big Picture" (How it works)

Think of this project like a restaurant:

1.  **The Database (MySQL) - The Pantry:** This is where all the raw data (ingredients) is stored. The tables for Applications, Employees, and Salaries live here.
2.  **The Backend (Node.js/Express) - The Chef:** The Chef knows how to talk to the Pantry. When you need to "Hire someone," the Chef runs a specialized SQL command to move data from the `Applications` table to the `Employees` table.
3.  **The Frontend (React) - The Menu & Waiter:** This is what the user see. It shows buttons like "Pass Interview" or "Pay Salary." When a button is clicked, the Waiter (Frontend) sends a note to the Chef (Backend) saying, "Please execute the hire logic."

### How they talk: The API
The Frontend and Backend communicate using **APIs (Application Programming Interfaces)**. It's like sending a letter:
- **Frontend sends:** `POST /api/employees/hire` with some data.
- **Backend receives it:** Runs the necessary SQL.
- **Backend sends back:** `Success: True`.

---

## 2. Directory Structure

Here is where everything lives:

### 📂 `database/`
*This is your home turf!*
- **`schema.sql`**: Contains all the `CREATE TABLE` and `INSERT` commands. If you want to see exactly how the tables are structured, look here first.

### 📂 `backend/` (The Logic)
This is where we write code that talks to MySQL.
- **`config/db.js`**: This file contains the "connection string" (username, password, host) that allows our code to log into your MySQL server.
- **`routes/`**: Think of these as "Mailboxes." For example, `employeeRoutes.js` defines that anything sent to `/api/employees` should be handled by the employee logic.
- **`controllers/`**: **This is the most important part!** These files contain the actual JavaScript code that runs SQL queries. 
    - *Example:* Inside `employeeController.js`, you'll see lines like `db.query('SELECT * FROM Employees WHERE ID = ?', [id])`. It's just JavaScript wrapping the SQL you already know!
- **`server.js`**: The main brain that starts the server.

### 📂 `frontend/` (The User Interface)
This is what people see in their browser.
- **`src/pages/`**: Each file here is a screen in the app. `Applications.jsx` is the page where you see the list of job seekers.
- **`src/services/api.js`**: This is a helper file that "calls" the backend. It's the "Waiter" mentioned earlier.

---

## 3. The Lifecycle of an Employee

If you were doing this manually in MySQL, you’d be running `INSERT` and `UPDATE` commands. Here is how the project automates it:

1.  **Application:** Someone fills a form online. The Frontend sends data to the Backend, which runs:
    `INSERT INTO Applications (...) VALUES (...)`
2.  **Shortlisting:** An HR manager clicks "Pass." The Backend runs:
    `UPDATE Applications SET Status = 'Accepted' WHERE ID = ...`
3.  **Hiring:** This is a "Transaction." The Backend does two things:
    - `INSERT INTO Employees` (Copies data from the application).
    - `UPDATE Applications` (Marks them as Hired).
4.  **Salary:** When you click "Pay," the Backend calculates the amount and runs:
    `INSERT INTO SalaryPayments (...) VALUES (...)`

---

## 4. Key Files to Explore First

If you want to understand the code, open these files in this order:
1.  **`database/schema.sql`**: To see the tables.
2.  **`backend/controllers/applicationController.js`**: To see how we use SQL to handle job applications.
3.  **`frontend/src/pages/Applications.jsx`**: To see how the user interface is built.

---

## 5. Summary for SQL Users

- **Where is my SQL?** It's inside the `.js` files in the `backend/controllers/` folder.
- **How do I change the database?** Edit `database/schema.sql` and re-run it in MySQL Workbench.
- **How do I add a new feature?** 
    1. Create a table in MySQL.
    2. Add a Controller in the backend to run SQL on that table.
    3. Add a Page in the frontend to show that data.
