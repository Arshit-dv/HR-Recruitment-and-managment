require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const authRoutes        = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const candidateRoutes   = require('./routes/candidateRoutes');
const interviewRoutes   = require('./routes/interviewRoutes');
const offerRoutes       = require('./routes/offerRoutes');
const trainingRoutes    = require('./routes/trainingRoutes');
const employeeRoutes    = require('./routes/employeeRoutes');
const salaryRoutes      = require('./routes/salaryRoutes');
const orgRoutes         = require('./routes/departmentRoutes');   // contracts + depts + designations
const complaintRoutes   = require('./routes/complaintRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');
const attendanceRoutes  = require('./routes/attendanceRoutes');

const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: '⚡ HR System API is running', db: process.env.DB_NAME })
);

// Routes
app.use('/api/auth',         authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/candidates',   candidateRoutes);
app.use('/api/interviews',   interviewRoutes);
app.use('/api/offers',       offerRoutes);
app.use('/api/training',     trainingRoutes);
app.use('/api/employees',    employeeRoutes);
app.use('/api/salary',       salaryRoutes);
app.use('/api/org',          orgRoutes);              // /api/org/contracts  /api/org/departments  /api/org/designations
app.use('/api/complaints',   complaintRoutes);
app.use('/api/dashboard',    dashboardRoutes);
app.use('/api/attendance',   attendanceRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: `Route ${req.url} not found` }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 HR API running → http://localhost:${PORT}`);
  console.log(`📋 Health        → http://localhost:${PORT}/api/health`);
  console.log(`💾 Database      → ${process.env.DB_NAME}\n`);
});
