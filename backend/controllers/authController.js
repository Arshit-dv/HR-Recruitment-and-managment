const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { username, password, role, referenceId } = req.body;
    if (!username || !password || !role) return res.status(400).json({ success: false, message: 'All fields required' });
    if (!['hr', 'employee'].includes(role)) return res.status(400).json({ success: false, message: 'Role must be hr or employee' });

    const [existing] = await pool.query('SELECT UserID FROM users WHERE Username = ?', [username]);
    if (existing.length) return res.status(409).json({ success: false, message: 'Username already exists' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (Username, PasswordHash, Role, ReferenceID) VALUES (?, ?, ?, ?)',
      [username, hash, role, referenceId || null]
    );
    const token = generateToken(result.insertId, role);
    res.status(201).json({ success: true, token, role, username, user_id: result.insertId });
  } catch (err) { next(err); }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Username and password required' });

    const [rows] = await pool.query('SELECT * FROM users WHERE Username = ?', [username]);
    if (!rows.length) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.PasswordHash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user.UserID, user.Role);
    res.json({
      success: true, token,
      role: user.Role,
      username: user.Username,
      user_id: user.UserID,
      reference_id: user.ReferenceID
    });
  } catch (err) { next(err); }
};

// GET /api/auth/me
const getMe = async (req, res) => res.json({ success: true, user: req.user });

module.exports = { register, login, getMe };
