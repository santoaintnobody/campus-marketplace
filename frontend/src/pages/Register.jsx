import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Register() {
  const [form, setForm] = useState({ fullName: '', email: '', studentId: '', department: '', year: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      const res = await authAPI.register(form);
      login(res.data.token, res.data.user);
      showToast('Account created successfully!', 'success');
      navigate('/browse');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors ? Object.values(err.response.data.errors).join('. ') : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-container" style={{ maxWidth: 520 }}>
        <div className="auth-header">
          <Link to="/" className="auth-logo">🏪 Campus<span>Marketplace</span></Link>
          <h1>Create Account</h1>
          <p>Join your campus marketplace</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Enter your full name" value={form.fullName} onChange={set('fullName')} required />
          </div>
          <div className="auth-grid">
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input type="email" className="form-input" placeholder="name@college.edu" value={form.email} onChange={set('email')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input className="form-input" placeholder="e.g. CS2021001" value={form.studentId} onChange={set('studentId')} required />
            </div>
          </div>
          <div className="auth-grid">
            <div className="form-group">
              <label className="form-label">Department</label>
              <input className="form-input" placeholder="e.g. Computer Science" value={form.department} onChange={set('department')} />
            </div>
            <div className="form-group">
              <label className="form-label">Year</label>
              <select className="form-input form-select" value={form.year} onChange={set('year')}>
                <option value="">Select Year</option>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
                <option>PG 1st Year</option>
                <option>PG 2nd Year</option>
              </select>
            </div>
          </div>
          <div className="auth-grid">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Min 6 characters" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input type="password" className="form-input" placeholder="Confirm password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
