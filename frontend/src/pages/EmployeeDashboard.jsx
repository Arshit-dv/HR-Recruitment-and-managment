import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getEmployeeDashboard, getComplaintsByEmp } from '../services/api';
import toast from 'react-hot-toast';

const EmployeeDashboard = () => {
  const [empId, setEmpId] = useState('');
  const [searched, setSearched] = useState(false);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async (id) => {
    setLoading(true);
    try {
      const { data: res } = await getEmployeeDashboard(id);
      setData(res.data);
    } catch (err) {
      toast.error('Employee not found');
      setData(null);
    } finally { setLoading(false); }
  };

  if (!searched) {
    return (
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="page-header"><h1>🏠 Employee View</h1><p>Enter your Employee ID to view your profile, salary, and contract</p></div>
          <div className="card" style={{ maxWidth: 380 }}>
            <div className="form-group"><label>Employee ID</label>
              <input type="number" placeholder="e.g. 1" value={empId} onChange={(e) => setEmpId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && empId && (setSearched(true), load(empId))} />
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }}
              onClick={() => { setSearched(true); load(empId); }} disabled={!empId}>
              🔍 View Profile
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {loading ? <div className="spinner" /> : !data ? (
          <div className="empty-state">
            <div className="icon">❌</div>
            <p>Employee #{empId} not found</p>
            <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => { setSearched(false); setEmpId(''); }}>Try Again</button>
          </div>
        ) : (
          <>
            <div className="page-header">
              <h1>👤 Employee #{data.profile.EmployeeID}</h1>
              <p>{data.profile.Role} — Department #{data.profile.DeptID}</p>
            </div>

            {/* Profile cards */}
            <div className="stats-grid">
              <div className="stat-card info">
                <h3>Salary Amount</h3>
                <div className="value" style={{ fontSize: '1.1rem' }}>₹{Number(data.profile.SalaryAmount || 0).toLocaleString()}</div>
              </div>
              <div className="stat-card">
                <h3>Notice Period</h3>
                <div className="value" style={{ fontSize: '1.1rem' }}>{data.profile.NoticePeriod || '—'} days</div>
              </div>
              <div className="stat-card success">
                <h3>Join Date</h3>
                <div className="value" style={{ fontSize: '0.9rem' }}>{data.profile.JoinDate?.split('T')[0]}</div>
              </div>
              <div className="stat-card warning">
                <h3>Performance</h3>
                <div className="value" style={{ fontSize: '1rem' }}>{data.profile.Performance}</div>
              </div>
            </div>

            {/* Extended info */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="card">
                <div className="card-title">📋 Contract Details</div>
                <table>
                  <tbody>
                    <tr><td style={{ color: 'var(--text-muted)' }}>Contract ID</td><td>#{data.profile.ContractID}</td></tr>
                    <tr><td style={{ color: 'var(--text-muted)' }}>Contract Date</td><td>{data.profile.ContractDate?.split('T')[0]}</td></tr>
                    <tr><td style={{ color: 'var(--text-muted)' }}>Notice Period</td><td>{data.profile.NoticePeriod} days</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="card">
                <div className="card-title">🏢 Designation &amp; Dept</div>
                <table>
                  <tbody>
                    <tr><td style={{ color: 'var(--text-muted)' }}>Designation ID</td><td>#{data.profile.DesignationID}</td></tr>
                    <tr><td style={{ color: 'var(--text-muted)' }}>Role</td><td>{data.profile.Role}</td></tr>
                    <tr><td style={{ color: 'var(--text-muted)' }}>Dept Performance</td><td>{data.profile.DeptPerformance}</td></tr>
                    <tr><td style={{ color: 'var(--text-muted)' }}>No. of Employees</td><td>{data.profile.DeptNoOfEmployees}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Complaints */}
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-title">📢 My Complaints ({data.complaints.length})</div>
              {data.complaints.length === 0
                ? <p style={{ color: 'var(--text-muted)' }}>No complaints filed</p>
                : (
                  <table>
                    <thead><tr><th>ID</th><th>Priority</th><th>Status</th><th>Date</th></tr></thead>
                    <tbody>
                      {data.complaints.map((c) => (
                        <tr key={c.ComplaintID}>
                          <td>#{c.ComplaintID}</td>
                          <td>{c.Priority}</td>
                          <td><span className={`badge ${c.ComplaintStatus === 'Resolved' ? 'badge-success' : c.ComplaintStatus === 'Open' ? 'badge-danger' : 'badge-pending'}`}>{c.ComplaintStatus}</span></td>
                          <td>{c.ComplaintDateTime ? new Date(c.ComplaintDateTime).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
            </div>

            {/* Training supervised */}
            {data.trainingSupervised.length > 0 && (
              <div className="card">
                <div className="card-title">🎓 Training Supervised</div>
                <table>
                  <thead><tr><th>Candidate</th><th>Training Status</th><th>Start Date</th><th>Feedback</th></tr></thead>
                  <tbody>
                    {data.trainingSupervised.map((t) => (
                      <tr key={t.CandidateID}>
                        <td>#{t.CandidateID}</td>
                        <td><span className="badge badge-info">{t.TrainingStatus}</span></td>
                        <td>{t.TrainingStartDate?.split('T')[0]}</td>
                        <td>{t.Feedback || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button className="btn btn-outline" style={{ marginTop: 20 }}
              onClick={() => { setSearched(false); setEmpId(''); setData(null); }}>
              ← Search Another Employee
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
