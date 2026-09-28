import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userAPI, listingAPI, ratingAPI, offerAPI, favoriteAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Profile.css';

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: authUser, updateUser } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [tab, setTab] = useState('overview');
  const [listingFilter, setListingFilter] = useState('ALL');

  const [myListings, setMyListings] = useState([]);
  const [sentOffers, setSentOffers] = useState([]);
  const [receivedOffers, setReceivedOffers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [ratings, setRatings] = useState([]);

  // Profile Edit State
  const [editForm, setEditForm] = useState({ fullName: '', department: '', year: '', studentId: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  // Counter Offer Modal State
  const [counterModalOffer, setCounterModalOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNote, setCounterNote] = useState('');

  // Delete Confirm Modal State
  const [deleteModalListing, setDeleteModalListing] = useState(null);

  const [loading, setLoading] = useState(true);

  const isOwnProfile = !id || (authUser && String(authUser.id) === String(id));

  useEffect(() => {
    loadDashboardData();
  }, [id, authUser?.id]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (isOwnProfile) {
        const res = await userAPI.getMe();
        setProfile(res.data);
        setEditForm({
          fullName: res.data.fullName || '',
          department: res.data.department || '',
          year: res.data.year || '',
          studentId: res.data.studentId || ''
        });

        // Load Listings
        const listingsRes = await listingAPI.getMy();
        if (listingsRes?.data) setMyListings(listingsRes.data);

        // Load Offers
        const sentRes = await offerAPI.getSent();
        if (sentRes?.data) setSentOffers(sentRes.data);

        const recRes = await offerAPI.getReceived();
        if (recRes?.data) setReceivedOffers(recRes.data);

        // Load Favorites
        const favRes = await favoriteAPI.getAll();
        if (favRes?.data) setFavorites(favRes.data);
      } else {
        const res = await userAPI.getProfile(id);
        setProfile(res.data);
      }

      const targetUserId = isOwnProfile ? authUser?.id : id;
      if (targetUserId) {
        const ratingsRes = await ratingAPI.getUserRatings(targetUserId);
        if (ratingsRes?.data) setRatings(ratingsRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await userAPI.updateMe(editForm);
      setProfile(res.data);
      updateUser(res.data);
      showToast('Profile updated successfully! ✅');
    } catch (err) {
      showToast('Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await userAPI.uploadProfileImage(file);
      setProfile(res.data);
      updateUser(res.data);
      showToast('Profile photo updated! 📷');
    } catch (err) {
      showToast('Failed to upload image', 'error');
    }
  };

  const handleListingStatusChange = async (listingId, newStatus) => {
    try {
      await listingAPI.updateStatus(listingId, newStatus, null);
      setMyListings(prev => prev.map(l => l.id === listingId ? { ...l, status: newStatus } : l));
      showToast(`Listing marked as ${newStatus}!`);
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleDeleteListing = async () => {
    if (!deleteModalListing) return;
    try {
      await listingAPI.delete(deleteModalListing.id);
      setMyListings(prev => prev.filter(l => l.id !== deleteModalListing.id));
      showToast('Listing removed successfully.');
      setDeleteModalListing(null);
    } catch (err) {
      showToast('Failed to delete listing', 'error');
    }
  };

  const handleOfferStatus = async (offerId, status) => {
    try {
      await offerAPI.updateStatus(offerId, { status });
      setReceivedOffers(prev => prev.map(o => o.id === offerId ? { ...o, status } : o));
      setSentOffers(prev => prev.map(o => o.id === offerId ? { ...o, status } : o));
      showToast(`Offer ${status.toLowerCase()}!`);
    } catch (err) {
      showToast('Failed to update offer', 'error');
    }
  };

  const handleCounterOffer = async (e) => {
    e.preventDefault();
    if (!counterModalOffer || !counterPrice || Number(counterPrice) <= 0) return;
    try {
      await offerAPI.counterOffer(counterModalOffer.id, {
        counterAmount: Number(counterPrice),
        message: counterNote
      });
      setReceivedOffers(prev => prev.map(o => o.id === counterModalOffer.id ? { ...o, status: 'COUNTERED', counterAmount: Number(counterPrice) } : o));
      showToast(`Counter offer of ₹${counterPrice} sent to buyer!`);
      setCounterModalOffer(null);
      setCounterPrice('');
      setCounterNote('');
    } catch (err) {
      showToast('Failed to submit counter offer', 'error');
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper profile-page">
        <div className="container">
          <div className="skeleton" style={{ height: 260, borderRadius: 16, marginBottom: 24 }}></div>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }}></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const filteredMyListings = myListings.filter(l => {
    if (listingFilter === 'ALL') return true;
    return l.status === listingFilter;
  });

  const activeCount = myListings.filter(l => l.status === 'ACTIVE').length;
  const soldCount = myListings.filter(l => l.status === 'SOLD').length;

  return (
    <div className="page-wrapper profile-page">
      <div className="container">
        {/* Profile Hero Header */}
        <div className="profile-hero-card">
          <div className="profile-hero-content">
            <div className="profile-avatar-box">
              {profile.profileImage ? (
                <img src={`/uploads/${profile.profileImage}`} alt="" />
              ) : (
                <span>{profile.fullName?.charAt(0) || 'S'}</span>
              )}
              {isOwnProfile && (
                <label className="change-photo-badge" title="Change photo">
                  📷
                  <input type="file" accept="image/*" onChange={handleUploadImage} hidden />
                </label>
              )}
            </div>

            <div className="profile-details-main">
              <div className="profile-name-row">
                <h1>{profile.fullName}</h1>
                {profile.emailVerified && (
                  <span className="verified-student-badge">✓ College Email Verified</span>
                )}
                {profile.role === 'ADMIN' && (
                  <span className="chip chip-admin">Administrator</span>
                )}
              </div>

              <p className="profile-branch-text">
                🎓 {profile.department || 'Engineering'} • {profile.year || 'Student'} • ID: {profile.studentId || 'Verified'}
              </p>

              <div className="profile-stats-bar">
                <div className="profile-stat-item">
                  <span className="stat-val">{profile.rating > 0 ? `★ ${profile.rating.toFixed(1)}` : 'New'}</span>
                  <span className="stat-lbl">Rating ({profile.ratingCount || ratings.length})</span>
                </div>
                <div className="profile-stat-item">
                  <span className="stat-val">{myListings.length || profile.listingCount || 0}</span>
                  <span className="stat-lbl">Listings</span>
                </div>
                <div className="profile-stat-item">
                  <span className="stat-val">{soldCount || profile.soldCount || 0}</span>
                  <span className="stat-lbl">Sold</span>
                </div>
                <div className="profile-stat-item">
                  <span className="stat-val">{new Date(profile.createdAt || Date.now()).getFullYear()}</span>
                  <span className="stat-lbl">Member Since</span>
                </div>
              </div>
            </div>

            {isOwnProfile && (
              <div className="profile-hero-actions">
                <Link to="/sell" className="btn btn-lime">
                  ➕ Post New Item
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        {isOwnProfile ? (
          <div className="dashboard-tabs-bar">
            <button className={`dash-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}>
              📊 Overview
            </button>
            <button className={`dash-tab ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>
              🏷️ My Listings ({myListings.length})
            </button>
            <button className={`dash-tab ${tab === 'offers' ? 'active' : ''}`} onClick={() => setTab('offers')}>
              🤝 Offers & Bids ({receivedOffers.length + sentOffers.length})
            </button>
            <button className={`dash-tab ${tab === 'favorites' ? 'active' : ''}`} onClick={() => setTab('favorites')}>
              ❤️ Wishlist ({favorites.length})
            </button>
            <button className={`dash-tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
              ⭐ Peer Reviews ({ratings.length})
            </button>
            <button className={`dash-tab ${tab === 'settings' ? 'active' : ''}`} onClick={() => setTab('settings')}>
              ⚙️ Profile Settings
            </button>
          </div>
        ) : (
          <div className="dashboard-tabs-bar">
            <button className={`dash-tab ${tab === 'listings' ? 'active' : ''}`} onClick={() => setTab('listings')}>
              Listings by {profile.fullName}
            </button>
            <button className={`dash-tab ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
              ⭐ Student Reviews ({ratings.length})
            </button>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && isOwnProfile && (
          <div className="tab-content overview-tab">
            <div className="stats-grid" style={{ marginBottom: 32 }}>
              <div className="stat-card">
                <div className="stat-icon-wrapper blue">🏷️</div>
                <div className="stat-number">{activeCount}</div>
                <div className="stat-label">Active Listings</div>
                <div className="stat-subtext">Currently live on campus</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper lime">🤝</div>
                <div className="stat-number">{receivedOffers.filter(o => o.status === 'PENDING').length}</div>
                <div className="stat-label">Pending Offers</div>
                <div className="stat-subtext">Awaiting your response</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper orange">❤️</div>
                <div className="stat-number">{favorites.length}</div>
                <div className="stat-label">Saved Items</div>
                <div className="stat-subtext">In your wishlist</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon-wrapper green">✅</div>
                <div className="stat-number">{soldCount}</div>
                <div className="stat-label">Completed Deals</div>
                <div className="stat-subtext">Successfully handed over</div>
              </div>
            </div>

            {/* Recent Activity / Quick Actions */}
            <div className="overview-two-col">
              {/* Recent Listings */}
              <div className="dash-box card">
                <div className="dash-box-header">
                  <h3>Recent Listings</h3>
                  <button className="btn btn-ghost btn-xs" onClick={() => setTab('listings')}>View All →</button>
                </div>
                {myListings.length === 0 ? (
                  <div className="empty-box-msg">
                    <p>You haven't listed any items yet.</p>
                    <Link to="/sell" className="btn btn-primary btn-sm">➕ Post Item</Link>
                  </div>
                ) : (
                  <div className="dash-item-list">
                    {myListings.slice(0, 4).map(l => (
                      <div key={l.id} className="dash-item-row">
                        <div>
                          <strong>{l.title}</strong>
                          <div className="dash-item-meta">₹{l.price?.toLocaleString('en-IN')} • {l.location}</div>
                        </div>
                        <span className={`chip chip-${l.status?.toLowerCase()}`}>{l.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pending Received Offers */}
              <div className="dash-box card">
                <div className="dash-box-header">
                  <h3>Recent Offers Received</h3>
                  <button className="btn btn-ghost btn-xs" onClick={() => setTab('offers')}>Manage Offers →</button>
                </div>
                {receivedOffers.length === 0 ? (
                  <div className="empty-box-msg">
                    <p>No offers received yet.</p>
                  </div>
                ) : (
                  <div className="dash-item-list">
                    {receivedOffers.slice(0, 4).map(o => (
                      <div key={o.id} className="dash-item-row">
                        <div>
                          <strong>₹{o.offerAmount?.toLocaleString('en-IN')}</strong> from {o.buyerName}
                          <div className="dash-item-meta">For: {o.listingTitle}</div>
                        </div>
                        <span className={`chip chip-${o.status?.toLowerCase()}`}>{o.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MY LISTINGS */}
        {tab === 'listings' && (
          <div className="tab-content listings-tab">
            <div className="listings-filter-bar">
              <button
                className={`filter-btn ${listingFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setListingFilter('ALL')}
              >
                All ({myListings.length})
              </button>
              <button
                className={`filter-btn ${listingFilter === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setListingFilter('ACTIVE')}
              >
                Active ({activeCount})
              </button>
              <button
                className={`filter-btn ${listingFilter === 'RESERVED' ? 'active' : ''}`}
                onClick={() => setListingFilter('RESERVED')}
              >
                Reserved ({myListings.filter(l => l.status === 'RESERVED').length})
              </button>
              <button
                className={`filter-btn ${listingFilter === 'SOLD' ? 'active' : ''}`}
                onClick={() => setListingFilter('SOLD')}
              >
                Sold ({soldCount})
              </button>
            </div>

            {filteredMyListings.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-icon">🏷️</div>
                <h3>No {listingFilter.toLowerCase()} listings</h3>
                <p>Post items you no longer use so other students can buy or exchange them.</p>
                {isOwnProfile && (
                  <Link to="/sell" className="btn btn-lime btn-lg">➕ Post an Item</Link>
                )}
              </div>
            ) : (
              <div className="listings-grid">
                {filteredMyListings.map(l => (
                  <div key={l.id} className="listing-card card">
                    <Link to={`/listing/${l.id}`} className="listing-card-image">
                      {l.images && l.images.length > 0 ? (
                        <img src={l.images[0]} alt="" />
                      ) : (
                        <div className="listing-no-image"><span>📦</span></div>
                      )}
                      <span className={`chip chip-${l.status?.toLowerCase()}`} style={{ position: 'absolute', top: 10, left: 10 }}>
                        {l.status}
                      </span>
                    </Link>

                    <div className="card-body">
                      <span className="chip chip-category-small">{l.category?.replace('_', ' ')}</span>
                      <Link to={`/listing/${l.id}`}>
                        <h4 className="listing-title">{l.title}</h4>
                      </Link>
                      <div className="price">₹{l.price?.toLocaleString('en-IN')}</div>

                      {isOwnProfile && (
                        <div className="my-listing-controls">
                          <Link to={`/edit-listing/${l.id}`} className="btn btn-outline btn-xs">
                            ✏️ Edit
                          </Link>
                          {l.status === 'ACTIVE' && (
                            <button
                              className="btn btn-secondary btn-xs"
                              onClick={() => handleListingStatusChange(l.id, 'SOLD')}
                            >
                              ✓ Mark Sold
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-xs"
                            style={{ color: 'var(--error)' }}
                            onClick={() => setDeleteModalListing(l)}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: OFFERS & BIDS */}
        {tab === 'offers' && isOwnProfile && (
          <div className="tab-content offers-tab">
            <div className="offers-sections-grid">
              {/* Received Offers */}
              <div className="dash-box card">
                <div className="dash-box-header">
                  <h3>📥 Offers Received on My Items ({receivedOffers.length})</h3>
                </div>
                {receivedOffers.length === 0 ? (
                  <div className="empty-box-msg"><p>No offers received yet.</p></div>
                ) : (
                  <div className="offers-table">
                    {receivedOffers.map(o => (
                      <div key={o.id} className="offer-row-card">
                        <div className="offer-main-info">
                          <div className="offer-item-name">{o.listingTitle}</div>
                          <div className="offer-amounts-row">
                            <span className="offer-amount-tag">Offered: ₹{o.offerAmount?.toLocaleString('en-IN')}</span>
                            {o.counterAmount && <span className="counter-amount-tag">Counter: ₹{o.counterAmount}</span>}
                            <span className="offer-buyer-tag">From: {o.buyerName}</span>
                          </div>
                          {o.message && <p className="offer-msg-quote">"{o.message}"</p>}
                        </div>

                        <div className="offer-actions-col">
                          <span className={`chip chip-${o.status?.toLowerCase()}`}>{o.status}</span>
                          {o.status === 'PENDING' && (
                            <div className="offer-btn-group">
                              <button
                                className="btn btn-primary btn-xs"
                                onClick={() => handleOfferStatus(o.id, 'ACCEPTED')}
                              >
                                Accept
                              </button>
                              <button
                                className="btn btn-outline btn-xs"
                                onClick={() => {
                                  setCounterModalOffer(o);
                                  setCounterPrice(Math.round(o.offerAmount * 1.1));
                                }}
                              >
                                Counter
                              </button>
                              <button
                                className="btn btn-ghost btn-xs"
                                onClick={() => handleOfferStatus(o.id, 'REJECTED')}
                              >
                                Decline
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sent Offers */}
              <div className="dash-box card">
                <div className="dash-box-header">
                  <h3>📤 Offers I've Sent to Sellers ({sentOffers.length})</h3>
                </div>
                {sentOffers.length === 0 ? (
                  <div className="empty-box-msg"><p>You haven't made any offers yet.</p></div>
                ) : (
                  <div className="offers-table">
                    {sentOffers.map(o => (
                      <div key={o.id} className="offer-row-card">
                        <div className="offer-main-info">
                          <Link to={`/listing/${o.listingId}`} className="offer-item-name">{o.listingTitle}</Link>
                          <div className="offer-amounts-row">
                            <span className="offer-amount-tag">My Offer: ₹{o.offerAmount?.toLocaleString('en-IN')}</span>
                            {o.counterAmount && (
                              <span className="counter-amount-tag">Seller Countered: ₹{o.counterAmount}</span>
                            )}
                            <span className="offer-buyer-tag">Seller: {o.sellerName}</span>
                          </div>
                        </div>

                        <div className="offer-actions-col">
                          <span className={`chip chip-${o.status?.toLowerCase()}`}>{o.status}</span>
                          {o.status === 'PENDING' && (
                            <button
                              className="btn btn-ghost btn-xs"
                              style={{ color: 'var(--error)' }}
                              onClick={() => handleOfferStatus(o.id, 'CANCELLED')}
                            >
                              Cancel Bid
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SAVED WISHLIST */}
        {tab === 'favorites' && isOwnProfile && (
          <div className="tab-content favorites-tab">
            {favorites.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-icon">🤍</div>
                <h3>No saved items yet</h3>
                <p>Click the heart icon on any listing to bookmark it here.</p>
                <Link to="/browse" className="btn btn-primary">🛍️ Browse Items</Link>
              </div>
            ) : (
              <div className="listings-grid">
                {favorites.map(l => (
                  <div key={l.id} className="listing-card card">
                    <Link to={`/listing/${l.id}`} className="listing-card-image">
                      {l.images && l.images.length > 0 ? (
                        <img src={l.images[0]} alt="" />
                      ) : (
                        <div className="listing-no-image"><span>📦</span></div>
                      )}
                    </Link>
                    <div className="card-body">
                      <h4 className="listing-title">{l.title}</h4>
                      <div className="price">₹{l.price?.toLocaleString('en-IN')}</div>
                      <Link to={`/listing/${l.id}`} className="btn btn-outline btn-xs" style={{ marginTop: 8 }}>
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PEER REVIEWS */}
        {tab === 'reviews' && (
          <div className="tab-content reviews-tab">
            <div className="reviews-summary-card card" style={{ marginBottom: 24 }}>
              <div className="card-body">
                <div className="rating-big-score">
                  <span className="big-stars">★ {profile.rating > 0 ? profile.rating.toFixed(1) : '5.0'}</span>
                  <span className="rating-count-txt">Based on {ratings.length || profile.ratingCount || 1} completed campus transactions</span>
                </div>
              </div>
            </div>

            {ratings.length === 0 ? (
              <div className="empty-state-card">
                <div className="empty-state-icon">⭐</div>
                <h3>No reviews yet</h3>
                <p>Ratings and feedback appear here after buyers and sellers complete verified transactions.</p>
              </div>
            ) : (
              <div className="ratings-list">
                {ratings.map(r => (
                  <div key={r.id} className="rating-item card">
                    <div className="card-body">
                      <div className="rating-header">
                        <strong>{r.reviewerName || 'Student Peer'}</strong>
                        <span className="stars">{'★'.repeat(r.rating || 5)}{'☆'.repeat(5 - (r.rating || 5))}</span>
                      </div>
                      <div className="rating-listing">Verified Deal for: <em>{r.listingTitle || 'Item'}</em></div>
                      {r.review && <p className="rating-text">"{r.review}"</p>}
                      <div className="rating-date">
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-IN') : 'Recent'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: PROFILE SETTINGS */}
        {tab === 'settings' && isOwnProfile && (
          <div className="tab-content settings-tab">
            <div className="card" style={{ maxWidth: 640 }}>
              <div className="card-body">
                <h3>Edit Profile Information</h3>
                <form onSubmit={handleSaveProfile} style={{ marginTop: 18 }}>
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      value={editForm.fullName}
                      onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department / Branch</label>
                    <input
                      className="form-input"
                      value={editForm.department}
                      placeholder="e.g. Computer Science, Mechanical"
                      onChange={e => setEditForm({ ...editForm, department: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">College Year</label>
                    <select
                      className="form-input form-select"
                      value={editForm.year}
                      onChange={e => setEditForm({ ...editForm, year: e.target.value })}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="Postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Student Roll Number / ID</label>
                    <input
                      className="form-input"
                      value={editForm.studentId}
                      placeholder="e.g. CS2022001"
                      onChange={e => setEditForm({ ...editForm, studentId: e.target.value })}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                    {savingProfile ? 'Saving...' : '💾 Save Profile'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Counter Offer Modal */}
        {counterModalOffer && (
          <div className="modal-overlay" onClick={() => setCounterModalOffer(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <div className="modal-header">
                <h3>Counter Offer to {counterModalOffer.buyerName}</h3>
                <button className="modal-close" onClick={() => setCounterModalOffer(null)}>✕</button>
              </div>
              <form onSubmit={handleCounterOffer}>
                <div className="modal-body">
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 14 }}>
                    Buyer offered: <strong>₹{counterModalOffer.offerAmount}</strong>
                  </p>
                  <div className="form-group">
                    <label className="form-label">Your Counter Price (₹)</label>
                    <div className="offer-input-wrapper">
                      <span className="rupee-symbol">₹</span>
                      <input
                        type="number"
                        className="form-input offer-num-input"
                        value={counterPrice}
                        onChange={e => setCounterPrice(e.target.value)}
                        required
                        min="1"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Note</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Best I can do is ₹..."
                      value={counterNote}
                      onChange={e => setCounterNote(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setCounterModalOffer(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-lime">
                    Send Counter Offer 🤝
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModalListing && (
          <div className="modal-overlay" onClick={() => setDeleteModalListing(null)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
              <div className="modal-header">
                <h3>Delete Listing?</h3>
                <button className="modal-close" onClick={() => setDeleteModalListing(null)}>✕</button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to permanently delete <strong>"{deleteModalListing.title}"</strong>?</p>
                <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: 8 }}>This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setDeleteModalListing(null)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDeleteListing}>Delete Listing</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
