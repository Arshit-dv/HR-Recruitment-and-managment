import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { getAttendance, markAttendance, getAttendanceReport, getAllEmployees } from '../services/api';
import toast from 'react-hot-toast';

const Attendance = () => {
    const [logs, setLogs] = useState([]);
    const [report, setReport] = useState([]); 
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ 
        EmployeeID: '', 
        Date: new Date().toISOString().split('T')[0], 
        Status: 'Present', 
        CheckIn: '09:00:00', 
        CheckOut: '17:00:00' 
    });

    const loadData = async () => {
        setLoading(true);
        try {
            const [l, r, e] = await Promise.all([getAttendance(), getAttendanceReport(), getAllEmployees()]);
            setLogs(l.data?.data || []);
            setReport(r.data?.data || []);
            setEmployees(e.data?.data || []);
        } catch(e) { toast.error('Attendance load failed'); }
        setLoading(false);
    };

    const loadReport = async () => {
        try {
            const now = new Date();
            const { data } = await getAttendanceReport({ month: now.getMonth() + 1, year: now.getFullYear() });
            setReport(data?.data || []);
        } catch(e) {}
    };

    useEffect(() => { loadData(); }, []);

    const handleMark = async (e) => {
        e.preventDefault();
        try {
            await markAttendance(form);
            toast.success('Attendance marked! ✅');
            setShowModal(false);
            loadData();
        } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    const filteredLogs = logs.filter(l => l.EmployeeID.toString().includes(search));

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>📅 Attendance & Leave</h1>
                        <p>Track daily check-ins and monthly cumulative reports</p>
                    </div>
                    <div style={{ display:'flex', gap: 10 }}>
                        <div className="search-box">
                            <input type="text" placeholder="Search by ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="form-input" />
                        </div>
                        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Mark Attendance</button>
                    </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                    {/* Monthly Summary Report */}
                    <div className="card">
                        <div className="card-title">📊 Monthly Cumulative Report — {new Date().toLocaleString('default', { month: 'long' })}</div>
                        <div className="table-wrapper" style={{ maxHeight: 500 }}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee ID</th>
                                        <th>Present</th>
                                        <th>Absent</th>
                                        <th>Leave</th>
                                        <th>Half-Day</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.map(r => (
                                        <tr key={r.EmployeeID}>
                                            <td><strong>#{r.EmployeeID}</strong></td>
                                            <td><span className="badge badge-success">{r.PresentDays}</span></td>
                                            <td><span className="badge badge-danger">{r.AbsentDays}</span></td>
                                            <td><span className="badge badge-info">{r.LeaveDays}</span></td>
                                            <td><span className="badge badge-neutral">{r.HalfDays}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Daily Logs */}
                    <div className="card">
                        <div className="card-title">🕒 Recent Check-in Logs</div>
                        <div className="table-wrapper" style={{ maxHeight: 500 }}>
                            {loading ? <div className="spinner" /> : (
                                <table>
                                    <thead><tr><th>Emp ID</th><th>Date</th><th>Status</th><th>Time</th></tr></thead>
                                    <tbody>
                                        {filteredLogs.slice(0, 15).map((l, idx) => (
                                            <tr key={idx}>
                                                <td>#{l.EmployeeID}</td>
                                                <td>{l.Date?.split('T')[0]}</td>
                                                <td><span className={`badge ${l.Status === 'Present' ? 'badge-success' : 'badge-danger'}`}>{l.Status}</span></td>
                                                <td style={{ fontSize: '0.8rem' }}>{l.CheckIn} - {l.CheckOut}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="card modal-content" style={{ width: 440 }}>
                            <div className="card-title">➕ Mark Daily Attendance</div>
                            <form onSubmit={handleMark}>
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label>Select Employee *</label>
                                    <select value={form.EmployeeID} onChange={(e) => setForm({ ...form, EmployeeID: e.target.value })} required>
                                        <option value="">— Select Employee —</option>
                                        {employees.map(e => <option key={e.EmployeeID} value={e.EmployeeID}>#{e.EmployeeID} - {e.FirstName} {e.LastName}</option>)}
                                    </select>
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Date *</label>
                                        <input type="date" value={form.Date} onChange={(e) => setForm({ ...form, Date: e.target.value })} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select value={form.Status} onChange={(e) => setForm({ ...form, Status: e.target.value })}>
                                            <option>Present</option><option>Absent</option><option>Leave</option><option>Half-Day</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Check In</label>
                                        <input type="time" value={form.CheckIn} onChange={(e) => setForm({ ...form, CheckIn: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Check Out</label>
                                        <input type="time" value={form.CheckOut} onChange={(e) => setForm({ ...form, CheckOut: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                                    <button type="submit" className="btn btn-primary">Save Check-in</button>
                                    <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Attendance;
