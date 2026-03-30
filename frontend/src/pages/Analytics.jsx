import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';

const Analytics = () => {
  const [orgView, setOrgView] = useState([]);
  const [salaryStats, setSalaryStats] = useState(null);
  const [readyToHire, setReadyToHire] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orgRes, salaryRes, readyRes] = await Promise.all([
          axios.get('http://localhost:5000/api/analytics/org-view', { withCredentials: true }),
          axios.get('http://localhost:5000/api/analytics/salary-stats', { withCredentials: true }),
          axios.get('http://localhost:5000/api/analytics/ready-to-hire', { withCredentials: true })
        ]);

        if (orgRes.data.success) setOrgView(orgRes.data.data);
        if (salaryRes.data.success) setSalaryStats(salaryRes.data.data);
        if (readyRes.data.success) setReadyToHire(readyRes.data.data);
      } catch (err) {
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner-container"><div className="spinner" /></div>;

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="main-content analytics-page">
        <header className="page-header">
          <h1>📊 Advanced Data Analytics</h1>
          <p>Real-time insights generated via complex SQL processing</p>
        </header>

        <section className="analytics-section">
          <h2>1. 🔗 Join Query: Organizational View</h2>
          <p className="query-desc">Combines Employee, Designation, and Department tables via Foreign Key joins.</p>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Designation (Role)</th>
                  <th>Performance</th>
                  <th>Join Date</th>
                </tr>
              </thead>
              <tbody>
                {orgView.map(e => (
                  <tr key={e.EmployeeID}>
                    <td>#{e.EmployeeID}</td>
                    <td>{e.FirstName} {e.LastName}</td>
                    <td><span className="badge-outline">{e.DeptName}</span></td>
                    <td>{e.Role}</td>
                    <td><span className={`performance-label ${e.Performance?.toLowerCase()}`}>{e.Performance}</span></td>
                    <td>{new Date(e.JoinDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="analytics-grid">
          <section className="analytics-section aggregation-card">
            <h2>2. 📈 Aggregation: Salary Stats</h2>
            <p className="query-desc">Uses SUM(), AVG(), MIN(), and MAX() on the Salary table.</p>
            {salaryStats && (
              <div className="stats-list">
                <div className="stat-item">
                  <span className="label">Total Expenditure</span>
                  <span className="value">₹{Number(salaryStats.TotalExpenditure).toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Average Salary</span>
                  <span className="value">₹{Math.round(salaryStats.AverageSalary).toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Max Salary</span>
                  <span className="value">₹{Number(salaryStats.MaxSalary).toLocaleString()}</span>
                </div>
                <div className="stat-item">
                  <span className="label">Total Payments</span>
                  <span className="value-small">{salaryStats.TotalPayments}</span>
                </div>
              </div>
            )}
          </section>

          <section className="analytics-section filtering-card">
            <h2>3. 🔍 Filtering: Ready to Hire</h2>
            <p className="query-desc">Filters candidates who PASSED interviews but haven't accepted an offer yet.</p>
            <div className="ready-list">
              {readyToHire.length === 0 ? (
                <p>No candidates currently in this stage.</p>
              ) : (
                readyToHire.map(c => (
                  <div key={c.CandidateID} className="ready-item">
                    <div className="info">
                      <strong>{c.FirstName} {c.LastName}</strong>
                      <span>{c.PreferredRole}</span>
                    </div>
                    <div className="status">
                      <span className="badge pass">{c.InterviewResult || 'Passed'}</span>
                      <span className={`badge ${c.OfferStatus?.toLowerCase() || 'pending'}`}>
                        Offer: {c.OfferStatus || 'Not Sent'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
