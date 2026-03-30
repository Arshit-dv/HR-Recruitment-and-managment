import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getAllOffers, awardOffer, updateOfferStatus, getAllCandidates, generateOffer, updateOffer, deleteOffer, getAllSalary, getAllContracts } from '../services/api';
import toast from 'react-hot-toast';

const statusBadge = { Pending: 'badge-pending', Accepted: 'badge-success', Rejected: 'badge-danger', Expired: 'badge-neutral' };

const Offers = () => {
  const [offers, setOffers]       = useState([]);
  const [candidates, setCands]    = useState([]);
  const [salaries, setSalaries]   = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading]     = useState(true);
  
  const [awardModal, setAwardModal] = useState(null);
  const [awardCandID, setAwardCandID] = useState('');
  
  const [genModal, setGenModal] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [oForm, setOForm] = useState({ CandidateID: '', SalaryID: '', ContractID: '', OfferStatus: 'Pending' });

  const load = async () => {
    setLoading(true);
    const { data } = await getAllOffers(); setOffers(data.data); setLoading(false);
  };
  useEffect(() => {
    load();
    getAllCandidates().then((r) => setCands(r.data.data.filter((c) => c.InterviewStatus === 'Passed')));
    getAllSalary().then((r) => setSalaries(r.data.data));
    getAllContracts().then((r) => setContracts(r.data.data));
  }, []);

  const doAward = async (e) => {
    e.preventDefault();
    try {
      await awardOffer(awardModal.OfferID, { CandidateID: awardCandID });
      toast.success(`Offer awarded! ✅`);
      setAwardModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Award failed'); }
  };

  const doGenerate = async (e) => {
    e.preventDefault();
    try {
      await generateOffer(oForm);
      toast.success('Offer letter generated!');
      setGenModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const doUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateOffer(editModal.OfferID, oForm);
      toast.success('Offer updated!');
      setEditModal(null);
      load();
    } catch (err) { toast.error('Update failed'); }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Delete this offer and related award info?')) return;
    try {
      await deleteOffer(id);
      toast.success('Offer deleted');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1>📄 Offer Letters</h1>
            <p>Manage generated offers — award offers to candidates who accept</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setGenModal(true); setOForm({ CandidateID: '', SalaryID: '', ContractID: '', OfferStatus: 'Pending' }); }}>
            + Generate Offer
          </button>
        </div>

        <div className="card">
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : offers.length === 0 ? (
              <div className="empty-state"><div className="icon">📄</div><p>No offers yet. Interview a candidate first.</p></div>
            ) : (
              <table>
                <thead>
                  <tr><th>Offer ID</th><th>Candidate</th><th>Salary</th><th>Contract</th><th>Generated</th><th>Status</th><th>Awarded</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {offers.map((o) => (
                    <tr key={o.OfferID}>
                      <td><strong>#{o.OfferID}</strong></td>
                      <td>
                        <div style={{fontWeight: 600}}>{o.FirstName} {o.LastName}</div>
                        <div style={{fontSize: '0.7rem', color:'var(--text-muted)'}}>Cand #{o.CandidateID}</div>
                      </td>
                      <td>₹{Number(o.SalaryAmount).toLocaleString()}</td>
                      <td>#{o.ContractID}</td>
                      <td>{o.DateGenerated?.split('T')[0]}</td>
                      <td><span className={`badge ${statusBadge[o.OfferStatus]}`}>{o.OfferStatus}</span></td>
                      <td>{o.AwardedDate ? <span className="badge badge-success">🏆 {o.AwardedDate?.split('T')[0]}</span> : '—'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-outline" onClick={() => { setEditModal(o); setOForm({ CandidateID: o.CandidateID, SalaryID: o.SalaryID, ContractID: o.ContractID, OfferStatus: o.OfferStatus }); }}>✏️</button>
                          <button className="btn btn-sm btn-outline" onClick={() => doDelete(o.OfferID)} style={{color:'var(--danger)', borderColor:'rgba(255,100,100,0.1)'}}>🗑</button>
                          {o.OfferStatus === 'Pending' && (
                            <button className="btn btn-sm btn-success" onClick={() => { setAwardModal(o); setAwardCandID(String(o.CandidateID)); }}>
                              🏆 Award
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Generate / Edit Modal */}
        {(genModal || editModal) && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 440, maxWidth: '90vw' }}>
              <div className="card-title">{genModal ? '📄 Generate New Offer' : `✏️ Edit Offer #${editModal.OfferID}`}</div>
              <form onSubmit={genModal ? doGenerate : doUpdate}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Candidate *</label>
                    <select value={oForm.CandidateID} onChange={(e) => setOForm({ ...oForm, CandidateID: e.target.value })} required disabled={!!editModal}>
                      <option value="">— Select Candidate —</option>
                      {candidates.map((c) => <option key={c.CandidateID} value={c.CandidateID}>#{c.CandidateID} — {c.FirstName} {c.LastName} ({c.PreferredRole})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Salary Package *</label>
                    <select value={oForm.SalaryID} onChange={(e) => setOForm({ ...oForm, SalaryID: e.target.value })} required>
                      <option value="">— Select Salary —</option>
                      {salaries.map((s) => <option key={s.SalaryID} value={s.SalaryID}>₹{s.SalaryAmount.toLocaleString()} ({s.SalaryID})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contract Terms *</label>
                    <select value={oForm.ContractID} onChange={(e) => setOForm({ ...oForm, ContractID: e.target.value })} required>
                      <option value="">— Select Contract —</option>
                      {contracts.map((c) => <option key={c.ContractID} value={c.ContractID}>#{c.ContractID} ({c.NoticePeriod} day notice)</option>)}
                    </select>
                  </div>
                  {editModal && (
                    <div className="form-group form-full">
                      <label>Offer Status</label>
                      <select value={oForm.OfferStatus} onChange={(e) => setOForm({ ...oForm, OfferStatus: e.target.value })}>
                        <option>Pending</option><option>Accepted</option><option>Rejected</option><option>Expired</option>
                      </select>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">{genModal ? 'Generate' : 'Save'}</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setGenModal(false); setEditModal(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Award Modal */}
        {awardModal && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 440, maxWidth: '90vw' }}>
              <div className="card-title">🏆 Award Offer #{awardModal.OfferID}</div>
              <form onSubmit={doAward}>
                <div className="form-group">
                  <label>Confirmed Candidate ID *</label>
                  <input type="number" value={awardCandID} onChange={(e) => setAwardCandID(e.target.value)} required />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">Confirm Award</button>
                  <button type="button" className="btn btn-outline" onClick={() => setAwardModal(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Offers;

