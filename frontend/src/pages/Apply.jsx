import React, { useState } from 'react';
import { submitApplication } from '../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const positions = ['Developer', 'Analyst', 'Manager', 'Tester', 'HR'];

const Apply = () => {
  const [form, setForm] = useState({
    FirstName: '', LastName: '', PreferredRole: '', Qualification: '', Specialization: '', YearsOfExperience: ''
  });
  const [skillInput, setSkillInput]     = useState('');
  const [projectInput, setProjectInput] = useState('');
  const [skills, setSkills]     = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const addSkill = () => {
    if (skillInput.trim()) { setSkills([...skills, skillInput.trim()]); setSkillInput(''); }
  };
  const addProject = () => {
    if (projectInput.trim()) { setProjects([...projects, projectInput.trim()]); setProjectInput(''); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await submitApplication({ ...form, Skills: skills, Projects: projects });
      setSubmitted(data.ApplicationID);
      toast.success('Application submitted! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally { setLoading(false); }
  };

  if (submitted) {
    return (
      <div className="apply-page">
        <div className="apply-card card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: 8 }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Your <strong style={{ color: 'var(--accent)' }}>Application ID is #{submitted}</strong>.<br />
            Please save this number. Our HR team will reach out soon.
          </p>
          <Link to="/login" className="btn btn-primary">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <div className="apply-card">
        <div className="apply-header">
          <h1>🚀 Job Application</h1>
          <p>Submit your application for a role at our organization</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* Role */}
            <div className="form-grid">
              <div className="form-group">
                <label>First Name *</label>
                <input value={form.FirstName} onChange={(e) => setForm({ ...form, FirstName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input value={form.LastName} onChange={(e) => setForm({ ...form, LastName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Preferred Role *</label>
                <select value={form.PreferredRole} onChange={(e) => setForm({ ...form, PreferredRole: e.target.value })} required>
                  <option value="">— Select Role —</option>
                  {positions.map((p) => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Qualification *</label>
                <input value={form.Qualification} onChange={(e) => setForm({ ...form, Qualification: e.target.value })}
                  placeholder="e.g. BTech, MBA, BSc" required />
              </div>
              <div className="form-group">
                <label>Specialization</label>
                <input value={form.Specialization} onChange={(e) => setForm({ ...form, Specialization: e.target.value })}
                  placeholder="e.g. CSE, Finance, HR" />
              </div>
              <div className="form-group">
                <label>Years of Experience</label>
                <input type="number" min={0} value={form.YearsOfExperience}
                  onChange={(e) => setForm({ ...form, YearsOfExperience: e.target.value })} placeholder="0" />
              </div>
            </div>

            {/* Skills */}
            <div style={{ marginTop: 20 }}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label>Skills</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g. Python, SQL, React..." style={{ flex: 1 }} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={addSkill}>+ Add</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {skills.map((s, i) => (
                  <span key={i} className="badge badge-info" style={{ cursor: 'pointer' }}
                    onClick={() => setSkills(skills.filter((_, idx) => idx !== i))}>
                    {s} ✕
                  </span>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div style={{ marginTop: 16 }}>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label>Projects</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={projectInput} onChange={(e) => setProjectInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProject())}
                    placeholder="e.g. Inventory System, Android App..." style={{ flex: 1 }} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={addProject}>+ Add</button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {projects.map((p, i) => (
                  <span key={i} className="badge badge-neutral" style={{ cursor: 'pointer' }}
                    onClick={() => setProjects(projects.filter((_, idx) => idx !== i))}>
                    {p} ✕
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '⏳ Submitting...' : '📨 Submit Application'}
              </button>
              <Link to="/login" className="btn btn-outline">Already have an account?</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Apply;
