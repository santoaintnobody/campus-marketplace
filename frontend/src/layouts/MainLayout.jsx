import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useRef } from 'react';
import { notificationAPI, messageAPI, favoriteAPI } from '../api';
import './MainLayout.css';

const QUICK_CATEGORIES = [
  { label: 'Textbooks', value: 'TEXTBOOKS', icon: '📚' },
  { label: 'Electronics', value: 'ELECTRONICS', icon: '💻' },
  { label: 'Furniture', value: 'FURNITURE', icon: '🪑' },
  { label: 'Bicycles', value: 'BICYCLES', icon: '🚲' },
  { label: 'Calculators', value: 'CALCULATORS', icon: '🔢' },
  { label: 'Hostel Essentials', value: 'HOSTEL_ESSENTIALS', icon: '🏠' },
  { label: 'Lab Records', value: 'LAB_RECORDS', icon: '🧪' },
  { label: 'Other', value: 'OTHER', icon: '📦' },
];

export default function MainLayout() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [favCount, setFavCount] = useState(0);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showCatMenu, setShowCatMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  const catMenuRef = useRef(null);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      const fetchCounts = () => {
        notificationAPI.getUnreadCount()
          .then(r => setUnreadNotifs(r.data?.count ?? r.data ?? 0))
          .catch(() => {});
        messageAPI.getUnreadCount()
          .then(r => setUnreadMessages(r.data?.count ?? (typeof r.data === 'number' ? r.data : 0)))
          .catch(() => {});
        favoriteAPI.getAll()
          .then(r => setFavCount(r.data?.length ?? (Array.isArray(r.data) ? r.data.length : 0)))
          .catch(() => {});
      };
      fetchCounts();
      const interval = setInterval(fetchCounts, 15000);
      window.addEventListener('app:badge-refresh', fetchCounts);
      return () => {
        clearInterval(interval);
        window.removeEventListener('app:badge-refresh', fetchCounts);
      };
    }
  }, [isAuthenticated, location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) {
        setShowCatMenu(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenu(false);
    setShowCatMenu(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/browse?search=${encodeURIComponent(navSearch.trim())}`);
      setNavSearch('');
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner container">
          {/* Brand Logo */}
          <Link to="/" className="navbar-brand">
            <span className="brand-icon">🏪</span>
            <span className="brand-text">Campus<span className="brand-highlight">Marketplace</span></span>
          </Link>

          {/* Nav Search Input */}
          <form className="nav-search-bar" onSubmit={handleNavSearch}>
            <span className="nav-search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search items..."
              value={navSearch}
              onChange={e => setNavSearch(e.target.value)}
              className="nav-search-input"
            />
          </form>

          {/* Links and Actions */}
          <div className={`navbar-links ${mobileMenu ? 'active' : ''}`}>
            <Link to="/browse" className="nav-link">
              🛍️ Browse
            </Link>

            {/* Categories Dropdown */}
            <div className="nav-dropdown-wrapper" ref={catMenuRef}>
              <button
                type="button"
                className="nav-link nav-dropdown-btn"
                onClick={() => setShowCatMenu(!showCatMenu)}
              >
                📂 Categories ▾
              </button>
              {showCatMenu && (
                <div className="nav-dropdown-menu">
                  {QUICK_CATEGORIES.map(c => (
                    <Link
                      key={c.value}
                      to={`/browse?category=${c.value}`}
                      className="dropdown-item"
                    >
                      <span className="cat-drop-icon">{c.icon}</span>
                      <span>{c.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <Link to="/sell" className="btn btn-lime btn-sm nav-sell-btn">
                  ➕ Sell Item
                </Link>

                <Link to="/chat" className="nav-link nav-link-icon" title="Messages">
                  💬
                  {unreadMessages > 0 && <span className="badge badge-coral">{unreadMessages}</span>}
                </Link>

                <Link to="/notifications" className="nav-link nav-link-icon" title="Notifications">
                  🔔
                  {unreadNotifs > 0 && <span className="badge badge-coral">{unreadNotifs}</span>}
                </Link>

                <Link to="/favorites" className="nav-link nav-link-icon" title="Wishlist">
                  ❤️
                  {favCount > 0 && <span className="badge badge-lime">{favCount}</span>}
                </Link>

                {isAdmin && (
                  <Link to="/admin" className="nav-link nav-admin">
                    🛡️ Admin
                  </Link>
                )}

                {/* Profile Avatar & Menu */}
                <div className="nav-dropdown-wrapper" ref={profileMenuRef}>
                  <button
                    type="button"
                    className="nav-profile-btn"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="nav-avatar">
                      {user?.profileImage ? (
                        <img src={`/uploads/${user.profileImage}`} alt="" />
                      ) : (
                        <span>{user?.fullName?.charAt(0) || 'S'}</span>
                      )}
                    </div>
                  </button>

                  {showProfileMenu && (
                    <div className="nav-dropdown-menu profile-menu">
                      <div className="dropdown-user-header">
                        <strong>{user?.fullName}</strong>
                        <span>{user?.email}</span>
                      </div>
                      <hr className="dropdown-divider" />
                      <Link to="/profile" className="dropdown-item">📊 Student Dashboard</Link>
                      <Link to="/sell" className="dropdown-item">➕ Post New Listing</Link>
                      <Link to="/favorites" className="dropdown-item">❤️ Saved Wishlist</Link>
                      <Link to="/chat" className="dropdown-item">💬 Chat Messages</Link>
                      <hr className="dropdown-divider" />
                      <button className="dropdown-item logout-item" onClick={handleLogout}>
                        🚪 Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="nav-auth-buttons">
                <Link to="/login" className="btn btn-outline btn-sm">
                  Login
                </Link>
                <Link to="/register" className="btn btn-lime btn-sm">
                  Sign Up 🎓
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="navbar-toggle"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Toggle navigation"
          >
            {mobileMenu ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}
