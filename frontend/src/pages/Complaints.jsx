import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getAllComplaints, submitComplaint, updateComplaintStatus, deleteComplaint, getAllEmployees } from '../services/api';
import toast from 'react-hot-toast';

const priorityBadge = { High: 'badge-danger', Medium: 'badge-warning', Low: 'badge-info' };
const statusBadge   = { Open: 'badge-danger', 'Under Review': 'badge-pending', Resolved: 'badge-success', Closed: 'badge-neutral' };

const Complaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [addModal, setAddModal]     = useState(false);
  const [employees, setEmployees]   = useState([]);
  const [cForm, setCForm] = useState({ EmployeeID: '', ComplaintStatus: 'Open', Priority: 'Medium' });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getAllComplaints(); setComplaints(data.data);
      const { data: eData } = await getAllEmployees(); setEmployees(eData.data || []);
    } catch (e) { toast.error('Load failed'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const doSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitComplaint(cForm);
      toast.success('Complaint filed');
      setAddModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const updateStatus = async (id, ComplaintStatus) => {
    try {
      await updateComplaintStatus(id, { ComplaintStatus });
      toast.success('Status updated');
      load();
    } catch (err) { toast.error('Failed'); }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Delete this complaint record?')) return;
    try {
      await deleteComplaint(id);
      toast.success('Complaint deleted');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>📢 Complaints</h1>
            <p>Employee grievances and issue tracking</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setAddModal(true); setCForm({ EmployeeID: '', ComplaintStatus: 'Open', Priority: 'Medium' }); }}>
            + Log Complaint
          </button>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : complaints.length === 0 ? (
              <div className="empty-state"><div className="icon">😊</div><p>No complaints. All is well!</p></div>
            ) : (
              <table>
                <thead><tr><th>ID</th><th>Emp</th><th>Description</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {complaints.map((c) => (
                    <tr key={c.ComplaintID}>
                      <td><strong>#{c.ComplaintID}</strong></td>
                      <td>Emp #{c.EmployeeID}</td>
                      <td style={{ maxWidth: 280, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{c.Description || '—'}</td>
                      <td><span className={`badge ${priorityBadge[c.Priority]}`}>{c.Priority}</span></td>
                      <td>
                        <select value={c.ComplaintStatus}
                          onChange={(e) => updateStatus(c.ComplaintID, e.target.value)}
                          className="status-pill"
                          style={{
                            background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                            borderRadius: 6, padding: '2px 6px', fontSize: '0.75rem', cursor: 'pointer'
                          }}>
                          <option>Open</option>
                          <option>Under Review</option>
                          <option>Resolved</option>
                          <option>Closed</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-outline" onClick={() => doDelete(c.ComplaintID)} style={{ color: 'var(--danger)', padding: '4px 8px' }}>🗑</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Log Complaint Modal */}
        {addModal && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 420 }}>
              <div className="card-title">📢 Log New Complaint</div>
              <form onSubmit={doSubmit}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Affected Employee *</label>
                    <select value={cForm.EmployeeID} onChange={(e) => setCForm({ ...cForm, EmployeeID: e.target.value })} required>
                        <option value="">— Select Employee —</option>
                        {employees.map(e => <option key={e.EmployeeID} value={e.EmployeeID}>#{e.EmployeeID} - {e.FirstName} {e.LastName} ({e.Role})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={cForm.Priority} onChange={(e) => setCForm({ ...cForm, Priority: e.target.value })}>
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                  <div className="form-group form-full">
                    <label>Description *</label>
                    <textarea value={cForm.Description} onChange={(e) => setCForm({ ...cForm, Description: e.target.value })} 
                      placeholder="Describe the complaint..." required 
                      style={{ width:'100%', height: 80, padding: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 6, resize: 'none' }}
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">Submit</button>
                  <button type="button" className="btn btn-outline" onClick={() => setAddModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Complaints;

