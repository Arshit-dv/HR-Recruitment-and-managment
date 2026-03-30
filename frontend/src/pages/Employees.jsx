import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  getAllEmployees, createEmployee, updateEmployee, deleteEmployee, 
  getAllSalary, getAllDesignations, getAllContracts, getAllTraining,
  getPayscales, getSalaryBill 
} from '../services/api';
import toast from 'react-hot-toast';

const Employees = () => {
  const [employees, setEmployees]       = useState([]);
  const [salaries, setSalaries]         = useState([]);
  const [designations, setDesignations] = useState([]);
  const [contracts, setContracts]       = useState([]);
  const [completedTraining, setCompleted] = useState([]);
  const [payscales, setPayscales]       = useState([]);
  const [loading, setLoading]           = useState(true);
  
  const [search, setSearch]             = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const [modal, setModal]               = useState(false);
  const [editModal, setEditModal]       = useState(null);
  const [billModal, setBillModal]       = useState(null);
  const [performance, setPerformance]   = useState('');
  const [minSalary, setMinSalary]       = useState('');

  const [eForm, setEForm] = useState({ CandidateID: '', SalaryID: '', DesignationID: '', ContractID: '', JoinDate: '', Performance: 'Good', PayscaleID: '' });

  const load = async () => {
    setLoading(true);
    try {
        const { data } = await getAllEmployees({ performance, minSalary }); 
        setEmployees(data?.data || []); 
    } catch(e) { toast.error('Error loading employees'); }
    setLoading(false);
  };

  useEffect(() => { load(); }, [performance, minSalary]);

  useEffect(() => {
    getAllSalary().then((r) => setSalaries(r.data?.data || []));
    getAllDesignations().then((r) => setDesignations(r.data?.data || []));
    getAllContracts().then((r) => setContracts(r.data?.data || []));
    getPayscales().then((r) => setPayscales(r.data?.data || []));
    getAllTraining().then((r) => setCompleted((r.data?.data || []).filter((t) => t.TrainingStatus === 'Completed')));
  }, []);

  const doCreate = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(eForm);
      toast.success('Employee created! 🏢');
      setModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const doUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateEmployee(editModal.EmployeeID, eForm);
      toast.success('Employee updated! ✅');
      setEditModal(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
  };

  const doDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await deleteEmployee(id);
      toast.success('Employee deleted');
      load();
    } catch (err) { toast.error('Delete failed'); }
  };

  const showBill = async (id) => {
    try {
      const { data } = await getSalaryBill(id, 'March', '2024');
      setBillModal(data?.data);
    } catch (err) { toast.error('Failed to generate bill'); }
  };

  const filteredEmployees = employees.filter(e => 
    e.EmployeeID?.toString().includes(search) || 
    (e.Role && e.Role.toLowerCase().includes(search.toLowerCase())) ||
    (e.Performance && e.Performance.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🏢 Employees</h1>
            <p>Active organization personnel and their management records</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setModal(true); setEForm({ CandidateID: '', SalaryID: '', DesignationID: '', ContractID: '', JoinDate: '', Performance: 'Good', PayscaleID: '' }); }}>
            + Create New Employee
          </button>
        </div>

        <div className="filter-card">
          <div className="search-box-premium">
            <input 
              type="text" 
              placeholder="Search by ID, name or role..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="filter-input"
            />
          </div>
          
          <div className="filter-group">
            <span className="filter-label">Performance:</span>
            <select className="filter-input" value={performance} onChange={(e) => setPerformance(e.target.value)}>
                <option value="">All Ratings</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Average">Average</option>
                <option value="Poor">Poor</option>
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">Min Salary:</span>
            <input 
                type="number" 
                placeholder="₹ Amount" 
                value={minSalary} 
                onChange={(e) => setMinSalary(e.target.value)} 
                className="filter-input"
                style={{ width: 120 }}
            />
          </div>
        </div>

        <div className="card">
          <div className="table-header" style={{ padding: '0 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p>{filteredEmployees.length} records found</p>
            <div className="pagination-controls" style={{ display: 'flex', gap: 5 }}>
                <button className="btn btn-sm btn-outline" onClick={() => setCurrentIndex(0)}>First</button>
                <button className="btn btn-sm btn-outline" onClick={() => setCurrentIndex(Math.max(0, filteredEmployees.length - 1))}>Last</button>
            </div>
          </div>
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : filteredEmployees.length === 0 ? (
              <div className="empty-state"><div className="icon">🏢</div><p>No employees found.</p></div>
            ) : (
              <table>
                <thead><tr><th>ID</th><th>Candidate</th><th>Role</th><th>Salary</th><th>Payscale/Grade</th><th>Join Date</th><th>Performance</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredEmployees.map((e, index) => (
                    <tr key={e.EmployeeID} style={index === currentIndex ? { backgroundColor: 'rgba(59, 130, 246, 0.1)' } : {}}>
                      <td><strong>#{e.EmployeeID}</strong></td>
                      <td>
                        <div style={{fontWeight: 600}}>{e.FirstName} {e.LastName}</div>
                        <div style={{fontSize: '0.7rem', color:'var(--text-muted)'}}>Cand #{e.CandidateID}</div>
                      </td>
                      <td><span className="badge badge-info">{e.Role || '—'}</span></td>
                      <td>₹{Number(e.SalaryAmount || 0).toLocaleString()}</td>
                      <td>{e.Grade || '—'}</td>
                      <td>{e.JoinDate?.split('T')[0]}</td>
                      <td><span className={`badge ${e.Performance === 'Excellent' ? 'badge-success' : e.Performance === 'Good' ? 'badge-info' : 'badge-pending'}`}>{e.Performance}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-sm btn-outline" title="Generate Bill" onClick={() => showBill(e.EmployeeID)}>📄</button>
                          <button className="btn btn-sm btn-outline" onClick={() => { setEditModal(e); setEForm({ CandidateID: e.CandidateID, SalaryID: e.SalaryID, DesignationID: e.DesignationID, ContractID: e.ContractID, JoinDate: e.JoinDate?.split('T')[0], Performance: e.Performance, PayscaleID: e.PayscaleID }); }}>✏️</button>
                          <button className="btn btn-sm btn-outline" style={{color:'var(--danger)'}} onClick={() => doDelete(e.EmployeeID)}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create / Edit Modal */}
        {(modal || editModal) && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 520 }}>
              <div className="card-title">{modal ? '🏢 New Employee' : `✏️ Edit Employee #${editModal.EmployeeID}`}</div>
              <form onSubmit={modal ? doCreate : doUpdate}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Candidate (Training Completed) *</label>
                    <select value={eForm.CandidateID} onChange={(e) => setEForm({ ...eForm, CandidateID: e.target.value })} required disabled={!!editModal}>
                      <option value="">— Select Candidate —</option>
                      {completedTraining.map((t) => (
                        <option key={t.CandidateID} value={t.CandidateID}>#{t.CandidateID} — {t.FirstName} {t.LastName} ({t.PreferredRole})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Designation *</label>
                    <select value={eForm.DesignationID} onChange={(e) => setEForm({ ...eForm, DesignationID: e.target.value })} required>
                      <option value="">— Select —</option>
                      {designations.map((d) => <option key={d.DesignationID} value={d.DesignationID}>{d.Role}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Joined Salary Structure *</label>
                    <select value={eForm.SalaryID} onChange={(e) => setEForm({ ...eForm, SalaryID: e.target.value })} required>
                      <option value="">— Select —</option>
                      {salaries.map((s) => <option key={s.SalaryID} value={s.SalaryID}>₹{Number(s.SalaryAmount).toLocaleString()}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Current Payscale/Grade</label>
                    <select value={eForm.PayscaleID} onChange={(e) => setEForm({ ...eForm, PayscaleID: e.target.value })}>
                        <option value="">— Opt Grade —</option>
                        {payscales.map(p => <option key={p.PayscaleID} value={p.PayscaleID}>{p.Grade} (₹{p.BaseSalary})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Contract *</label>
                    <select value={eForm.ContractID} onChange={(e) => setEForm({ ...eForm, ContractID: e.target.value })} required>
                      <option value="">— Select —</option>
                      {contracts.map((c) => <option key={c.ContractID} value={c.ContractID}>#{c.ContractID} — {c.NoticePeriod} days</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Join Date *</label>
                    <input type="date" value={eForm.JoinDate} onChange={(e) => setEForm({ ...eForm, JoinDate: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Performance Rating</label>
                    <select value={eForm.Performance} onChange={(e) => setEForm({ ...eForm, Performance: e.target.value })}>
                      <option>Excellent</option><option>Good</option><option>Average</option><option>Poor</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                  <button type="submit" className="btn btn-primary">{modal ? 'Create' : 'Save'}</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setModal(false); setEditModal(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bill Modal */}
        {billModal && (
            <div className="modal-overlay">
                <div className="card modal-content" style={{ width: 500, padding: 30 }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <h2 style={{ margin: 0 }}>SALARY BILL</h2>
                        <p style={{ color: 'var(--text-secondary)' }}>{billModal.Month} {billModal.Year}</p>
                    </div>
                    <div style={{ borderTop: '2px solid #eee', paddingTop: 15 }}>
                        <p><strong>Employee:</strong> {billModal.EmployeeName}</p>
                        <p><strong>Designation:</strong> {billModal.Designation}</p>
                        <p><strong>Department:</strong> {billModal.Department}</p>
                        <p><strong>Grade:</strong> {billModal.Grade}</p>
                    </div>
                    <table style={{ width: '100%', marginTop: 15, borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #ddd' }}>
                                <th align="left">Description</th>
                                <th align="right">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr><td>Base Salary</td><td align="right">{billModal.Earnings.Base}</td></tr>
                            <tr><td>HRA</td><td align="right">{billModal.Earnings.HRA}</td></tr>
                            <tr><td>DA</td><td align="right">{billModal.Earnings.DA}</td></tr>
                            <tr><td>Others</td><td align="right">{billModal.Earnings.Others}</td></tr>
                            <tr style={{ borderTop: '2px solid #eee', fontWeight: 'bold' }}>
                                <td>Gross Total</td><td align="right">{billModal.TotalEarnings}</td></tr>
                            <tr><td>Deductions</td><td align="right">-{billModal.Deductions}</td></tr>
                            <tr style={{ borderTop: '2px solid var(--primary)', color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                <td>NET PAYABLE</td><td align="right">₹{billModal.NetPay}</td></tr>
                        </tbody>
                    </table>
                    <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => window.print()}>Print Bill</button>
                        <button className="btn btn-outline" style={{ marginLeft: 10 }} onClick={() => setBillModal(null)}>Close</button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default Employees;
