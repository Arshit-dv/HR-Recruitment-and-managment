import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  getAllSalary, createSalary, updateSalary, deleteSalary, 
  getAllContracts, createContract, updateContract, deleteContract,
  getPayscales, getAllEmployees, getSalaryBill, deletePayscale 
} from '../services/api';
import toast from 'react-hot-toast';

const Salary = () => {
  const [salaries, setSalaries]   = useState([]);
  const [contracts, setContracts] = useState([]);
  const [payscales, setPayscales] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  
  const [salForm, setSalForm]     = useState({ SalaryAmount: '', SalaryDate: '' });
  const [ctForm, setCtForm]       = useState({ ContractDate: '', NoticePeriod: '' });
  
  const [editSal, setEditSal]     = useState(null);
  const [editCt, setEditCt]       = useState(null);
  const [procModal, setProcModal] = useState(false);
  const [billModal, setBillModal] = useState(null);
  const [metrics, setMetrics]     = useState({ total_expenditure: 0, average_salary: 0 });
  const [deptMetrics, setDeptMetrics] = useState([]);
  const [selectedDept, setSelectedDept] = useState('All');

  const load = async () => {
    setLoading(true);
    try {
        const [s, c, p, e] = await Promise.all([getAllSalary(), getAllContracts(), getPayscales(), getAllEmployees()]);
        setSalaries(s.data?.data || []);
        setMetrics(s.data?.metrics || { total_expenditure: 0, average_salary: 0 });
        setDeptMetrics(s.data?.deptMetrics || []);
        setContracts(c.data?.data || []);
        setPayscales(p.data?.data || []);
        setEmployees(e.data?.data || []);
    } catch (e) { toast.error('Error loading data'); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const generateEmpBill = async (employeeID) => {
    try {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear().toString();
        const { data } = await getSalaryBill(employeeID, month, year);
        setBillModal(data?.data);
        toast.success('Bill generated! 📄');
    } catch (e) { toast.error('Check attendance records first?'); }
  };

  const onSalSubmit = async (e) => { e.preventDefault();
    try {
      if (editSal) { await updateSalary(editSal.SalaryID, salForm); toast.success('Salary updated'); }
      else { await createSalary(salForm); toast.success('Salary created'); }
      setSalForm({ SalaryAmount: '', SalaryDate: '' }); setEditSal(null); load();
    } catch (err) { toast.error('Failed'); }
  };

  const onCtSubmit = async (e) => { e.preventDefault();
    try {
      if (editCt) { await updateContract(editCt.ContractID, ctForm); toast.success('Contract updated'); }
      else { await createContract(ctForm); toast.success('Contract created'); }
      setCtForm({ ContractDate: '', NoticePeriod: '' }); setEditCt(null); load();
    } catch (err) { toast.error('Failed'); }
  };

  const filteredSalaries = salaries.filter(s => s.SalaryAmount?.toString().includes(search) || s.SalaryID?.toString().includes(search));

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>💰 Payroll Management</h1>
            <p>Manage salary structures, contracts, and process employee pay bills</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <div className="search-box">
                <input type="text" placeholder="Search salaries..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" />
            </div>
            <button className="btn btn-primary" onClick={() => setProcModal(true)}>⚙️ Process Bills</button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-card">
          <div className="filter-group">
            <span className="filter-label">Analyze By Department:</span>
            <select 
              className="filter-input" 
              value={selectedDept} 
              onChange={(e) => setSelectedDept(e.target.value)}
              style={{ minWidth: 200 }}
            >
              <option value="All">All Departments</option>
              {deptMetrics.map(d => <option key={d.DeptName} value={d.DeptName}>{d.DeptName}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}></div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {selectedDept === 'All' ? 'Viewing overall organizational summary' : `Viewing breakdown for ${selectedDept}`}
          </p>
        </div>

        {/* Aggregation Stats */}
        <div className="stats-grid" style={{ marginBottom: 28 }}>
          <div className="stat-card success">
            <h3>Total Salary Expenditure</h3>
            <div className="value">
              ₹{selectedDept === 'All' 
                ? Number(metrics?.total_expenditure || 0).toLocaleString()
                : Number(deptMetrics.find(d => d.DeptName === selectedDept)?.total_dept_salary || 0).toLocaleString()
              }
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              {selectedDept === 'All' ? 'Organizational Aggregate' : `${selectedDept} Expenditure`}
            </p>
          </div>

          <div className="stat-card info">
            <h3>Average Employee Salary</h3>
            <div className="value">
              ₹{selectedDept === 'All'
                ? Number(metrics?.average_salary || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })
                : Number(deptMetrics.find(d => d.DeptName === selectedDept)?.avg_dept_salary || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })
              }
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
              Average per {selectedDept === 'All' ? 'Employee' : `${selectedDept} Personnel`}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Salary Form */}
          <div className="card">
            <div className="card-title">Salary — {editSal ? 'Edit' : 'New Structure'}</div>
            <form onSubmit={onSalSubmit}>
              <div className="form-group">
                <label>Salary Amount (Monthly) *</label>
                <input type="number" value={salForm.SalaryAmount} onChange={(e) => setSalForm({ ...salForm, SalaryAmount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Effective Date</label>
                <input type="date" value={salForm.SalaryDate} onChange={(e) => setSalForm({ ...salForm, SalaryDate: e.target.value })} />
              </div>
              <div style={{ display:'flex', gap: 8, marginTop: 15 }}>
                <button type="submit" className="btn btn-primary btn-sm">{editSal ? 'Save' : 'Create'}</button>
                {editSal && <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditSal(null); setSalForm({SalaryAmount:'', SalaryDate:''}); }}>Cancel</button>}
              </div>
            </form>
          </div>

          {/* Contract Form */}
          <div className="card">
            <div className="card-title">Contract Template — {editCt ? 'Edit' : 'New'}</div>
            <form onSubmit={onCtSubmit}>
              <div className="form-group">
                <label>Notice Period (days) *</label>
                <input type="number" value={ctForm.NoticePeriod} onChange={(e) => setCtForm({ ...ctForm, NoticePeriod: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Contract Date</label>
                <input type="date" value={ctForm.ContractDate} onChange={(e) => setCtForm({ ...ctForm, ContractDate: e.target.value })} />
              </div>
              <div style={{ display:'flex', gap: 8, marginTop: 15 }}>
                <button type="submit" className="btn btn-primary btn-sm">{editCt ? 'Save' : 'Create'}</button>
                {editCt && <button type="button" className="btn btn-outline btn-sm" onClick={() => { setEditCt(null); setCtForm({ContractDate:'', NoticePeriod:''}); }}>Cancel</button>}
              </div>
            </form>
          </div>

          <div className="card">
            <div className="card-title">🎖 Payscale Grades</div>
            <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {payscales.map(p => (
                    <div key={p.PayscaleID} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div>
                            <div style={{ fontWeight: 600 }}>{p.Grade}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base: ₹{p.BaseSalary} | HRA: ₹{p.HRA} | DA: ₹{p.DA}</div>
                        </div>
                        <button className="btn btn-sm" onClick={async () => { if(window.confirm('Delete this grade?')){ try{ await deletePayscale(p.PayscaleID); toast.success('Deleted'); load(); }catch(e){ toast.error('Failed'); } } }} style={{ color: 'var(--danger)', padding: '2px 6px' }}>🗑</button>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card">
            <div className="card-title">💰 Salary List</div>
            <div className="table-wrapper">
                {loading ? <div className="spinner" /> : (
                    <table>
                    <thead><tr><th>ID</th><th>Amount</th><th>Effective Date</th><th>Actions</th></tr></thead>
                    <tbody>
                        {filteredSalaries.map((s) => (
                        <tr key={s.SalaryID}>
                            <td><strong>#{s.SalaryID}</strong></td>
                            <td>₹{Number(s.SalaryAmount || 0).toLocaleString()}</td>
                            <td>{s.SalaryDate?.split('T')[0] || '—'}</td>
                            <td>
                            <div style={{display:'flex', gap:4}}>
                                <button className="btn btn-sm btn-outline" onClick={() => { setEditSal(s); setSalForm({SalaryAmount: s.SalaryAmount, SalaryDate: s.SalaryDate?.split('T')[0]}); }}>✏️</button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
            </div>
          </div>

          <div className="card">
            <div className="card-title">📋 Contract List</div>
            <div className="table-wrapper">
                {loading ? <div className="spinner" /> : (
                    <table>
                    <thead><tr><th>ID</th><th>Notice</th><th>Start Date</th><th>Actions</th></tr></thead>
                    <tbody>
                        {contracts.map((c) => (
                        <tr key={c.ContractID}>
                            <td><strong>#{c.ContractID}</strong></td>
                            <td>{c.NoticePeriod} days</td>
                            <td>{c.ContractDate?.split('T')[0] || '—'}</td>
                            <td>
                            <div style={{display:'flex', gap:4}}>
                                <button className="btn btn-sm btn-outline" onClick={() => { setEditCt(c); setCtForm({NoticePeriod: c.NoticePeriod, ContractDate: c.ContractDate?.split('T')[0]}); }}>✏️</button>
                            </div>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                )}
            </div>
          </div>
        </div>

        {/* Processing Modal */}
        {procModal && (
            <div className="modal-overlay">
                <div className="card modal-content" style={{ width: 600 }}>
                    <div className="card-title">⚙️ Process Employee Bills</div>
                    <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom: 20 }}>Select an employee to generate their monthly bill based on their Payscale and performance.</p>
                    <div className="table-wrapper" style={{ maxHeight: 400 }}>
                        <table>
                            <thead><tr><th>ID</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {employees.map(e => (
                                    <tr key={e.EmployeeID}>
                                        <td><strong>#{e.EmployeeID}</strong></td>
                                        <td>{e.Role}</td>
                                        <td><span className="badge badge-success">Active</span></td>
                                        <td><button className="btn btn-sm btn-primary" onClick={() => generateEmpBill(e.EmployeeID)}>📄 Generate</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button className="btn btn-outline" style={{ marginTop: 20, width: '100%' }} onClick={() => setProcModal(false)}>Close Processing</button>
                </div>
            </div>
        )}

        {/* Bill Result Modal */}
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
                            <tr style={{ borderTop: '2px solid var(--accent)', color: 'var(--accent)', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                <td>NET PAYABLE</td><td align="right">₹{billModal.NetPay}</td></tr>
                        </tbody>
                    </table>
                    <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={() => window.print()}>Print Bill</button>
                        <button className="btn btn-outline" style={{ marginLeft: 10 }} onClick={() => setBillModal(null)}>Dismiss</button>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
};

export default Salary;
