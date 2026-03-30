import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getAllTraining, startTraining, completeTraining, getAllEmployees, getAllCandidates, deleteTraining } from '../services/api';
import toast from 'react-hot-toast';

const statusBadge = { Ongoing: 'badge-info', Completed: 'badge-success', Cancelled: 'badge-danger' };

const Training = () => {
  const [training, setTraining]     = useState([]);
  const [employees, setEmployees]   = useState([]);
  const [awardedCands, setAwardedCands] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [startModal, setStartModal] = useState(false);
  const [sForm, setSForm] = useState({ CandidateID: '', TrainingStartDate: '', Insights: '', TrainerEmployeeIDs: [] });

  const load = async () => {
    setLoading(true);
    const { data } = await getAllTraining(); setTraining(data.data); setLoading(false);
  };
  useEffect(() => {
    load();
    getAllEmployees().then((r) => setEmployees(r.data.data));
    // Get candidates who have been awarded an offer but not yet in training
    getAllCandidates().then((r) => setAwardedCands(r.data.data));
  }, []);

  const doStart = async (e) => {
    e.preventDefault();
    try {
      await startTraining(sForm);
      toast.success(`Training started for Candidate #${sForm.CandidateID}! 🎓`);
      setStartModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to start training'); }
  };

  const doComplete = async (candidateId) => {
    try {
      await completeTraining(candidateId);
      toast.success('Training completed! Ready to convert to employee.');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const doDelete = async (candidateId) => {
    if (!window.confirm('Are you sure you want to delete this training record? This will unassign trainers and remove progress.')) return;
    try {
      await deleteTraining(candidateId);
      toast.success('Training record deleted');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  const toggleTrainer = (empId) => {
    const ids = sForm.TrainerEmployeeIDs;
    setSForm({ ...sForm, TrainerEmployeeIDs: ids.includes(empId) ? ids.filter((x) => x !== empId) : [...ids, empId] });
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>🎓 Training</h1>
            <p>Manage training for offer-awarded candidates before employee conversion</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setStartModal(true); setSForm({ CandidateID: '', TrainingStartDate: '', Insights: '', TrainerEmployeeIDs: [] }); }}>
            + Start Training
          </button>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : training.length === 0 ? (
              <div className="empty-state"><div className="icon">🎓</div><p>No training records. Award an offer first.</p></div>
            ) : (
              <table>
                <thead><tr><th>Cand. ID</th><th>Candidate Name</th><th>Role</th><th>Qualification</th><th>Start</th><th>End</th><th>Status</th><th>Insights</th><th>Employee Trainers</th><th>Actions</th></tr></thead>
                <tbody>
                  {training.map((t) => (
                    <tr key={t.CandidateID}>
                      <td><strong>#{t.CandidateID}</strong></td>
                      <td>
                        <div style={{fontWeight: 600}}>{t.FirstName} {t.LastName}</div>
                      </td>
                      <td>{t.PreferredRole}</td>
                      <td>{t.Qualification}</td>
                      <td>{t.TrainingStartDate?.split('T')[0]}</td>
                      <td>{t.TrainingEndDate?.split('T')[0] || '—'}</td>
                      <td><span className={`badge ${statusBadge[t.TrainingStatus]}`}>{t.TrainingStatus}</span></td>
                      <td style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.Insights || '—'}</td>
                      <td>{t.TrainerEmployees ? <span className="badge badge-neutral">Emp {t.TrainerEmployees}</span> : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {t.TrainingStatus === 'Ongoing' && (
                            <button className="btn btn-sm btn-success" onClick={() => doComplete(t.CandidateID)}>
                              ✅ Complete
                            </button>
                          )}
                          {t.TrainingStatus === 'Completed' && !t.ConvertedEmployeeID && (
                            <span className="badge badge-warning">→ Create Employee</span>
                          )}
                          <button className="btn btn-sm btn-outline-danger" onClick={() => doDelete(t.CandidateID)} title="Delete Record">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Start Training Modal */}
        {startModal && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 520 }}>
              <div className="card-title">🎓 Start Training</div>
              <form onSubmit={doStart}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Awarded Candidate *</label>
                    <select value={sForm.CandidateID} onChange={(e) => setSForm({ ...sForm, CandidateID: e.target.value })} required>
                        <option value="">— Select Candidate —</option>
                        {awardedCands.filter(c => c.AwardedOfferID && !c.TrainingStatus).map(c => (
                            <option key={c.CandidateID} value={c.CandidateID}>#{c.CandidateID} - {c.PreferredRole} ({c.FirstName} {c.LastName})</option>
                        ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input type="date" value={sForm.TrainingStartDate} onChange={(e) => setSForm({ ...sForm, TrainingStartDate: e.target.value })} required />
                  </div>
                  <div className="form-group form-full">
                    <label>Insights / Notes</label>
                    <textarea value={sForm.Insights} onChange={(e) => setSForm({ ...sForm, Insights: e.target.value })} rows={2} placeholder="Training goals, notes..." />
                  </div>
                </div>
                {employees.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Assign Trainer Employees
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                      {employees.map((e) => (
                        <button key={e.EmployeeID} type="button"
                          className={`btn btn-sm ${sForm.TrainerEmployeeIDs.includes(e.EmployeeID) ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => toggleTrainer(e.EmployeeID)}>
                          Emp #{e.EmployeeID} ({e.Role})
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">Start Training</button>
                  <button type="button" className="btn btn-outline" onClick={() => setStartModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Training;
