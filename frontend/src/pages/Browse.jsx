import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { listingAPI, favoriteAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Browse.css';

const CATEGORIES = [
  { label: 'All Categories', value: '', icon: '🌟' },
  { label: 'Textbooks', value: 'TEXTBOOKS', icon: '📚' },
  { label: 'Electronics', value: 'ELECTRONICS', icon: '💻' },
  { label: 'Furniture', value: 'FURNITURE', icon: '🪑' },
  { label: 'Bicycles', value: 'BICYCLES', icon: '🚲' },
  { label: 'Calculators', value: 'CALCULATORS', icon: '🔢' },
  { label: 'Hostel Essentials', value: 'HOSTEL_ESSENTIALS', icon: '🏠' },
  { label: 'Lab Records', value: 'LAB_RECORDS', icon: '🧪' },
  { label: 'Other', value: 'OTHER', icon: '📦' },
];

const CONDITIONS = [
  { label: 'All Conditions', value: '' },
  { label: 'Brand New', value: 'NEW' },
  { label: 'Like New', value: 'LIKE_NEW' },
  { label: 'Good Condition', value: 'GOOD' },
  { label: 'Fair Condition', value: 'FAIR' },
  { label: 'Used / Functional', value: 'USED' },
];

const SORT_OPTIONS = [
  { label: '✨ Newest First', value: 'newest' },
  { label: '⏳ Oldest First', value: 'oldest' },
  { label: '💰 Price: Low to High', value: 'price_asc' },
  { label: '💎 Price: High to Low', value: 'price_desc' },
];

export default function Browse() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const location = searchParams.get('location') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '0', 10);
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const hasActiveFilters = Boolean(search || category || condition || location || minPrice || maxPrice || sort !== 'newest');

  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = { page, size: 12, sort };
      if (search) params.search = search;
      if (category) params.category = category;
      if (condition) params.condition = condition;
      if (location) params.location = location;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;

      const res = await listingAPI.getAll(params);
      if (res?.data) {
        setListings(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || res.data.content?.length || 0);
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load listings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== 'page') params.set('page', '0');
    setSearchParams(params);
  };

  const clearAllFilters = () => {
    setSearchParams({});
  };

  const toggleFavorite = async (listing, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please login to save items to your wishlist', 'error');
      return;
    }
    try {
      if (listing.isFavorited) {
        await favoriteAPI.remove(listing.id);
        setListings(prev => prev.map(item => item.id === listing.id ? { ...item, isFavorited: false, favoriteCount: Math.max(0, (item.favoriteCount || 1) - 1) } : item));
        window.dispatchEvent(new CustomEvent('app:badge-refresh'));
        showToast('Removed from saved items');
      } else {
        await favoriteAPI.add(listing.id);
        setListings(prev => prev.map(item => item.id === listing.id ? { ...item, isFavorited: true, favoriteCount: (item.favoriteCount || 0) + 1 } : item));
        window.dispatchEvent(new CustomEvent('app:badge-refresh'));
        showToast('Added to saved items ❤️');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const conditionLabel = (c) => c?.replace('_', ' ');
  const categoryName = (c) => CATEGORIES.find(cat => cat.value === c)?.label || c?.replace('_', ' ');
  const categoryIcon = (c) => CATEGORIES.find(cat => cat.value === c)?.icon || '📦';

  return (
    <div className="page-wrapper browse-page">
      <div className="container">
        {/* Page Title & Search Header */}
        <div className="browse-header-banner">
          <div>
            <span className="browse-eyebrow">Campus Marketplace</span>
            <h1>Browse Student Listings</h1>
            <p className="browse-subtitle">Find verified pre-owned textbooks, electronics, cycles & hostel items</p>
          </div>

          <div className="browse-main-search">
            <span className="search-icon-inside">🔍</span>
            <input
              type="text"
              className="form-input browse-search-input"
              placeholder="Search by title, description, seller, or campus location..."
              value={search}
              onChange={(e) => updateParam('search', e.target.value)}
            />
            {search && (
              <button className="clear-search-btn" onClick={() => updateParam('search', '')}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="browse-categories-wrapper">
          <div className="browse-categories-bar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`category-pill ${category === cat.value ? 'active' : ''}`}
                onClick={() => updateParam('category', cat.value === category ? '' : cat.value)}
              >
                <span className="pill-icon">{cat.icon}</span>
                <span className="pill-label">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Filter Toolbar */}
        <div className="browse-toolbar">
          <div className="toolbar-left">
            {/* Condition Filter */}
            <div className="filter-group">
              <label className="filter-label">Condition</label>
              <select
                className="form-input form-select filter-select"
                value={condition}
                onChange={e => updateParam('condition', e.target.value)}
              >
                {CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Location Filter */}
            <div className="filter-group">
              <label className="filter-label">Campus Location</label>
              <input
                type="text"
                className="form-input filter-input-text"
                placeholder="e.g. Hostel A, Library"
                value={location}
                onChange={e => updateParam('location', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div className="filter-group price-inputs-group">
              <label className="filter-label">Price Range (₹)</label>
              <div className="price-inputs-row">
                <input
                  type="number"
                  className="form-input price-input"
                  placeholder="Min ₹"
                  value={minPrice}
                  onChange={e => updateParam('minPrice', e.target.value)}
                />
                <span className="price-sep">-</span>
                <input
                  type="number"
                  className="form-input price-input"
                  placeholder="Max ₹"
                  value={maxPrice}
                  onChange={e => updateParam('maxPrice', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="toolbar-right">
            {/* Sort Dropdown */}
            <div className="filter-group">
              <label className="filter-label">Sort By</label>
              <select
                className="form-input form-select filter-select"
                value={sort}
                onChange={e => updateParam('sort', e.target.value)}
              >
                {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {hasActiveFilters && (
              <button className="btn btn-ghost btn-sm clear-filters-btn" onClick={clearAllFilters}>
                🔄 Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Bar */}
        <div className="results-count-bar">
          <span className="results-count-text">
            {loading ? 'Searching listings...' : `Showing ${listings.length} of ${totalElements} items`}
          </span>
          {category && (
            <span className="active-tag-badge">
              Category: <strong>{categoryName(category)}</strong>
              <button onClick={() => updateParam('category', '')}>✕</button>
            </span>
          )}
          {condition && (
            <span className="active-tag-badge">
              Condition: <strong>{conditionLabel(condition)}</strong>
              <button onClick={() => updateParam('condition', '')}>✕</button>
            </span>
          )}
          {search && (
            <span className="active-tag-badge">
              Search: <strong>"{search}"</strong>
              <button onClick={() => updateParam('search', '')}>✕</button>
            </span>
          )}
        </div>

        {/* Listings Grid / Loader / Empty State */}
        {loading ? (
          <div className="listings-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <div key={n} className="card skeleton-card">
                <div className="skeleton" style={{ height: 190, width: '100%' }}></div>
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 10 }}></div>
                  <div className="skeleton" style={{ height: 20, width: '85%', marginBottom: 12 }}></div>
                  <div className="skeleton" style={{ height: 24, width: '50%', marginBottom: 14 }}></div>
                  <div className="skeleton" style={{ height: 28, width: '100%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">🔍</div>
            <h3>No listings match your filters</h3>
            <p>Try searching for a different keyword, removing price constraints, or clearing category filters.</p>
            <div className="empty-state-actions">
              <button className="btn btn-primary" onClick={clearAllFilters}>
                Clear All Filters
              </button>
              <Link to="/sell" className="btn btn-lime">
                ➕ Post the First Item
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="listings-grid">
              {listings.map(listing => (
                <div key={listing.id} className="listing-card card">
                  <Link to={`/listing/${listing.id}`} className="listing-card-image">
                    {listing.images && listing.images.length > 0 ? (
                      <img src={listing.images[0]} alt={listing.title} />
                    ) : (
                      <div className="listing-no-image">
                        <span className="no-img-icon">{categoryIcon(listing.category)}</span>
                      </div>
                    )}
                    <span className={`chip chip-condition chip-${listing.itemCondition?.toLowerCase()?.replace('_', '-')}`}>
                      {conditionLabel(listing.itemCondition)}
                    </span>
                    <button
                      className={`listing-fav-btn ${listing.isFavorited ? 'active' : ''}`}
                      onClick={(e) => toggleFavorite(listing, e)}
                      title={listing.isFavorited ? "Saved item" : "Save item"}
                    >
                      {listing.isFavorited ? '❤️' : '🤍'}
                    </button>
                  </Link>

                  <div className="card-body">
                    <div className="listing-top-row">
                      <span className="chip chip-category-small">
                        {categoryName(listing.category)}
                      </span>
                      <span className="listing-location" title={listing.location}>
                        📍 {listing.location || 'Campus'}
                      </span>
                    </div>

                    <Link to={`/listing/${listing.id}`}>
                      <h4 className="listing-title" title={listing.title}>{listing.title}</h4>
                    </Link>

                    <div className="listing-price-row">
                      <div className="price">₹{listing.price?.toLocaleString('en-IN')}</div>
                      {listing.seller?.rating > 0 && (
                        <div className="seller-rating-pill">
                          ★ {listing.seller.rating.toFixed(1)}
                        </div>
                      )}
                    </div>

                    <div className="listing-seller-footer">
                      <div className="seller-info">
                        <span className="seller-avatar-mini">
                          {listing.seller?.fullName?.charAt(0) || 'S'}
                        </span>
                        <span className="seller-name-txt">{listing.seller?.fullName || 'Student'}</span>
                        {listing.seller?.emailVerified && (
                          <span className="verified-tick" title="College Email Verified">✓</span>
                        )}
                      </div>
                      <Link to={`/listing/${listing.id}`} className="btn btn-outline btn-xs">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button
                  className="btn btn-outline btn-sm page-btn"
                  disabled={page === 0}
                  onClick={() => updateParam('page', String(page - 1))}
                >
                  ← Previous
                </button>

                <div className="page-numbers-row">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`page-num-btn ${page === i ? 'active' : ''}`}
                      onClick={() => updateParam('page', String(i))}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  className="btn btn-outline btn-sm page-btn"
                  disabled={page >= totalPages - 1}
                  onClick={() => updateParam('page', String(page + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
