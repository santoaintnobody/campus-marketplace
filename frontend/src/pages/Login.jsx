import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      login(res.data.token, res.data.user);
      showToast('Welcome back!', 'success');
      navigate(res.data.user.role === 'ADMIN' ? '/admin' : '/browse');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🏪 Campus<span>Marketplace</span></Link>
          <h1>Welcome Back</h1>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">College Email</label>
            <input type="email" className="form-input" placeholder="your.name@college.edu"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Enter your password"
              value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="auth-actions">
            <Link to="/forgot-password" className="auth-link">Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo Fast Login Pills */}
        <div className="demo-accounts-box" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
            ⚡ Fast Demo Login (1-Click)
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setForm({ email: 'rahul@college.edu', password: 'student123' })}
            >
              🎓 Rahul (Student)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setForm({ email: 'priya@college.edu', password: 'student123' })}
            >
              🎓 Priya (Student)
            </button>
            <button
              type="button"
              className="btn btn-outline btn-xs"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setForm({ email: 'arjun@college.edu', password: 'student123' })}
            >
              🎓 Arjun (Student)
            </button>
            <button
              type="button"
              className="btn btn-lime btn-xs"
              style={{ fontSize: '0.75rem' }}
              onClick={() => setForm({ email: 'admin@college.edu', password: 'admin123' })}
            >
              🛡️ Admin Officer
            </button>
          </div>
        </div>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
