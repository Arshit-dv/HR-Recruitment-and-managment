import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login({ username: data.username, role: data.role, user_id: data.user_id }, data.token);
      toast.success(`Welcome back, ${data.username}!`);
      navigate(data.role === 'hr' ? '/hr' : '/employee');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>⚡ HR System</h1>
          <p>Recruitment &amp; Management Platform</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: 16 }}>
            <label>Username</label>
            <input
              id="login-username"
              type="text"
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 24 }}>
            <label>Password</label>
            <input
              id="login-password"
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button id="login-btn" type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '⏳ Logging in...' : '🔐 Login'}
          </button>
        </form>
        <p style={{ marginTop: 20, textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          New here? <Link to="/register">Create account</Link> &nbsp;|&nbsp; <Link to="/apply">Apply for a job</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
