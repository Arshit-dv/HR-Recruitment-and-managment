const pool = require('../config/db');

const nextID = async (table, pkCol) => {
    const [[row]] = await pool.query(`SELECT COALESCE(MAX(${pkCol}), 0) + 1 AS n FROM ${table}`);
    return row.n;
};

// GET /api/attendance
const getAttendance = async (req, res, next) => {
    try {
        const { employee_id, start_date, end_date } = req.query;
        let query = `
            SELECT a.*, e.Performance, d.Role as Designation 
            FROM attendance a
            JOIN employee e ON a.EmployeeID = e.EmployeeID
            LEFT JOIN designation d ON e.DesignationID = d.DesignationID
            WHERE 1=1
        `;
        const params = [];
        if (employee_id) {
            query += " AND a.EmployeeID = ?";
            params.push(employee_id);
        }
        if (start_date) {
            query += " AND a.Date >= ?";
            params.push(start_date);
        }
        if (end_date) {
            query += " AND a.Date <= ?";
            params.push(end_date);
        }
        query += " ORDER BY a.Date DESC";

        const [rows] = await pool.query(query, params);
        res.json({ success: true, count: rows.length, data: rows });
    } catch (err) { next(err); }
};

// POST /api/attendance (Mark attendance)
const markAttendance = async (req, res, next) => {
    try {
        const { EmployeeID, Date: attDate, Status, CheckIn, CheckOut } = req.body;
        if (!EmployeeID || !attDate) return res.status(400).json({ success: false, message: 'EmployeeID and Date are required' });

        const id = await nextID('attendance', 'AttendanceID');
        await pool.query(
            'INSERT INTO attendance (AttendanceID, EmployeeID, Date, Status, CheckIn, CheckOut) VALUES (?, ?, ?, ?, ?, ?)',
            [id, EmployeeID, attDate, Status || 'Present', CheckIn, CheckOut]
        );
        res.status(201).json({ success: true, message: 'Attendance marked', AttendanceID: id });
    } catch (err) { next(err); }
};

// GET /api/attendance/report (Aggregated report)
const getAttendanceReport = async (req, res, next) => {
    try {
        const { month, year } = req.query; // format 'MM', 'YYYY'
        let query = `
            SELECT e.EmployeeID, 
                   COUNT(CASE WHEN a.Status = 'Present' THEN 1 END) as PresentDays,
                   COUNT(CASE WHEN a.Status = 'Absent' THEN 1 END) as AbsentDays,
                   COUNT(CASE WHEN a.Status = 'Leave' THEN 1 END) as LeaveDays,
                   COUNT(CASE WHEN a.Status = 'Half-Day' THEN 1 END) as HalfDays
            FROM employee e
            LEFT JOIN attendance a ON e.EmployeeID = a.EmployeeID
        `;
        const params = [];
        if (month && year) {
            query += " AND MONTH(a.Date) = ? AND YEAR(a.Date) = ?";
            params.push(month, year);
        }
        query += " GROUP BY e.EmployeeID";

        const [rows] = await pool.query(query, params);
        res.json({ success: true, data: rows });
    } catch (err) { next(err); }
};

module.exports = { getAttendance, markAttendance, getAttendanceReport };
