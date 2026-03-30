import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getAllCandidates, scheduleInterview, getAllEmployees, createCandidate, updateCandidate, deleteCandidate } from '../services/api';
import toast from 'react-hot-toast';

const potBadge = { High: 'badge-success', Medium: 'badge-info', Low: 'badge-warning' };

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modal, setModal]           = useState(null); // schedule
  const [editModal, setEditModal]     = useState(null);
  const [filter, setFilter]           = useState('');
  const [minExp, setMinExp]           = useState('');

  const [search, setSearch]             = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const [iForm, setIForm] = useState({ InterviewDate: '', Time: '', Venue: '', InterviewerEmployeeIDs: [] });
  const [cForm, setCForm] = useState({ ExpectedSalary: '', Potential: 'Medium', PreferredRole: '', Qualification: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await getAllCandidates({ filter, minExp });
    setCandidates(data.data);
    setLoading(false);
  };
  useEffect(() => {
    load();
    getAllEmployees().then((r) => setEmployees(r.data.data));
  }, [filter, minExp]);

  const doSchedule = async (e) => {
    e.preventDefault();
    try {
      const { data } = await scheduleInterview({ CandidateID: modal.CandidateID, ...iForm });
      toast.success(`Interview #${data.InterviewID} scheduled! 🗓️`);
      setModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };


  const doUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateCandidate(editModal.CandidateID, cForm);
      toast.success('Candidate updated!');
      setEditModal(null);
      load();
    } catch (err) { toast.error('Update failed'); }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Delete this candidate and related data?')) return;
    try {
      await deleteCandidate(id);
      toast.success('Candidate deleted');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  const toggleInterviewer = (empId) => {
    const ids = iForm.InterviewerEmployeeIDs;
    setIForm({ ...iForm, InterviewerEmployeeIDs: ids.includes(empId) ? ids.filter((x) => x !== empId) : [...ids, empId] });
  };

  const filteredCandidates = candidates.filter(c => 
    (c.ScreeningStatus === 'Passed') && (
        c.CandidateID.toString().includes(search) || 
        (c.PreferredRole && c.PreferredRole.toLowerCase().includes(search.toLowerCase())) ||
        (c.Qualification && c.Qualification.toLowerCase().includes(search.toLowerCase()))
    )
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>👥 Candidates</h1>
            <p>Qualified talent ready for interviews and evaluation</p>
          </div>
        </div>

        <div className="filter-card">
          <div className="search-box-premium">
            <input 
              type="text" 
              placeholder="Search by name, role or qualification..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <span className="filter-label">Status:</span>
            <select className="filter-input" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All Candidates</option>
              <option value="passed_no_offer">Interview Passed (No Offer)</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Min Experience:</span>
            <input 
                type="number" 
                placeholder="Yrs" 
                value={minExp} 
                onChange={(e) => setMinExp(e.target.value)} 
                className="filter-input"
                style={{ width: 80 }}
            />
          </div>
        </div>

        <div className="card">
          <div className="table-header" style={{ padding: '0 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>{filteredCandidates.length} records found</p>
            <div className="pagination-controls" style={{ display: 'flex', gap: 5 }}>
                <button className="btn btn-sm btn-outline" onClick={() => setCurrentIndex(0)}>First</button>
                <button className="btn btn-sm btn-outline" onClick={() => setCurrentIndex(Math.max(0, filteredCandidates.length - 1))}>Last</button>
            </div>
          </div>
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : filteredCandidates.length === 0 ? (
              <div className="empty-state"><div className="icon">👤</div><p>No candidates found matching your criteria</p></div>
            ) : (
              <table>
                <thead><tr><th>ID</th><th>Candidate Name</th><th>Role</th><th>Qualification</th><th>Exp. Salary</th><th>Potential</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredCandidates.map((c, index) => (
                    <tr key={c.CandidateID} style={index === currentIndex ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}>
                      <td><strong>#{c.CandidateID}</strong></td>
                      <td>
                        <div style={{fontWeight: 600}}>{c.FirstName} {c.LastName}</div>
                      </td>
                      <td>{c.PreferredRole}</td>
                      <td>{c.Qualification}</td>
                      <td>₹{c.ExpectedSalary?.toLocaleString() || '—'}</td>
                      <td><span className={`badge ${potBadge[c.Potential] || 'badge-neutral'}`}>{c.Potential}</span></td>
                      <td>{c.InterviewStatus ? <span className="badge badge-info">{c.InterviewStatus}</span> : <span className="badge badge-pending">Screened</span>}</td>
                      <td>
                        <div style={{ display:'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => { setEditModal(c); setCForm({ ExpectedSalary: c.ExpectedSalary, Potential: c.Potential }); }}>✏️</button>
                          <button className="btn btn-sm btn-outline" onClick={() => doDelete(c.CandidateID)} style={{color:'var(--danger)', borderColor:'rgba(255,100,100,0.1)'}}>🗑</button>
                          {!c.InterviewStatus && (
                            <button className="btn btn-sm btn-primary" title="Schedule Interview" onClick={() => { setModal(c); setIForm({ InterviewDate: '', Time: '', Venue: '', InterviewerEmployeeIDs: [] }); }}>
                              📅
                            </button>
                          )}
                          {c.ConvertedEmployeeID && <span className="badge badge-success">Emp #{c.ConvertedEmployeeID}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editModal && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 440 }}>
              <div className="card-title">✏️ Edit Candidate #{editModal.CandidateID}</div>
              <form onSubmit={doUpdate}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Expected Salary</label>
                    <input type="number" value={cForm.ExpectedSalary} onChange={(e) => setCForm({ ...cForm, ExpectedSalary: e.target.value })} placeholder="80000" />
                  </div>
                  <div className="form-group">
                    <label>Potential</label>
                    <select value={cForm.Potential} onChange={(e) => setCForm({ ...cForm, Potential: e.target.value })}>
                      <option>High</option><option>Medium</option><option>Low</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditModal(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Schedule Interview Modal */}
        {modal && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 520 }}>
              <div className="card-title">📅 Schedule Interview — Candidate #{modal.CandidateID}</div>
              <form onSubmit={doSchedule}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Interview Date *</label>
                    <input type="date" value={iForm.InterviewDate} onChange={(e) => setIForm({ ...iForm, InterviewDate: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Time *</label>
                    <input type="time" value={iForm.Time} onChange={(e) => setIForm({ ...iForm, Time: e.target.value })} required />
                  </div>
                  <div className="form-group form-full">
                    <label>Venue</label>
                    <input value={iForm.Venue} onChange={(e) => setIForm({ ...iForm, Venue: e.target.value })} placeholder="Room 3 / Zoom / Online" />
                  </div>
                </div>

                {employees.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Assign Interviewers (Employees)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {employees.map((e) => (
                        <button key={e.EmployeeID} type="button"
                          className={`btn btn-sm ${iForm.InterviewerEmployeeIDs.includes(e.EmployeeID) ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => toggleInterviewer(e.EmployeeID)}>
                          Emp #{e.EmployeeID} ({e.Role})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">Schedule Interview</button>
                  <button type="button" className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Candidates;
