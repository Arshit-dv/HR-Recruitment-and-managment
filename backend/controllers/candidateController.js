const pool = require('../config/db');

// GET /api/candidates
const getAllCandidates = async (req, res, next) => {
  try {
    const { filter, minExp } = req.query;
    let query = `
      SELECT c.CandidateID, c.ApplicationID, c.ExpectedSalary, c.Potential,
             MAX(a.FirstName) AS FirstName, MAX(a.LastName) AS LastName,
             MAX(a.PreferredRole) AS PreferredRole, MAX(a.ApplicationDate) AS ApplicationDate,
             MAX(r.Qualification) AS Qualification, MAX(r.Specialization) AS Specialization, MAX(r.YearsOfExperience) AS YearsOfExperience,
             MAX(sc.ScreeningStatus) AS ScreeningStatus,
             MAX(i.InterviewStatus) AS InterviewStatus,
             MAX(t.TrainingStatus) AS TrainingStatus,
             MAX(aw.OfferID) AS AwardedOfferID,
             MAX(e.EmployeeID) AS ConvertedEmployeeID
      FROM candidate c
      LEFT JOIN application a          ON c.ApplicationID = a.ApplicationID
      LEFT JOIN resume r               ON c.ApplicationID = r.ApplicationID
      LEFT JOIN screening sc           ON c.CandidateID = sc.CandidateID
      LEFT JOIN interview i            ON c.CandidateID = i.CandidateID
      LEFT JOIN training t             ON c.CandidateID = t.CandidateID
      LEFT JOIN awarded aw             ON c.CandidateID = aw.CandidateID
      LEFT JOIN employee e             ON c.CandidateID = e.CandidateID
      GROUP BY c.CandidateID, c.ApplicationID, c.ExpectedSalary, c.Potential
      HAVING MAX(sc.ScreeningStatus) = 'Passed'
    `;

    if (filter === 'passed_no_offer') {
      query += ` AND MAX(i.InterviewStatus) = 'Passed' AND MAX(aw.OfferID) IS NULL`;
    }
    if (minExp) {
      query += ` AND MAX(r.YearsOfExperience) >= ${parseInt(minExp)}`;
    }

    query += ` ORDER BY c.CandidateID DESC`;

    const [rows] = await pool.query(query);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// GET /api/candidates/:id
const getCandidateById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const [[cand]] = await pool.query(
      `SELECT c.*, a.PreferredRole, a.ApplicationDate,
              r.Qualification, r.Specialization, r.YearsOfExperience,
              sc.ScreeningStatus
       FROM candidate c
       LEFT JOIN application a ON c.ApplicationID = a.ApplicationID
       LEFT JOIN resume r      ON c.ApplicationID = r.ApplicationID
       LEFT JOIN screening sc  ON c.CandidateID = sc.CandidateID
       WHERE c.CandidateID = ?`, [id]
    );
    if (!cand) return res.status(404).json({ success: false, message: 'Candidate not found' });

    const [interviews]   = await pool.query('SELECT * FROM interview WHERE CandidateID = ?', [id]);
    const [offers]       = await pool.query('SELECT o.*, s.SalaryAmount, ct.NoticePeriod FROM offer o LEFT JOIN salary s ON o.SalaryID=s.SalaryID LEFT JOIN contract ct ON o.ContractID=ct.ContractID WHERE o.CandidateID = ?', [id]);
    const [awarded]      = await pool.query('SELECT * FROM awarded WHERE CandidateID = ?', [id]);
    const [training]     = await pool.query('SELECT * FROM training WHERE CandidateID = ?', [id]);
    const [interviewers] = await pool.query('SELECT EmployeeID FROM employeecandidate WHERE CandidateID = ?', [id]);

    res.json({ success: true, data: { ...cand, interviews, offers, awarded, training, interviewers } });
  } catch (err) { next(err); }
};

// POST /api/candidates — manual creation (skip application step)
const createCandidate = async (req, res, next) => {
  try {
    const { ExpectedSalary, Potential, PreferredRole, Qualification } = req.body;
    // Create minimal application shadow for a manual candidate
    const AppID = await nextID('application', 'ApplicationID');
    await pool.query('INSERT INTO application (ApplicationID, PreferredRole, ApplicationDate) VALUES (?, ?, ?)', [AppID, PreferredRole || 'Software Engineer', new Date().toISOString().split('T')[0]]);
    await pool.query('INSERT INTO resume (ApplicationID, Qualification) VALUES (?, ?)', [AppID, Qualification || 'N/A']);
    
    const CandID = await nextID('candidate', 'CandidateID');
    await pool.query('INSERT INTO candidate (CandidateID, ApplicationID, ExpectedSalary, Potential) VALUES (?, ?, ?, ?)', [CandID, AppID, ExpectedSalary || 0, Potential || 'Medium']);
    await pool.query('INSERT INTO screening (ApplicationID, CandidateID, ScreeningStatus) VALUES (?, ?, ?)', [AppID, CandID, 'Passed']);
    
    res.status(201).json({ success: true, message: 'Candidate created manually', CandidateID: CandID });
  } catch (err) { next(err); }
};

// PATCH /api/candidates/:id
const updateCandidate = async (req, res, next) => {
  try {
    const { ExpectedSalary, Potential } = req.body;
    await pool.query('UPDATE candidate SET ExpectedSalary=COALESCE(?,ExpectedSalary), Potential=COALESCE(?,Potential) WHERE CandidateID=?', [ExpectedSalary, Potential, req.params.id]);
    res.json({ success: true, message: 'Candidate updated' });
  } catch (err) { next(err); }
};

// DELETE /api/candidates/:id
const deleteCandidate = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const id = req.params.id;

    // Ordered cleanup to satisfy FK constraints
    await conn.query('DELETE FROM employeetraining WHERE CandidateID = ?', [id]);
    await conn.query('DELETE FROM training      WHERE CandidateID = ?', [id]);
    await conn.query('DELETE FROM awarded       WHERE CandidateID = ?', [id]);
    await conn.query('DELETE FROM offer         WHERE CandidateID = ?', [id]);
    await conn.query('DELETE FROM interview     WHERE CandidateID = ?', [id]);
    await conn.query('DELETE FROM employeecandidate WHERE CandidateID = ?', [id]);
    await conn.query('DELETE FROM screening     WHERE CandidateID = ?', [id]);
    
    const [result] = await conn.query('DELETE FROM candidate WHERE CandidateID = ?', [id]);
    
    await conn.commit();
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Candidate not found' });
    res.json({ success: true, message: 'Candidate and all related data deleted' });
  } catch (err) {
    if (conn) await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

const nextID = async (table, pkCol) => {
  const [[row]] = await pool.query(`SELECT COALESCE(MAX(${pkCol}), 0) + 1 AS n FROM ${table}`);
  return row.n;
};

module.exports = { getAllCandidates, getCandidateById, createCandidate, updateCandidate, deleteCandidate };

