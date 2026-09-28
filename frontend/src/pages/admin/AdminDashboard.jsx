import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(res => { setStats(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!stats) return <p>Failed to load dashboard</p>;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: '👥', color: '#3B82F6' },
    { label: 'Active Listings', value: stats.activeListings, icon: '📦', color: '#10B981' },
    { label: 'Pending Listings', value: stats.pendingListings, icon: '⏳', color: '#F59E0B' },
    { label: 'Sold Items', value: stats.soldListings, icon: '🎉', color: '#8B5CF6' },
    { label: 'Pending Reports', value: stats.pendingReports, icon: '⚠️', color: '#EF4444' },
    { label: 'Blocked Users', value: stats.blockedUsers, icon: '🚫', color: '#6B7280' },
    { label: 'Total Listings', value: stats.totalListings, icon: '📋', color: '#06B6D4' },
    { label: 'Transactions', value: stats.completedTransactions, icon: '💰', color: '#10B981' },
  ];

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-xl)' }}>Campus Marketplace overview</p>

      <div className="admin-stats-grid">
        {cards.map(c => (
          <div key={c.label} className="admin-stat-card card">
            <div className="card-body">
              <div className="admin-stat-icon" style={{ background: c.color + '15', color: c.color }}>{c.icon}</div>
              <div className="admin-stat-value">{c.value}</div>
              <div className="admin-stat-label">{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {stats.listingsByCategory && Object.keys(stats.listingsByCategory).length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-xl)' }}>
          <div className="card-body">
            <h3>Active Listings by Category</h3>
            <div className="category-bars">
              {Object.entries(stats.listingsByCategory).map(([cat, count]) => (
                <div key={cat} className="category-bar">
                  <span className="category-bar-label">{cat.replace('_', ' ')}</span>
                  <div className="category-bar-track">
                    <div className="category-bar-fill" style={{ width: `${Math.min(count / (stats.activeListings || 1) * 100, 100)}%` }} />
                  </div>
                  <span className="category-bar-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
