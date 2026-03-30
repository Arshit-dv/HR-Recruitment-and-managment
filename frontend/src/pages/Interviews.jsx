import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getAllInterviews, updateInterviewStatus, getAllSalary, getAllContracts, generateOffer, deleteInterview } from '../services/api';
import toast from 'react-hot-toast';

const statusBadge = { Scheduled: 'badge-info', Passed: 'badge-success', Failed: 'badge-danger', Cancelled: 'badge-neutral' };

const Interviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [salaries, setSalaries]     = useState([]);
  const [contracts, setContracts]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [offerModal, setOfferModal] = useState(null);
  const [oForm, setOForm] = useState({ SalaryID: '', ContractID: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await getAllInterviews();
    setInterviews(data.data);
    setLoading(false);
  };
  useEffect(() => {
    load();
    getAllSalary().then((r) => setSalaries(r.data.data));
    getAllContracts().then((r) => setContracts(r.data.data));
  }, []);

  const markStatus = async (id, status, interview) => {
    try {
      await updateInterviewStatus(id, { InterviewStatus: status });
      toast.success(`Interview ${status}`);
      if (status === 'Passed') {
        setOfferModal(interview);
        setOForm({ SalaryID: '', ContractID: '' });
      }
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const doGenerateOffer = async (e) => {
    e.preventDefault();
    try {
      const { data } = await generateOffer({ CandidateID: offerModal.CandidateID, ...oForm });
      toast.success(`Offer #${data.OfferID} generated! 📄`);
      setOfferModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to generate offer'); }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this interview record?')) return;
    try {
      await deleteInterview(id);
      toast.success('Interview deleted');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1>🗓️ Interviews</h1>
          <p>Manage scheduled interviews — mark Pass/Fail and generate offer letters</p>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : interviews.length === 0 ? (
              <div className="empty-state"><div className="icon">📅</div><p>No interviews scheduled</p></div>
            ) : (
              <table>
                <thead><tr><th>Int. ID</th><th>Candidate</th><th>Role</th><th>Qualification</th><th>Date</th><th>Time</th><th>Venue</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                <tbody>
                  {interviews.map((i) => (
                    <tr key={i.InterviewID}>
                      <td><strong>#{i.InterviewID}</strong></td>
                      <td>
                        <div style={{fontWeight: 600}}>{i.FirstName} {i.LastName}</div>
                        <div style={{fontSize: '0.7rem', color:'var(--text-muted)'}}>Cand #{i.CandidateID}</div>
                      </td>
                      <td>{i.PreferredRole}</td>
                      <td>{i.Qualification}</td>
                      <td>{i.InterviewDate?.split('T')[0]}</td>
                      <td>{i.Time}</td>
                      <td>{i.Venue || '—'}</td>
                      <td><span className={`badge ${statusBadge[i.InterviewStatus]}`}>{i.InterviewStatus}</span></td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', alignItems: 'center' }}>
                          {i.InterviewStatus === 'Scheduled' && (
                            <>
                              <button className="btn btn-sm btn-success" onClick={() => markStatus(i.InterviewID, 'Passed', i)}>Pass</button>
                              <button className="btn btn-sm btn-outline" style={{ color: 'var(--danger)' }} onClick={() => markStatus(i.InterviewID, 'Failed', i)}>Fail</button>
                            </>
                          )}
                          {i.InterviewStatus === 'Passed' && <span className="badge badge-success">Promoted</span>}
                          {i.InterviewStatus === 'Failed' && <span className="badge badge-danger">Rejected</span>}
                          
                          <button className="btn btn-sm btn-outline-danger" onClick={() => doDelete(i.InterviewID)} style={{ marginLeft: 6 }} title="Delete Schedule">
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

        {/* Generate Offer Modal */}
        {offerModal && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 480, maxWidth: '90vw' }}>
              <div className="card-title">📄 Generate Offer — Candidate #{offerModal.CandidateID}</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
                Select from pre-defined salary and contract structures.
              </p>
              <form onSubmit={doGenerateOffer}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Salary Package *</label>
                    <select value={oForm.SalaryID} onChange={(e) => setOForm({ ...oForm, SalaryID: e.target.value })} required>
                      <option value="">— Select Salary —</option>
                      {salaries.map((s) => (
                        <option key={s.SalaryID} value={s.SalaryID}>
                          #{s.SalaryID} — ₹{Number(s.SalaryAmount).toLocaleString()} ({s.SalaryDate?.split('T')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group form-full">
                    <label>Contract Type *</label>
                    <select value={oForm.ContractID} onChange={(e) => setOForm({ ...oForm, ContractID: e.target.value })} required>
                      <option value="">— Select Contract —</option>
                      {contracts.map((c) => (
                        <option key={c.ContractID} value={c.ContractID}>
                          #{c.ContractID} — {c.NoticePeriod} days notice ({c.ContractDate?.split('T')[0]})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">Generate Offer Letter</button>
                  <button type="button" className="btn btn-outline" onClick={() => setOfferModal(null)}>Skip</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Interviews;
