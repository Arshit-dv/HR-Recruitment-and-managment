import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getHRDashboard } from '../services/api';

const HRDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getHRDashboard().then((r) => setData(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>📊 HR Dashboard</h1>
          <p>Recruitment pipeline overview — Database: <code style={{ color: 'var(--accent)' }}>vit</code></p>
        </div>

        {loading ? <div className="spinner" /> : data && (
          <>
            {/* Pipeline */}
            <div className="pipeline" style={{ marginBottom: 24 }}>
              {['Application', 'Screening → Candidate', 'Interview', 'Offer → Awarded', 'Training', 'Employee'].map((step, i) => (
                <div key={step} className="pipeline-step" style={{ fontSize: '0.7rem' }}>{step}</div>
              ))}
            </div>

            {/* Stats */}
            <div className="stats-grid">
              <div className="stat-card">
                <h3>Applications</h3>
                <div className="value">{data.stats.total_applications}</div>
                <div className="icon-big">📝</div>
              </div>
              <div className="stat-card info">
                <h3>Candidates</h3>
                <div className="value">{data.stats.total_candidates}</div>
                <div className="icon-big">👥</div>
              </div>
              <div className="stat-card warning">
                <h3>Scheduled Interviews</h3>
                <div className="value">{data.stats.scheduled_interviews}</div>
                <div className="icon-big">🗓️</div>
              </div>
              <div className="stat-card">
                <h3>Passed Interviews</h3>
                <div className="value">{data.stats.passed_interviews}</div>
                <div className="icon-big">✅</div>
              </div>
              <div className="stat-card warning">
                <h3>Pending Offers</h3>
                <div className="value">{data.stats.pending_offers}</div>
                <div className="icon-big">📄</div>
              </div>
              <div className="stat-card info">
                <h3>Ongoing Training</h3>
                <div className="value">{data.stats.ongoing_training}</div>
                <div className="icon-big">🎓</div>
              </div>
              <div className="stat-card success">
                <h3>Total Employees</h3>
                <div className="value">{data.stats.total_employees}</div>
                <div className="icon-big">🏢</div>
              </div>
              <div className="stat-card danger">
                <h3>Open Complaints</h3>
                <div className="value">{data.stats.open_complaints}</div>
                <div className="icon-big">📢</div>
              </div>
            </div>

            {/* Row for Grid-style Analytics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {/* Recent Applications */}
              <div className="card">
                <div className="card-title">📋 Recent Applications</div>
                {!data.recent_applications || data.recent_applications.length === 0 ? (
                  <div className="empty-state" style={{ padding: 20 }}><p>No applications yet</p></div>
                ) : (
                  <table>
                    <thead><tr><th>App ID</th><th>Role</th><th>Qualification</th><th>Candidate?</th></tr></thead>
                    <tbody>
                      {data.recent_applications.map((a) => (
                        <tr key={a.ApplicationID}>
                          <td>#{a.ApplicationID}</td>
                          <td>{a.PreferredRole}</td>
                          <td>{a.Qualification}</td>
                          <td>{a.CandidateID ? <span className="badge badge-success">#{a.CandidateID}</span> : <span className="badge badge-pending">Pending</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Organizational Structure */}
              <div className="card">
                <div className="card-title">🏢 Organizational Structure</div>
                {!data.department_distribution || data.department_distribution.length === 0 ? (
                  <div className="empty-state" style={{ padding: 20 }}><p>No data</p></div>
                ) : (
                  <table>
                    <thead><tr><th>Department</th><th>Personnel</th><th>Avg Salary</th></tr></thead>
                    <tbody>
                      {data.department_distribution.map((d) => (
                        <tr key={d.DeptName}>
                          <td><strong>{d.DeptName}</strong></td>
                          <td><span className="badge badge-neutral">{d.emp_count} active</span></td>
                          <td>₹{Math.round(d.avg_salary || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="card" style={{ marginTop: 20 }}>
              <div className="card-title">👥 Recently Hired Employees</div>
              {data.recent_employees.length === 0 ? (
                <div className="empty-state" style={{ padding: 20 }}><p>No employees yet</p></div>
              ) : (
                <table>
                  <thead><tr><th>Emp ID</th><th>Role</th><th>Department</th><th>Join Date</th></tr></thead>
                  <tbody>
                    {data.recent_employees.map((e) => (
                      <tr key={e.EmployeeID}>
                        <td><strong>#{e.EmployeeID}</strong></td>
                        <td>{e.Role}</td>
                        <td><span className="badge badge-info" style={{ background: 'rgba(56, 189, 248, 0.1)', color: 'var(--info)' }}>{e.DeptName || '—'}</span></td>
                        <td>{e.JoinDate?.split('T')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default HRDashboard;
