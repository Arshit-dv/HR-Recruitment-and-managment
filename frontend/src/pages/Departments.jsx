import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import { 
    getAllDepartments, createDepartment, updateDepartment, deleteDepartment, 
    getAllDesignations, createDesignation, updateDesignation, deleteDesignation 
} from '../services/api';
import toast from 'react-hot-toast';

const Departments = () => {
  const [depts, setDepts] = useState([]);
  const [desigs, setDesigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState([]); 
  
  const [editDept, setEditDept] = useState(null);
  const [createDeptModal, setCreateDeptModal] = useState(false);
  const [dForm, setDForm] = useState({ DeptName: '', DeptPerformance: 'Good', DeptNoOfEmployees: 0, DeptVacancies: 0 });
  
  const [desModal, setDesModal] = useState(false);
  const [editDesig, setEditDesig] = useState(null);
  const [desForm, setDesForm] = useState({ Role: '', DeptID: '', Vacancies: 0, NoOfEmployees: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const [dr, gr] = await Promise.all([getAllDepartments(), getAllDesignations()]);
      setDepts(dr.data?.data || []);
      setDesigs(gr.data?.data || []);
    } catch (e) { toast.error('Load failed'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toggleDept = (id) => {
    setExpandedDepts(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const doDeptCreate = async (e) => {
    e.preventDefault();
    try {
      await createDepartment(dForm);
      toast.success('Department created');
      setCreateDeptModal(false);
      load();
    } catch (err) { toast.error('Create failed'); }
  };

  const doDeptUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDepartment(editDept.DeptID, dForm);
      toast.success('Department updated');
      setEditDept(null);
      load();
    } catch (err) { toast.error('Update failed'); }
  };

  const doDeptDelete = async (id) => {
    if (!window.confirm('Delete department?')) return;
    try { await deleteDepartment(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error('Failed'); }
  };

  const doDesigCreate = async (e) => {
    e.preventDefault();
    try {
      await createDesignation(desForm);
      toast.success('Designation created');
      setDesModal(false);
      load();
    } catch (err) { toast.error('Failed'); }
  };

  const doDesigUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDesignation(editDesig.DesignationID, desForm);
      toast.success('Designation updated');
      setEditDesig(null);
      load();
    } catch (err) { toast.error('Update failed'); }
  };

  const doDesigDelete = async (id) => {
    if (!window.confirm('Delete designation?')) return;
    try { await deleteDesignation(id); toast.success('Deleted'); load(); }
    catch (e) { toast.error('Failed'); }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>🏛️ Departments & Roles</h1>
            <p>Department hierarchy and role definitions</p>
          </div>
          <div style={{ display:'flex', gap: 10 }}>
            <button className="btn btn-outline" onClick={() => { setCreateDeptModal(true); setDForm({ DeptName: '', DeptPerformance: 'Medium', DeptNoOfEmployees: 0, DeptVacancies: 0 }); }}>
              + New Dept
            </button>
            <button className="btn btn-primary" onClick={() => { setDesModal(true); setDesForm({ Role: '', DeptID: depts[0]?.DeptID || '', Vacancies: 0, NoOfEmployees: 0 }); }}>
              + New Role
            </button>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            {loading ? <div className="spinner" /> : (
              <table>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}></th>
                    <th>ID</th>
                    <th>Name</th>
                    <th>People</th>
                    <th>Vacancies</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {depts.map((d) => {
                    const isExpanded = expandedDepts.includes(d.DeptID);
                    const deptDesigs = desigs.filter(x => x.DeptID === d.DeptID);
                    
                    return (
                      <React.Fragment key={d.DeptID}>
                        <tr style={{ cursor: 'pointer' }} onClick={() => toggleDept(d.DeptID)}>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                            {isExpanded ? '▼' : '▶'}
                          </td>
                          <td><strong>#{d.DeptID}</strong></td>
                          <td><div style={{ fontWeight: 600 }}>{d.DeptName}</div></td>
                          <td>{d.DeptNoOfEmployees}</td>
                          <td>{d.DeptVacancies}</td>
                          <td><span className={`badge ${d.DeptPerformance === 'Excellent' ? 'badge-success' : 'badge-info'}`}>{d.DeptPerformance}</span></td>
                          <td>
                            <div style={{ display:'flex', gap:6 }} onClick={(e) => e.stopPropagation()}>
                              <button className="btn btn-sm btn-outline" onClick={() => { setEditDept(d); setDForm({ DeptName: d.DeptName, DeptPerformance: d.DeptPerformance, DeptNoOfEmployees: d.DeptNoOfEmployees, DeptVacancies: d.DeptVacancies }); }}>✏️</button>
                              <button className="btn btn-sm btn-outline" style={{color:'var(--danger)', borderColor: 'var(--danger)'}} onClick={() => doDeptDelete(d.DeptID)}>🗑</button>
                            </div>
                          </td>
                        </tr>
                        
                        {isExpanded && (
                          <tr>
                            <td colSpan={7} style={{ background: 'var(--bg-secondary)', padding: '16px 40px' }}>
                              <div style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 24 }}>
                                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
                                  Organizational Hierarchy — Role Breakdown
                                </div>
                                {deptDesigs.length === 0 ? (
                                  <div style={{ padding: '8px 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>No designations defined.</div>
                                ) : (
                                  <table className="sub-table">
                                    <thead>
                                      <tr>
                                        <th>Role / Title</th>
                                        <th>Occupied</th>
                                        <th>Vacancies</th>
                                        <th style={{ textAlign: 'right' }}>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {deptDesigs.map(g => (
                                        <tr key={g.DesignationID}>
                                          <td><div style={{ fontWeight: 500 }}>{g.Role}</div></td>
                                          <td><span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{g.CurrentEmployees} Emps</span></td>
                                          <td>{g.Vacancies}</td>
                                          <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                              <button onClick={(e) => { e.stopPropagation(); setEditDesig(g); setDesForm({ Role: g.Role, DeptID: g.DeptID, Vacancies: g.Vacancies, NoOfEmployees: g.CurrentEmployees }); }} className="btn btn-sm btn-outline" style={{ padding: '2px 8px' }}>✏️</button>
                                              <button onClick={(e) => { e.stopPropagation(); doDesigDelete(g.DesignationID); }} className="btn btn-sm btn-outline" style={{ color: 'var(--danger)', padding: '2px 8px' }}>🗑</button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {editDept && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 440 }}>
              <div className="card-title">✏️ Edit Dept #{editDept.DeptID}</div>
              <form onSubmit={doDeptUpdate}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Dept Name</label>
                    <input value={dForm.DeptName} onChange={(e) => setDForm({ ...dForm, DeptName: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Employees</label>
                    <input type="number" value={dForm.DeptNoOfEmployees} onChange={(e) => setDForm({ ...dForm, DeptNoOfEmployees: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Vacancies</label>
                    <input type="number" value={dForm.DeptVacancies} onChange={(e) => setDForm({ ...dForm, DeptVacancies: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" className="btn btn-outline" onClick={() => setEditDept(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {createDeptModal && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 440 }}>
              <div className="card-title">🏛️ Create New Department</div>
              <form onSubmit={doDeptCreate}>
                <div className="form-grid">
                  <div className="form-group form-full">
                    <label>Dept Name *</label>
                    <input value={dForm.DeptName} onChange={(e) => setDForm({ ...dForm, DeptName: e.target.value })} required placeholder="e.g. Finance" />
                  </div>
                  <div className="form-group form-half">
                    <label>Performance</label>
                    <select value={dForm.DeptPerformance} onChange={(e) => setDForm({ ...dForm, DeptPerformance: e.target.value })}>
                      <option value="Excellent">Excellent</option>
                      <option value="Good">Good</option>
                      <option value="Medium">Medium</option>
                      <option value="Bad">Bad</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
                  <button type="submit" className="btn btn-primary">Create Dept</button>
                  <button type="button" className="btn btn-outline" onClick={() => setCreateDeptModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {(desModal || editDesig) && (
          <div className="modal-overlay">
            <div className="card modal-content" style={{ width: 440 }}>
              <div className="card-title">{editDesig ? `✏️ Edit Role: ${editDesig.Role}` : '➕ New Designation'}</div>
              <form onSubmit={editDesig ? doDesigUpdate : doDesigCreate}>
                <div className="form-group" style={{ marginBottom: 12 }}>
                  <label>Role Name *</label>
                  <input value={desForm.Role} onChange={(e) => setDesForm({ ...desForm, Role: e.target.value })} required placeholder="e.g. Senior Manager" />
                </div>
                {!editDesig && (
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>Department *</label>
                    <select value={desForm.DeptID} onChange={(e) => setDesForm({ ...desForm, DeptID: e.target.value })} required>
                      {depts.map(d => <option key={d.DeptID} value={d.DeptID}>{d.DeptName} (#{d.DeptID})</option>)}
                    </select>
                  </div>
                )}
                {editDesig && (
                   <div className="form-group" style={{ marginBottom: 16 }}>
                    <label>Vacancies</label>
                    <input type="number" value={desForm.Vacancies} onChange={(e) => setDesForm({ ...desForm, Vacancies: e.target.value })} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" className="btn btn-primary">{editDesig ? 'Save Changes' : 'Create Role'}</button>
                  <button type="button" className="btn btn-outline" onClick={() => { setDesModal(false); setEditDesig(null); }}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Departments;
