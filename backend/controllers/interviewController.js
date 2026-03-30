const pool = require('../config/db');

const nextID = async (table, pkCol) => {
  const [[row]] = await pool.query(`SELECT COALESCE(MAX(${pkCol}), 0) + 1 AS n FROM ${table}`);
  return row.n;
};

// POST /api/interviews  — HR
// Body: { CandidateID, InterviewDate, Time, Venue, InterviewerEmployeeIDs[] }
const scheduleInterview = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { CandidateID, InterviewDate, Time, Venue, InterviewerEmployeeIDs = [] } = req.body;
    if (!CandidateID || !InterviewDate || !Time) {
      return res.status(400).json({ success: false, message: 'CandidateID, InterviewDate, Time are required' });
    }
    // Verify candidate exists
    const [[cand]] = await conn.query('SELECT CandidateID FROM candidate WHERE CandidateID = ?', [CandidateID]);
    if (!cand) return res.status(404).json({ success: false, message: 'Candidate not found' });

    const IntID = await nextID('interview', 'InterviewID');
    await conn.query(
      'INSERT INTO interview (InterviewID, CandidateID, InterviewDate, Time, Venue, InterviewStatus) VALUES (?, ?, ?, ?, ?, ?)',
      [IntID, CandidateID, InterviewDate, Time, Venue || null, 'Scheduled']
    );

    // Add interviewers (employees who conduct the interview)
    for (const empID of InterviewerEmployeeIDs) {
      // Insert into employeecandidate — only if not already exists
      const [[exists]] = await conn.query(
        'SELECT EmployeeID FROM employeecandidate WHERE EmployeeID = ? AND CandidateID = ?',
        [empID, CandidateID]
      );
      if (!exists) {
        await conn.query('INSERT INTO employeecandidate (EmployeeID, CandidateID) VALUES (?, ?)', [empID, CandidateID]);
      }
    }

    await conn.commit();
    res.status(201).json({ success: true, message: 'Interview scheduled', InterviewID: IntID });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally { conn.release(); }
};

// GET /api/interviews  — HR
const getAllInterviews = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.InterviewID, i.CandidateID, i.InterviewDate, i.Time, i.Venue, i.InterviewStatus,
              a.FirstName, a.LastName,
              c.ApplicationID, c.Potential, c.ExpectedSalary,
              a.PreferredRole, r.Qualification, r.Specialization,
              GROUP_CONCAT(ec.EmployeeID ORDER BY ec.EmployeeID SEPARATOR ', ') AS Interviewers
       FROM interview i
       LEFT JOIN candidate c           ON i.CandidateID = c.CandidateID
       LEFT JOIN application a         ON c.ApplicationID = a.ApplicationID
       LEFT JOIN resume r              ON c.ApplicationID = r.ApplicationID
       LEFT JOIN employeecandidate ec  ON i.CandidateID = ec.CandidateID
       GROUP BY i.InterviewID
       ORDER BY i.InterviewDate DESC`
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// PATCH /api/interviews/:id  — HR: update status (Scheduled / Passed / Failed)
const updateInterviewStatus = async (req, res, next) => {
  try {
    const { InterviewStatus } = req.body;
    const valid = ['Scheduled', 'Passed', 'Failed', 'Cancelled'];
    if (!valid.includes(InterviewStatus)) return res.status(400).json({ success: false, message: `Status must be one of: ${valid.join(', ')}` });

    const [result] = await pool.query(
      'UPDATE interview SET InterviewStatus = ? WHERE InterviewID = ?',
      [InterviewStatus, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, message: `Interview marked as ${InterviewStatus}` });
  } catch (err) { next(err); }
};

// DELETE /api/interviews/:id
const deleteInterview = async (req, res, next) => {
  try {
    const [result] = await pool.query('DELETE FROM interview WHERE InterviewID = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Interview not found' });
    res.json({ success: true, message: 'Interview deleted' });
  } catch (err) { next(err); }
};

module.exports = { scheduleInterview, getAllInterviews, updateInterviewStatus, deleteInterview };
