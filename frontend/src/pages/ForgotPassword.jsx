import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../api';
import './Auth.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🏪 Campus<span>Marketplace</span></Link>
          <h1>Reset Password</h1>
          <p>Enter your email to receive a reset link</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '3rem', marginBottom: 16 }}>📧</p>
            <h3>Check your email</h3>
            <p style={{ color: 'var(--muted)', marginTop: 8 }}>
              If an account exists with that email, you'll receive a password reset link.
            </p>
            <Link to="/login" className="btn btn-outline" style={{ marginTop: 24 }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">College Email</label>
              <input type="email" className="form-input" placeholder="your.name@college.edu"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}

        <p className="auth-footer">Remember your password? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
