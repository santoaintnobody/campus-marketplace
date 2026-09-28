import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const links = [
    { path: '/admin', label: '📊 Dashboard', exact: true },
    { path: '/admin/users', label: '👥 Users' },
    { path: '/admin/listings', label: '📦 Listings' },
    { path: '/admin/reports', label: '⚠️ Reports' },
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <Link to="/">🏪</Link>
          <h3>Admin Panel</h3>
        </div>
        <nav className="admin-nav">
          {links.map(l => (
            <Link key={l.path} to={l.path}
              className={`admin-nav-link ${(l.exact ? location.pathname === l.path : location.pathname.startsWith(l.path)) ? 'active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-nav-link">← Back to Marketplace</Link>
          <button className="btn btn-ghost btn-sm" style={{ width: '100%' }} onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
