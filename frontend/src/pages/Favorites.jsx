import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { favoriteAPI } from '../api';
import { useToast } from '../context/ToastContext';
import './Browse.css';

export default function Favorites() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const res = await favoriteAPI.getAll();
      if (res?.data) {
        setListings(res.data);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await favoriteAPI.remove(id);
      setListings(prev => prev.filter(l => l.id !== id));
      window.dispatchEvent(new CustomEvent('app:badge-refresh'));
      showToast('Item removed from your wishlist');
    } catch (err) {
      showToast('Failed to remove favorite', 'error');
    }
  };

  return (
    <div className="page-wrapper browse-page">
      <div className="container">
        <div className="browse-header-banner" style={{ background: 'linear-gradient(135deg, #1b2a4a 0%, #b91c1c 100%)' }}>
          <div>
            <span className="browse-eyebrow">Personal Wishlist</span>
            <h1>❤️ Saved Items ({listings.length})</h1>
            <p className="browse-subtitle">Quickly track and review the campus listings you have bookmarked.</p>
          </div>
          <Link to="/browse" className="btn btn-lime">
            🛍️ Browse More Items
          </Link>
        </div>

        {loading ? (
          <div className="listings-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card skeleton-card">
                <div className="skeleton" style={{ height: 180 }}></div>
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 20, width: '80%', marginBottom: 10 }}></div>
                  <div className="skeleton" style={{ height: 24, width: '50%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">🤍</div>
            <h3>No saved items yet</h3>
            <p>Whenever you see an interesting textbook, calculator, cycle, or tech gadget, click the heart icon to save it here for easy access.</p>
            <div className="empty-state-actions">
              <Link to="/browse" className="btn btn-primary btn-lg">
                🛍️ Explore Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map(l => (
              <div key={l.id} className="listing-card card">
                <Link to={`/listing/${l.id}`} className="listing-card-image">
                  {l.images && l.images.length > 0 ? (
                    <img src={l.images[0]} alt={l.title} />
                  ) : (
                    <div className="listing-no-image">
                      <span>📦</span>
                    </div>
                  )}
                  <span className="chip chip-condition">{l.itemCondition?.replace('_', ' ')}</span>
                  <button
                    className="listing-fav-btn active"
                    onClick={(e) => removeFavorite(l.id, e)}
                    title="Remove from wishlist"
                  >
                    ❤️
                  </button>
                </Link>

                <div className="card-body">
                  <div className="listing-top-row">
                    <span className="chip chip-category-small">{l.category?.replace('_', ' ')}</span>
                    <span className="listing-location">📍 {l.location || 'Campus'}</span>
                  </div>

                  <Link to={`/listing/${l.id}`}>
                    <h4 className="listing-title">{l.title}</h4>
                  </Link>

                  <div className="listing-price-row">
                    <div className="price">₹{l.price?.toLocaleString('en-IN')}</div>
                    {l.status === 'ACTIVE' ? (
                      <span className="chip chip-active" style={{ fontSize: '0.6875rem' }}>Active</span>
                    ) : (
                      <span className={`chip chip-${l.status?.toLowerCase()}`} style={{ fontSize: '0.6875rem' }}>{l.status}</span>
                    )}
                  </div>

                  <div className="listing-seller-footer">
                    <button
                      className="btn btn-ghost btn-xs"
                      style={{ color: 'var(--error)' }}
                      onClick={(e) => removeFavorite(l.id, e)}
                    >
                      🗑️ Remove
                    </button>
                    <Link to={`/listing/${l.id}`} className="btn btn-outline btn-xs">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
