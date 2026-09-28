import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingAPI, favoriteAPI, messageAPI, reportAPI, offerAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ListingDetail.css';

const CATEGORIES = [
  { label: 'Textbooks', value: 'TEXTBOOKS', icon: '📚' },
  { label: 'Electronics', value: 'ELECTRONICS', icon: '💻' },
  { label: 'Furniture', value: 'FURNITURE', icon: '🪑' },
  { label: 'Bicycles', value: 'BICYCLES', icon: '🚲' },
  { label: 'Calculators', value: 'CALCULATORS', icon: '🔢' },
  { label: 'Hostel Essentials', value: 'HOSTEL_ESSENTIALS', icon: '🏠' },
  { label: 'Lab Records', value: 'LAB_RECORDS', icon: '🧪' },
  { label: 'Other', value: 'OTHER', icon: '📦' },
];

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Message Modal State
  const [showMessage, setShowMessage] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Make Offer Modal State
  const [showOffer, setShowOffer] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  // Report Modal State
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDesc, setReportDesc] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    listingAPI.getById(id)
      .then(res => {
        if (res?.data) {
          setListing(res.data);
          // Pre-populate offer amount with 10% lower suggestion
          if (res.data.price) {
            setOfferAmount(Math.round(res.data.price * 0.9));
          }
        }
      })
      .catch(() => {
        showToast('Listing not found', 'error');
        navigate('/browse');
      })
      .finally(() => setLoading(false));

    // Fetch similar items
    listingAPI.getSimilar(id)
      .then(res => {
        if (res?.data) setSimilarListings(res.data);
      })
      .catch(() => {});
  }, [id]);

  const toggleFavorite = async () => {
    if (!isAuthenticated) return showToast('Please login to save this item', 'error');
    try {
      if (listing.isFavorited) {
        await favoriteAPI.remove(listing.id);
        setListing(prev => ({ ...prev, isFavorited: false, favoriteCount: Math.max(0, (prev.favoriteCount || 1) - 1) }));
        window.dispatchEvent(new CustomEvent('app:badge-refresh'));
        showToast('Removed from saved items');
      } else {
        await favoriteAPI.add(listing.id);
        setListing(prev => ({ ...prev, isFavorited: true, favoriteCount: (prev.favoriteCount || 0) + 1 }));
        window.dispatchEvent(new CustomEvent('app:badge-refresh'));
        showToast('Item saved to your wishlist ❤️');
      }
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return showToast('Please enter a message', 'error');
    setSendingMessage(true);
    try {
      await messageAPI.send({
        recipientId: listing.seller.id,
        listingId: listing.id,
        content: messageText
      });
      window.dispatchEvent(new CustomEvent('app:badge-refresh'));
      showToast('Message sent to seller! 💬');
      setShowMessage(false);
      setMessageText('');
      navigate('/chat');
    } catch (err) {
      showToast('Error sending message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    const amount = Number(offerAmount);
    if (!amount || amount <= 0) return showToast('Please enter a valid offer price', 'error');
    if (amount > listing.price * 2) return showToast('Offer cannot exceed twice the listing price', 'error');

    setSubmittingOffer(true);
    try {
      await offerAPI.create({
        listingId: listing.id,
        offerAmount: amount,
        message: offerNote || `I would like to offer ₹${amount.toLocaleString('en-IN')} for this item.`
      });
      showToast(`Offer of ₹${amount.toLocaleString('en-IN')} submitted successfully! 🎉`);
      setShowOffer(false);
      setOfferNote('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Error submitting offer', 'error');
    } finally {
      setSubmittingOffer(false);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!reportReason) return showToast('Please select a reason', 'error');
    setSubmittingReport(true);
    try {
      await reportAPI.create({
        listingId: listing.id,
        reason: reportReason,
        description: reportDesc
      });
      showToast('Report submitted for admin review. Thank you for keeping campus safe.');
      setShowReport(false);
      setReportDesc('');
    } catch (err) {
      showToast('Error submitting report', 'error');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper detail-page">
        <div className="container">
          <div className="detail-layout">
            <div className="skeleton" style={{ height: 420, borderRadius: 16 }}></div>
            <div>
              <div className="skeleton" style={{ height: 32, width: '70%', marginBottom: 16 }}></div>
              <div className="skeleton" style={{ height: 40, width: '40%', marginBottom: 24 }}></div>
              <div className="skeleton" style={{ height: 120, width: '100%', marginBottom: 24 }}></div>
              <div className="skeleton" style={{ height: 50, width: '100%' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const isOwner = user && (user.id === listing.seller?.id || user.email === listing.seller?.email);
  const isSold = listing.status === 'SOLD';
  const condLabel = listing.itemCondition?.replace('_', ' ');
  const categoryInfo = CATEGORIES.find(c => c.value === listing.category);

  const discountPercent = listing.price && offerAmount ? Math.round(((listing.price - offerAmount) / listing.price) * 100) : 0;

  return (
    <div className="page-wrapper detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <div className="breadcrumbs">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/browse">Browse</Link>
          <span>/</span>
          <Link to={`/browse?category=${listing.category}`}>{categoryInfo?.label || listing.category}</Link>
          <span>/</span>
          <span className="current-crumb">{listing.title}</span>
        </div>

        <div className="detail-layout">
          {/* Gallery Column */}
          <div className="detail-gallery-column">
            <div className="detail-main-image-card">
              {listing.images && listing.images.length > 0 ? (
                <img src={listing.images[activeImage]} alt={listing.title} className="main-item-img" />
              ) : (
                <div className="detail-no-image">
                  <span className="big-icon">{categoryInfo?.icon || '📦'}</span>
                  <p>Photo not uploaded</p>
                </div>
              )}
              {isSold && <div className="sold-overlay-tag">ITEM SOLD</div>}
              {listing.status === 'RESERVED' && <div className="reserved-overlay-tag">RESERVED</div>}
            </div>

            {listing.images && listing.images.length > 1 && (
              <div className="detail-thumbnails-row">
                {listing.images.map((img, idx) => (
                  <button
                    key={idx}
                    className={`thumb-btn ${idx === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(idx)}
                  >
                    <img src={img} alt="" />
                  </button>
                ))}
              </div>
            )}

            {/* Safety Tips Card */}
            <div className="campus-safety-box">
              <h4>🛡️ Campus Safety Checklist</h4>
              <ul>
                <li>✓ Inspect the item condition in person before paying.</li>
                <li>✓ Meet during daylight in public campus spots (Library, Cafeteria, Main Gate).</li>
                <li>✓ Use UPI or cash upon mutual agreement.</li>
              </ul>
            </div>
          </div>

          {/* Info & Action Column */}
          <div className="detail-info-column">
            {/* Category & Badges */}
            <div className="detail-badges-row">
              <span className="chip chip-category-lg">
                {categoryInfo?.icon} {categoryInfo?.label || listing.category}
              </span>
              <span className={`chip chip-condition chip-${listing.itemCondition?.toLowerCase()?.replace('_', '-')}`}>
                {condLabel}
              </span>
              <span className={`chip chip-${listing.status?.toLowerCase()}`}>
                {listing.status}
              </span>
            </div>

            <h1 className="detail-title">{listing.title}</h1>

            <div className="detail-price-box">
              <div className="price-tag-wrap">
                <span className="price-currency">₹</span>
                <span className="price-amount">{listing.price?.toLocaleString('en-IN')}</span>
              </div>
              <span className="price-subtext">Fixed student price (or submit offer)</span>
            </div>

            {/* Quick Meta Specs */}
            <div className="detail-meta-grid">
              <div className="meta-spec-card">
                <span className="meta-icon">📍</span>
                <div>
                  <div className="meta-label">Campus Location</div>
                  <div className="meta-value">{listing.location || 'Campus Center'}</div>
                </div>
              </div>
              <div className="meta-spec-card">
                <span className="meta-icon">📅</span>
                <div>
                  <div className="meta-label">Listed On</div>
                  <div className="meta-value">
                    {new Date(listing.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
              <div className="meta-spec-card">
                <span className="meta-icon">❤️</span>
                <div>
                  <div className="meta-label">Wishlist Saves</div>
                  <div className="meta-value">{listing.favoriteCount || 0} students</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="detail-desc-card">
              <h3>Item Description</h3>
              <p className="detail-desc-text">{listing.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="detail-cta-bar">
              {!isOwner && !isSold && isAuthenticated && (
                <>
                  <button className="btn btn-primary btn-lg flex-1" onClick={() => setShowMessage(true)}>
                    💬 Message Seller
                  </button>
                  <button className="btn btn-lime btn-lg flex-1" onClick={() => setShowOffer(true)}>
                    🏷️ Make Offer
                  </button>
                </>
              )}

              {!isAuthenticated && (
                <Link to="/login" className="btn btn-primary btn-lg flex-1">
                  🔐 Login to Contact Seller
                </Link>
              )}

              {isAuthenticated && (
                <button
                  className={`btn ${listing.isFavorited ? 'btn-primary' : 'btn-outline'} btn-lg`}
                  onClick={toggleFavorite}
                  title="Save item"
                >
                  {listing.isFavorited ? '❤️ Saved' : '🤍 Save'}
                </button>
              )}

              {isOwner && (
                <div className="owner-actions-row">
                  <Link to={`/edit-listing/${listing.id}`} className="btn btn-outline btn-lg">
                    ✏️ Edit Listing
                  </Link>
                  {listing.status === 'ACTIVE' && (
                    <button
                      className="btn btn-secondary btn-lg"
                      onClick={async () => {
                        await listingAPI.updateStatus(listing.id, 'SOLD', null);
                        showToast('Listing marked as SOLD 🎉');
                        setListing({ ...listing, status: 'SOLD' });
                      }}
                    >
                      ✓ Mark as Sold
                    </button>
                  )}
                </div>
              )}

              {!isOwner && isAuthenticated && (
                <button className="btn btn-ghost btn-sm report-link" onClick={() => setShowReport(true)}>
                  ⚠️ Report Listing
                </button>
              )}
            </div>

            {/* Seller Information Card */}
            <div className="seller-profile-card">
              <div className="seller-card-header">
                <div className="seller-avatar-large">
                  {listing.seller?.profileImage ? (
                    <img src={`/uploads/${listing.seller.profileImage}`} alt="" />
                  ) : (
                    <span>{listing.seller?.fullName?.charAt(0) || 'S'}</span>
                  )}
                </div>
                <div className="seller-details-wrap">
                  <div className="seller-name-row">
                    <Link to={`/profile/${listing.seller?.id}`} className="seller-fullname">
                      {listing.seller?.fullName}
                    </Link>
                    {listing.seller?.emailVerified && (
                      <span className="verified-student-badge">
                        ✓ College Verified
                      </span>
                    )}
                  </div>
                  <div className="seller-department">
                    {listing.seller?.department || 'Engineering'} • {listing.seller?.year || 'Student'}
                  </div>
                  <div className="seller-ratings-bar">
                    {listing.seller?.rating > 0 ? (
                      <span className="stars-txt">★ {listing.seller.rating.toFixed(1)} Rating ({listing.seller.ratingCount || 1} reviews)</span>
                    ) : (
                      <span className="new-seller-txt">New Student Seller</span>
                    )}
                    <span className="sold-count-txt">• {listing.seller?.soldCount || 0} items sold</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Items Section */}
        {similarListings.length > 0 && (
          <div className="similar-items-section">
            <div className="section-header">
              <div>
                <span className="section-eyebrow">Recommendations</span>
                <h2>Similar Items on Campus</h2>
              </div>
              <Link to={`/browse?category=${listing.category}`} className="section-link">
                View more {categoryInfo?.label} →
              </Link>
            </div>

            <div className="similar-grid">
              {similarListings.map(item => (
                <div key={item.id} className="listing-card card">
                  <Link to={`/listing/${item.id}`} className="listing-card-image">
                    {item.images && item.images.length > 0 ? (
                      <img src={item.images[0]} alt={item.title} />
                    ) : (
                      <div className="listing-no-image">
                        <span>{categoryInfo?.icon || '📦'}</span>
                      </div>
                    )}
                    <span className="chip chip-condition">{item.itemCondition?.replace('_', ' ')}</span>
                  </Link>
                  <div className="card-body">
                    <Link to={`/listing/${item.id}`}>
                      <h4 className="listing-title">{item.title}</h4>
                    </Link>
                    <div className="listing-price-row">
                      <div className="price">₹{item.price?.toLocaleString('en-IN')}</div>
                      <span className="listing-location">📍 {item.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 1. MESSAGE SELLER MODAL */}
        {showMessage && (
          <div className="modal-overlay" onClick={() => setShowMessage(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Message {listing.seller?.fullName}</h3>
                <button className="modal-close" onClick={() => setShowMessage(false)}>✕</button>
              </div>
              <form onSubmit={handleSendMessage}>
                <div className="modal-body">
                  <div className="modal-item-preview">
                    <span className="preview-icon">{categoryInfo?.icon}</span>
                    <div>
                      <strong>{listing.title}</strong>
                      <div>₹{listing.price?.toLocaleString('en-IN')} • {listing.location}</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Message</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Hi! Is this item still available? Can we meet near the library today?"
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowMessage(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={sendingMessage}>
                    {sendingMessage ? 'Sending...' : 'Send Message 💬'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. MAKE OFFER MODAL */}
        {showOffer && (
          <div className="modal-overlay" onClick={() => setShowOffer(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Make an Offer</h3>
                <button className="modal-close" onClick={() => setShowOffer(false)}>✕</button>
              </div>
              <form onSubmit={handleMakeOffer}>
                <div className="modal-body">
                  <div className="modal-item-preview">
                    <span className="preview-icon">🏷️</span>
                    <div>
                      <strong>{listing.title}</strong>
                      <div>Original Listed Price: <strong>₹{listing.price?.toLocaleString('en-IN')}</strong></div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Your Offer Amount (₹)</label>
                    <div className="offer-input-wrapper">
                      <span className="rupee-symbol">₹</span>
                      <input
                        type="number"
                        className="form-input offer-num-input"
                        placeholder="e.g. 800"
                        value={offerAmount}
                        onChange={e => setOfferAmount(e.target.value)}
                        min="1"
                        max={listing.price * 2}
                        required
                      />
                    </div>
                    {discountPercent !== 0 && (
                      <div className={`offer-discount-note ${discountPercent > 0 ? 'discount' : 'higher'}`}>
                        {discountPercent > 0 ? `🔥 You are offering ${discountPercent}% below listed price` : `📈 Offering ₹${Math.abs(listing.price - offerAmount)} more`}
                      </div>
                    )}
                  </div>

                  {/* Quick price presets */}
                  <div className="quick-offer-pills">
                    <button type="button" onClick={() => setOfferAmount(Math.round(listing.price * 0.9))}>
                      -10% (₹{Math.round(listing.price * 0.9)})
                    </button>
                    <button type="button" onClick={() => setOfferAmount(Math.round(listing.price * 0.8))}>
                      -20% (₹{Math.round(listing.price * 0.8)})
                    </button>
                    <button type="button" onClick={() => setOfferAmount(Math.round(listing.price * 0.75))}>
                      -25% (₹{Math.round(listing.price * 0.75)})
                    </button>
                  </div>

                  <div className="form-group" style={{ marginTop: 16 }}>
                    <label className="form-label">Optional Note to Seller</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="e.g. I can pick it up today at the Main Gate with immediate cash/UPI payment."
                      value={offerNote}
                      onChange={e => setOfferNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowOffer(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-lime" disabled={submittingOffer}>
                    {submittingOffer ? 'Submitting...' : 'Submit Offer 🏷️'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 3. REPORT LISTING MODAL */}
        {showReport && (
          <div className="modal-overlay" onClick={() => setShowReport(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Report Listing</h3>
                <button className="modal-close" onClick={() => setShowReport(false)}>✕</button>
              </div>
              <form onSubmit={handleReport}>
                <div className="modal-body">
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                    Reports are confidential and reviewed directly by campus marketplace administrators.
                  </p>
                  <div className="form-group">
                    <label className="form-label">Reason for Report</label>
                    <select
                      className="form-input form-select"
                      value={reportReason}
                      onChange={e => setReportReason(e.target.value)}
                      required
                    >
                      <option value="">Select a violation reason</option>
                      <option value="SCAM_OR_SUSPICIOUS">🚨 Scam or suspicious activity</option>
                      <option value="WRONG_INFORMATION">❌ Incorrect details or misleading photo</option>
                      <option value="PROHIBITED_ITEM">⛔ Prohibited or illegal campus item</option>
                      <option value="DUPLICATE_LISTING">📋 Duplicate listing</option>
                      <option value="INAPPROPRIATE_CONTENT">⚠️ Inappropriate content</option>
                      <option value="OTHER">Other concern</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Additional Description</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Please explain why you are reporting this listing..."
                      value={reportDesc}
                      onChange={e => setReportDesc(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowReport(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-danger" disabled={submittingReport}>
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
