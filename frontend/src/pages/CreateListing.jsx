import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listingAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './CreateListing.css';

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

const CONDITIONS = [
  { label: 'Brand New (Unopened / Tagged)', value: 'NEW' },
  { label: 'Like New (Mint condition, lightly used)', value: 'LIKE_NEW' },
  { label: 'Good (Minor cosmetic wear, fully working)', value: 'GOOD' },
  { label: 'Fair (Noticeable wear, functions properly)', value: 'FAIR' },
  { label: 'Used / Functional', value: 'USED' },
];

const POPULAR_LOCATIONS = [
  'Central Library Gate',
  'Main Academic Block',
  'Hostel Block A',
  'Hostel Block B',
  'Hostel Block C',
  'Hostel Block D',
  'Girls Hostel 1',
  'Girls Hostel 2',
  'Campus Cafeteria',
  'Main Sports Complex',
  'Robotics / Tech Lab',
  'Main Campus Gate',
];

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TEXTBOOKS',
    price: '',
    itemCondition: 'LIKE_NEW',
    location: 'Central Library Gate',
    contactPreference: 'IN_APP_CHAT'
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      showToast('Maximum 5 images allowed', 'error');
      return;
    }
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.title.trim()) return showToast('Please enter an item title', 'error');
    if (!form.description.trim()) return showToast('Please provide a description', 'error');
    if (!form.price || Number(form.price) <= 0) return showToast('Please enter a valid price in ₹', 'error');

    setLoading(true);
    try {
      const data = { ...form, price: parseFloat(form.price) };
      const res = await listingAPI.create(data, images);
      showToast('Listing published successfully! 🎉');
      if (res?.data?.id) {
        navigate(`/listing/${res.data.id}`);
      } else {
        navigate('/browse');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create listing', 'error');
    } finally {
      setLoading(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const selectedCategory = CATEGORIES.find(c => c.value === form.category);

  return (
    <div className="page-wrapper create-page">
      <div className="container" style={{ maxWidth: 840 }}>
        {/* Header */}
        <div className="create-header">
          <span className="create-eyebrow">Sell to Campus Peers</span>
          <h1>List an Item on Marketplace</h1>
          <p className="create-subtitle">Reach verified students across campus without paying any listing fees.</p>
        </div>

        <div className="create-layout">
          <form onSubmit={handleSubmit} className="create-form card">
            <div className="card-body">
              {/* Title */}
              <div className="form-group">
                <label className="form-label">
                  Listing Title <span className="req">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Casio FX-991EX Scientific Calculator or Engineering Maths Vol 1"
                  value={form.title}
                  onChange={set('title')}
                  maxLength={100}
                  required
                />
                <span className="char-count">{form.title.length}/100</span>
              </div>

              {/* Category & Condition */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Category <span className="req">*</span></label>
                  <select className="form-input form-select" value={form.category} onChange={set('category')}>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Item Condition <span className="req">*</span></label>
                  <select className="form-input form-select" value={form.itemCondition} onChange={set('itemCondition')}>
                    {CONDITIONS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price & Location */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Price (in INR ₹) <span className="req">*</span></label>
                  <div className="rupee-input-wrap">
                    <span className="rupee-prefix">₹</span>
                    <input
                      type="number"
                      className="form-input price-num-input"
                      placeholder="e.g. 750"
                      value={form.price}
                      onChange={set('price')}
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Campus Pickup Point</label>
                  <input
                    type="text"
                    list="campus-locations"
                    className="form-input"
                    placeholder="e.g. Central Library Gate"
                    value={form.location}
                    onChange={set('location')}
                  />
                  <datalist id="campus-locations">
                    {POPULAR_LOCATIONS.map(loc => <option key={loc} value={loc} />)}
                  </datalist>
                </div>
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">Detailed Description <span className="req">*</span></label>
                <textarea
                  className="form-input form-textarea"
                  placeholder="Describe the condition, semester used, included accessories, or reasons for selling..."
                  value={form.description}
                  onChange={set('description')}
                  rows={5}
                  required
                />
              </div>

              {/* Image Upload with Drag/Preview */}
              <div className="form-group">
                <label className="form-label">Item Photos (Max 5)</label>
                <div className="upload-dropzone">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleImages}
                    className="file-input-hidden"
                  />
                  <label htmlFor="image-upload" className="dropzone-label">
                    <span className="dropzone-icon">📷</span>
                    <span className="dropzone-text">Click to upload photos from your device</span>
                    <span className="dropzone-hint">PNG, JPG, or WEBP up to 5MB each</span>
                  </label>
                </div>

                {previews.length > 0 && (
                  <div className="previews-grid">
                    {previews.map((p, i) => (
                      <div key={i} className="preview-thumb-box">
                        <img src={p} alt="" />
                        <button type="button" className="remove-thumb-btn" onClick={() => removeImage(i)}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="create-actions-bar">
                <button
                  type="button"
                  className="btn btn-outline btn-lg"
                  onClick={() => setShowPreviewModal(true)}
                >
                  👁️ Preview Card
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-lg flex-1"
                  disabled={loading}
                >
                  {loading ? 'Publishing...' : '🚀 Publish Listing'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Live Preview Modal */}
        {showPreviewModal && (
          <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 400 }}>
              <div className="modal-header">
                <h3>Live Marketplace Preview</h3>
                <button className="modal-close" onClick={() => setShowPreviewModal(false)}>✕</button>
              </div>
              <div className="modal-body" style={{ padding: 20 }}>
                <div className="listing-card card preview-card-box">
                  <div className="listing-card-image">
                    {previews.length > 0 ? (
                      <img src={previews[0]} alt="" />
                    ) : (
                      <div className="listing-no-image">
                        <span>{selectedCategory?.icon || '📦'}</span>
                      </div>
                    )}
                    <span className="chip chip-condition">{form.itemCondition.replace('_', ' ')}</span>
                  </div>
                  <div className="card-body">
                    <span className="chip chip-category-small">{selectedCategory?.label}</span>
                    <h4 className="listing-title">{form.title || 'Untitled Item'}</h4>
                    <div className="listing-price-row">
                      <div className="price">₹{Number(form.price || 0).toLocaleString('en-IN')}</div>
                      <span className="listing-location">📍 {form.location || 'Campus'}</span>
                    </div>
                    <div className="listing-seller-footer">
                      <span className="seller-name-txt">{user?.fullName || 'You'} ✓</span>
                      <span className="btn btn-outline btn-xs">View</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setShowPreviewModal(false)}>Back to Edit</button>
                <button className="btn btn-lime" onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Publishing...' : 'Looks Great, Publish!'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
