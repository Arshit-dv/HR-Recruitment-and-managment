const pool = require('../config/db');

const nextID = async (table, pkCol) => {
  const [[row]] = await pool.query(`SELECT COALESCE(MAX(${pkCol}), 0) + 1 AS n FROM ${table}`);
  return row.n;
};

// POST /api/complaints  — employee submits complaint
// Body: { EmployeeID, ComplaintStatus, Priority }
const submitComplaint = async (req, res, next) => {
  try {
    const { EmployeeID, ComplaintStatus, Priority, Description } = req.body;
    if (!EmployeeID) return res.status(400).json({ success: false, message: 'EmployeeID is required' });

    const [[emp]] = await pool.query('SELECT EmployeeID FROM employee WHERE EmployeeID=?', [EmployeeID]);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });

    const ComplaintID = await nextID('complaint', 'ComplaintID');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
      'INSERT INTO complaint (ComplaintID, EmployeeID, ComplaintStatus, Description, ComplaintDateTime, Priority) VALUES (?, ?, ?, ?, ?, ?)',
      [ComplaintID, EmployeeID, ComplaintStatus || 'Open', Description || '', now, Priority || 'Medium']
    );
    res.status(201).json({ success: true, message: 'Complaint filed', ComplaintID });
  } catch (err) { next(err); }
};

// GET /api/complaints  — HR
const getAllComplaints = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.ComplaintID, c.EmployeeID, c.Description, c.ComplaintStatus, c.ComplaintDateTime, c.Priority,
              e.DesignationID, e.JoinDate, e.Performance,
              d.Role AS DesignationRole
       FROM complaint c
       LEFT JOIN employee e    ON c.EmployeeID = e.EmployeeID
       LEFT JOIN designation d ON e.DesignationID = d.DesignationID
       ORDER BY c.ComplaintDateTime DESC`
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// GET /api/complaints/employee/:employeeId
const getComplaintsByEmployee = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM complaint WHERE EmployeeID=? ORDER BY ComplaintDateTime DESC',
      [req.params.employeeId]
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// PATCH /api/complaints/:id/status  — HR updates complaint status
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { ComplaintStatus, Priority } = req.body;
    const valid = ['Open', 'Under Review', 'Resolved', 'Closed'];
    if (ComplaintStatus && !valid.includes(ComplaintStatus)) {
      return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });
    }
    await pool.query(
      'UPDATE complaint SET ComplaintStatus=COALESCE(?,ComplaintStatus), Priority=COALESCE(?,Priority) WHERE ComplaintID=?',
      [ComplaintStatus, Priority, req.params.id]
    );
    res.json({ success: true, message: 'Complaint updated' });
  } catch (err) { next(err); }
};

// DELETE /api/complaints/:id
const deleteComplaint = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM complaint WHERE ComplaintID = ?', [req.params.id]);
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) { next(err); }
};

module.exports = { submitComplaint, getAllComplaints, getComplaintsByEmployee, updateComplaintStatus, deleteComplaint };

