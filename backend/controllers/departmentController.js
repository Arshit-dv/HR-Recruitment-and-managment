const pool = require('../config/db');

const nextID = async (table, pkCol) => {
  const [[row]] = await pool.query(`SELECT COALESCE(MAX(${pkCol}), 0) + 1 AS n FROM ${table}`);
  return row.n;
};

// ─── CONTRACTS ────────────────────────────────────────────────────────────────

// GET /api/contracts
const getAllContracts = async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM contract ORDER BY ContractDate DESC');
    res.json({ success: true, count: rows.length, data: rows });
  } catch (err) { next(err); }
};

// GET /api/contracts/:id
const getContractById = async (req, res, next) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM contract WHERE ContractID = ?', [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: 'Contract not found' });
    res.json({ success: true, data: row });
  } catch (err) { next(err); }
};

// POST /api/contracts  — HR: pre-define a contract structure
// Body: { ContractDate, NoticePeriod }
const createContract = async (req, res, next) => {
  try {
    const { ContractDate, NoticePeriod } = req.body;
    if (!NoticePeriod) return res.status(400).json({ success: false, message: 'NoticePeriod is required' });
    const ContractID = await nextID('contract', 'ContractID');
    const date = ContractDate || new Date().toISOString().split('T')[0];
    await pool.query('INSERT INTO contract (ContractID, ContractDate, NoticePeriod) VALUES (?, ?, ?)', [ContractID, date, NoticePeriod]);
    res.status(201).json({ success: true, message: 'Contract created', ContractID });
  } catch (err) { next(err); }
};

// ─── DEPARTMENTS ──────────────────────────────────────────────────────────────

// GET /api/departments
const getAllDepartments = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT d.DeptID, d.DeptName, MAX(d.DeptVacancies) AS DeptVacancies, MAX(d.DeptPerformance) AS DeptPerformance,
              (SELECT COUNT(DISTINCT e.EmployeeID) FROM employee e 
               JOIN designation des ON e.DesignationID = des.DesignationID 
               WHERE des.DeptID = d.DeptID) AS DeptNoOfEmployees,
              COUNT(des.DesignationID) AS DesignationCount
       FROM department d
       LEFT JOIN designation des ON d.DeptID = des.DeptID
       GROUP BY d.DeptID
       ORDER BY d.DeptID`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// GET /api/designations
const getAllDesignations = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT des.DesignationID, des.DeptID, des.Role, des.Vacancies,
              (SELECT COUNT(*) FROM employee e WHERE e.DesignationID = des.DesignationID) AS CurrentEmployees,
              dept.DeptPerformance
       FROM designation des
       LEFT JOIN department dept ON des.DeptID = dept.DeptID
       ORDER BY des.Role`
    );
    res.json({ success: true, data: rows });
  } catch (err) { next(err); }
};

// PATCH /api/org/contracts/:id
const updateContract = async (req, res, next) => {
  try {
    const { ContractDate, NoticePeriod } = req.body;
    await pool.query('UPDATE contract SET ContractDate=COALESCE(?,ContractDate), NoticePeriod=COALESCE(?,NoticePeriod) WHERE ContractID=?', [ContractDate, NoticePeriod, req.params.id]);
    res.json({ success: true, message: 'Contract updated' });
  } catch (err) { next(err); }
};

// DELETE /api/org/contracts/:id
const deleteContract = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM contract WHERE ContractID = ?', [req.params.id]);
    res.json({ success: true, message: 'Contract deleted' });
  } catch (err) { next(err); }
};

// PATCH /api/org/departments/:id
const updateDepartment = async (req, res, next) => {
  try {
    const { DeptName, DeptVacancies, DeptPerformance, DeptNoOfEmployees } = req.body;
    await pool.query('UPDATE department SET DeptName=COALESCE(?,DeptName), DeptVacancies=COALESCE(?,DeptVacancies), DeptPerformance=COALESCE(?,DeptPerformance), DeptNoOfEmployees=COALESCE(?,DeptNoOfEmployees) WHERE DeptID=?', [DeptName, DeptVacancies, DeptPerformance, DeptNoOfEmployees, req.params.id]);
    res.json({ success: true, message: 'Department updated' });
  } catch (err) { next(err); }
};

// DELETE /api/org/departments/:id
const deleteDepartment = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM department WHERE DeptID = ?', [req.params.id]);
    res.json({ success: true, message: 'Department deleted' });
  } catch (err) { next(err); }
};

// POST /api/org/designations  — HR
const createDesignation = async (req, res, next) => {
  try {
    const { DeptID, Role, Vacancies, NoOfEmployees } = req.body;
    const id = await nextID('designation', 'DesignationID');
    await pool.query('INSERT INTO designation (DesignationID, DeptID, Role, Vacancies, NoOfEmployees) VALUES (?, ?, ?, ?, ?)', [id, DeptID, Role, Vacancies || 0, NoOfEmployees || 0]);
    res.status(201).json({ success: true, message: 'Designation created', DesignationID: id });
  } catch (err) { next(err); }
};

// DELETE /api/org/designations/:id
const deleteDesignation = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM designation WHERE DesignationID = ?', [req.params.id]);
    res.json({ success: true, message: 'Designation deleted' });
  } catch (err) { next(err); }
};

// POST /api/org/departments  — HR
const createDepartment = async (req, res, next) => {
  try {
    const { DeptName, DeptVacancies = 0, DeptPerformance = 'Medium', DeptNoOfEmployees = 0 } = req.body;
    const DeptID = await nextID('department', 'DeptID');
    await pool.query('INSERT INTO department (DeptID, DeptName, DeptVacancies, DeptPerformance, DeptNoOfEmployees) VALUES (?, ?, ?, ?, ?)', [DeptID, DeptName, DeptVacancies, DeptPerformance, DeptNoOfEmployees]);
    res.status(201).json({ success: true, message: 'Department created', DeptID });
  } catch (err) { next(err); }
};

// PATCH /api/org/designations/:id  — HR
const updateDesignation = async (req, res, next) => {
  try {
    const { Role, Vacancies, NoOfEmployees } = req.body;
    await pool.query('UPDATE designation SET Role=COALESCE(?,Role), Vacancies=COALESCE(?,Vacancies), NoOfEmployees=COALESCE(?,NoOfEmployees) WHERE DesignationID=?', [Role, Vacancies, NoOfEmployees, req.params.id]);
    res.json({ success: true, message: 'Designation updated' });
  } catch (err) { next(err); }
};

module.exports = { 
  getAllContracts, getContractById, createContract, updateContract, deleteContract,
  getAllDepartments, createDepartment, updateDepartment, deleteDepartment,
  getAllDesignations, createDesignation, updateDesignation, deleteDesignation 
};

