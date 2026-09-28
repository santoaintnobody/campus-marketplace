import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { listingAPI, favoriteAPI } from '../api';
import './Home.css';

const CATEGORIES = [
  { name: 'Textbooks', icon: '📚', value: 'TEXTBOOKS', desc: 'Syllabus, notes, GATE & placement books' },
  { name: 'Electronics', icon: '💻', value: 'ELECTRONICS', desc: 'Laptops, monitors, headphones & IoT kits' },
  { name: 'Furniture', icon: '🪑', value: 'FURNITURE', desc: 'Study tables, chairs, bookshelves & drawers' },
  { name: 'Bicycles', icon: '🚲', value: 'BICYCLES', desc: 'Gear cycles & campus commute bikes' },
  { name: 'Calculators', icon: '🔢', value: 'CALCULATORS', desc: 'Scientific & graphing calculators' },
  { name: 'Hostel Essentials', icon: '🏠', value: 'HOSTEL_ESSENTIALS', desc: 'Mattresses, lamps, mini fridges & kettles' },
  { name: 'Lab Records', icon: '🧪', value: 'LAB_RECORDS', desc: 'Certified manuals, records & drafters' },
  { name: 'Other', icon: '📦', value: 'OTHER', desc: 'Bags, sports equipment & college accessories' },
];

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredListings, setFeaturedListings] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 500,
    activeListings: 250,
    totalCategories: 8,
    completedExchanges: 100,
    listingsByCategory: {}
  });
  const [loadingListings, setLoadingListings] = useState(true);

  useEffect(() => {
    // Load Stats
    listingAPI.getStats()
      .then(res => {
        if (res?.data) setStats(res.data);
      })
      .catch(() => {});

    // Load Featured Listings
    listingAPI.getFeatured()
      .then(res => {
        if (res?.data) setFeaturedListings(res.data);
      })
      .catch(() => {})
      .finally(() => setLoadingListings(false));
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  const toggleFavorite = async (listing, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      showToast('Please login to save items', 'error');
      return;
    }
    try {
      if (listing.isFavorited) {
        await favoriteAPI.remove(listing.id);
        setFeaturedListings(prev => prev.map(item => item.id === listing.id ? { ...item, isFavorited: false, favoriteCount: Math.max(0, (item.favoriteCount || 1) - 1) } : item));
        window.dispatchEvent(new CustomEvent('app:badge-refresh'));
        showToast('Removed from favorites');
      } else {
        await favoriteAPI.add(listing.id);
        setFeaturedListings(prev => prev.map(item => item.id === listing.id ? { ...item, isFavorited: true, favoriteCount: (item.favoriteCount || 0) + 1 } : item));
        window.dispatchEvent(new CustomEvent('app:badge-refresh'));
        showToast('Added to favorites ❤️');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const getCategoryCount = (catValue) => {
    return stats.listingsByCategory?.[catValue] || 15;
  };

  return (
    <div className="home-page">
      {/* 1. HERO SECTION */}
      <section className="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-pulse"></span>
              🎓 Verified College Students Only
            </div>
            <h1>
              Buy, Sell & Exchange<br />
              <span className="hero-gradient-text">On-Campus Marketplace</span>
            </h1>
            <p className="hero-desc">
              The dedicated student-to-student platform to discover secondhand textbooks, electronics, cycles, calculators, and hostel essentials without paying middleman commissions.
            </p>

            {/* Quick Search Bar */}
            <form className="hero-search-form" onSubmit={handleHeroSearch}>
              <span className="hero-search-icon">🔍</span>
              <input
                type="text"
                className="hero-search-input"
                placeholder="Search textbooks, calculators, cycles, study tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-lime hero-search-btn">
                Search
              </button>
            </form>

            <div className="hero-actions">
              <Link to="/browse" className="btn btn-lime btn-lg">
                🛍️ Browse All Items
              </Link>
              {isAuthenticated ? (
                <Link to="/sell" className="btn btn-coral btn-lg">
                  ➕ Sell an Item
                </Link>
              ) : (
                <Link to="/register" className="btn btn-outline btn-lg hero-join-btn">
                  🚀 Join with College Email
                </Link>
              )}
            </div>

            <div className="hero-trust-bar">
              <div className="trust-item"><span>⚡</span> Instant Chat</div>
              <div className="trust-item"><span>🛡️</span> Zero Fees</div>
              <div className="trust-item"><span>📍</span> Same-Day Campus Handover</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. MARKETPLACE STATISTICS COUNTER */}
      <section className="stats-section container">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper blue">👥</div>
            <div className="stat-number">{stats.totalStudents > 0 ? `${stats.totalStudents}+` : '500+'}</div>
            <div className="stat-label">Verified Students</div>
            <div className="stat-subtext">Active campus community</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper lime">🏷️</div>
            <div className="stat-number">{stats.activeListings > 0 ? `${stats.activeListings}+` : '250+'}</div>
            <div className="stat-label">Active Listings</div>
            <div className="stat-subtext">Verified pre-owned items</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper orange">📦</div>
            <div className="stat-number">{stats.totalCategories || 8}</div>
            <div className="stat-label">Product Categories</div>
            <div className="stat-subtext">Textbooks, tech, gear & more</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon-wrapper green">🤝</div>
            <div className="stat-number">{stats.completedExchanges > 0 ? `${stats.completedExchanges}+` : '100+'}</div>
            <div className="stat-label">Successful Deals</div>
            <div className="stat-subtext">Direct student handovers</div>
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES */}
      <section className="categories-section container">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Explore Categories</span>
            <h2>Popular Student Categories</h2>
          </div>
          <Link to="/browse" className="section-link">View all 8 categories →</Link>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <Link key={cat.value} to={`/browse?category=${cat.value}`} className="category-card">
              <div className="category-icon-bubble">{cat.icon}</div>
              <div className="category-info">
                <h4 className="category-name">{cat.name}</h4>
                <p className="category-desc">{cat.desc}</p>
                <span className="category-count">{getCategoryCount(cat.value)} items listed</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FEATURED LISTINGS */}
      <section className="featured-section container">
        <div className="section-header">
          <div>
            <span className="section-eyebrow">Fresh Arrivals</span>
            <h2>Featured Campus Listings</h2>
          </div>
          <Link to="/browse" className="section-link">Browse all items →</Link>
        </div>

        {loadingListings ? (
          <div className="featured-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="card skeleton-card">
                <div className="skeleton" style={{ height: 180, width: '100%' }}></div>
                <div style={{ padding: 16 }}>
                  <div className="skeleton" style={{ height: 20, width: '70%', marginBottom: 10 }}></div>
                  <div className="skeleton" style={{ height: 16, width: '40%', marginBottom: 10 }}></div>
                  <div className="skeleton" style={{ height: 24, width: '50%' }}></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="featured-grid">
            {featuredListings.slice(0, 8).map(listing => (
              <div key={listing.id} className="listing-card card">
                <div className="listing-card-image">
                  {listing.images && listing.images.length > 0 ? (
                    <img src={listing.images[0]} alt={listing.title} />
                  ) : (
                    <div className="listing-no-image">
                      <span className="no-img-icon">
                        {CATEGORIES.find(c => c.value === listing.category)?.icon || '📦'}
                      </span>
                    </div>
                  )}
                  <span className={`chip chip-condition chip-${listing.itemCondition?.toLowerCase()?.replace('_', '-')}`}>
                    {listing.itemCondition?.replace('_', ' ')}
                  </span>
                  <button
                    className={`listing-fav-btn ${listing.isFavorited ? 'active' : ''}`}
                    onClick={(e) => toggleFavorite(listing, e)}
                    title={listing.isFavorited ? "Saved in favorites" : "Save item"}
                  >
                    {listing.isFavorited ? '❤️' : '🤍'}
                  </button>
                </div>

                <div className="card-body">
                  <div className="listing-top-row">
                    <span className="chip chip-category-small">
                      {CATEGORIES.find(c => c.value === listing.category)?.name || listing.category}
                    </span>
                    <span className="listing-location">📍 {listing.location || 'Campus'}</span>
                  </div>

                  <Link to={`/listing/${listing.id}`}>
                    <h3 className="listing-title" title={listing.title}>{listing.title}</h3>
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
                      {listing.seller?.emailVerified && <span className="verified-tick" title="College Email Verified">✓</span>}
                    </div>
                    <Link to={`/listing/${listing.id}`} className="btn btn-outline btn-xs">
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="how-it-works-section container">
        <div className="section-header center">
          <span className="section-eyebrow">Simple & Transparent</span>
          <h2>How Campus Marketplace Works</h2>
          <p className="section-subtext">Exchange items safely with students from your own university in four simple steps</p>
        </div>

        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">01</div>
            <div className="step-icon">🔐</div>
            <h3>Verify Account</h3>
            <p>Sign up with your official college email domain to access student-only listings.</p>
          </div>

          <div className="step-card">
            <div className="step-number">02</div>
            <div className="step-icon">📸</div>
            <h3>List in 60 Seconds</h3>
            <p>Snap a photo, choose condition & price, and post items directly to campus peers.</p>
          </div>

          <div className="step-card">
            <div className="step-number">03</div>
            <div className="step-icon">💬</div>
            <h3>Chat & Make Offers</h3>
            <p>Negotiate price via in-app chat and submit counter-offers with zero middlemen.</p>
          </div>

          <div className="step-card">
            <div className="step-number">04</div>
            <div className="step-icon">🤝</div>
            <h3>Safe Campus Meetup</h3>
            <p>Handover items at hostel blocks, central library, or cafeteria with mutual peace of mind.</p>
          </div>
        </div>
      </section>

      {/* 6. SAFETY & CAMPUS TRUST */}
      <section className="safety-section">
        <div className="container safety-container">
          <div className="safety-content">
            <span className="safety-eyebrow">Safe & Trusted</span>
            <h2>Built Exclusively For Campus Communities</h2>
            <p className="safety-lead">
              Unlike public classifieds where scammers roam, Campus Marketplace provides a closed-loop environment where every buyer and seller is a verified college student.
            </p>

            <div className="safety-features">
              <div className="safety-feature-item">
                <div className="safety-icon">🎓</div>
                <div>
                  <h4>College Email Verification</h4>
                  <p>Only students with active institution email addresses can list items and message sellers.</p>
                </div>
              </div>

              <div className="safety-feature-item">
                <div className="safety-icon">🛡️</div>
                <div>
                  <h4>Safe Campus Meetup Zones</h4>
                  <p>Exchange items conveniently in daylight at campus landmarks, hostels, or libraries.</p>
                </div>
              </div>

              <div className="safety-feature-item">
                <div className="safety-icon">⭐</div>
                <div>
                  <h4>Peer Ratings & Reviews</h4>
                  <p>Build campus credibility with transparent transaction feedback and star ratings.</p>
                </div>
              </div>

              <div className="safety-feature-item">
                <div className="safety-icon">🚨</div>
                <div>
                  <h4>One-Click Moderation</h4>
                  <p>Students can flag suspicious listings directly to campus admins for immediate removal.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="cta-banner container">
        <div className="cta-card">
          <div className="cta-content">
            <h2>Ready to clear your hostel room or save on textbooks?</h2>
            <p>Join hundreds of students buying, selling, and exchanging sustainably on campus.</p>
          </div>
          <div className="cta-buttons">
            <Link to="/browse" className="btn btn-lime btn-lg">🛍️ Start Browsing</Link>
            <Link to="/sell" className="btn btn-outline btn-lg" style={{ color: 'white', borderColor: 'rgba(255,255,255,0.4)' }}>
              ➕ Sell Something
            </Link>
          </div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="brand-icon">🏪</span>
              <span className="brand-text">Campus<span className="brand-highlight">Marketplace</span></span>
            </div>
            <p className="footer-about">
              A university marketplace enabling college students to buy, sell, and exchange pre-owned student essentials with trust and convenience.
            </p>
            <div className="footer-badge">Java Class Project • Spring Boot & React</div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/browse">Browse All Items</Link></li>
              <li><Link to="/sell">Sell an Item</Link></li>
              <li><Link to="/favorites">Saved Items ❤️</Link></li>
              <li><Link to="/chat">Student Chat 💬</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Top Categories</h4>
            <ul>
              <li><Link to="/browse?category=TEXTBOOKS">Textbooks & Notes</Link></li>
              <li><Link to="/browse?category=ELECTRONICS">Laptops & Tech</Link></li>
              <li><Link to="/browse?category=CALCULATORS">Scientific Calculators</Link></li>
              <li><Link to="/browse?category=BICYCLES">Campus Bicycles</Link></li>
              <li><Link to="/browse?category=FURNITURE">Hostel Furniture</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Safety & Support</h4>
            <ul>
              <li><a href="#safety">Campus Meetup Tips</a></li>
              <li><a href="#safety">Email Verification</a></li>
              <li><Link to="/browse">Report Suspicious Item</Link></li>
              <li><Link to="/login">Student Login</Link></li>
              <li><Link to="/admin">Admin Portal</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom container">
          <p>© 2026 CampusMarketplace. Built for college student communities.</p>
          <div className="footer-tags">
            <span>Verified Students Only</span> • <span>Zero Platform Commission</span> • <span>Peer Handover</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
