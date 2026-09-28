import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'TEXTBOOKS',
    price: '',
    itemCondition: 'LIKE_NEW',
    location: '',
    status: 'ACTIVE'
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listingAPI.getById(id)
      .then(res => {
        const l = res.data;
        if (l.seller && user && (l.seller.id !== user.id && l.seller.email !== user.email)) {
          showToast('You can only edit your own listings', 'error');
          navigate('/browse');
          return;
        }
        setForm({
          title: l.title || '',
          description: l.description || '',
          category: l.category || 'TEXTBOOKS',
          price: l.price || '',
          itemCondition: l.itemCondition || 'GOOD',
          location: l.location || '',
          status: l.status || 'ACTIVE'
        });
        setExistingImages(l.images || []);
        setLoading(false);
      })
      .catch(() => {
        showToast('Listing not found', 'error');
        navigate('/browse');
      });
  }, [id, user]);

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return showToast('Title is required', 'error');
    if (!form.price || Number(form.price) <= 0) return showToast('Valid price is required', 'error');

    setSaving(true);
    try {
      const data = { ...form, price: parseFloat(form.price) };
      await listingAPI.update(id, data, images.length > 0 ? images : null);
      showToast('Listing updated successfully! ✅');
      navigate(`/listing/${id}`);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update listing', 'error');
    } finally {
      setSaving(false);
    }
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  if (loading) {
    return (
      <div className="page-wrapper create-page">
        <div className="container" style={{ maxWidth: 740 }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper create-page">
      <div className="container" style={{ maxWidth: 780 }}>
        <div className="create-header">
          <span className="create-eyebrow">Manage Item</span>
          <h1>Edit Listing</h1>
          <p className="create-subtitle">Update product information, price, or mark status.</p>
        </div>

        <form onSubmit={handleSubmit} className="create-form card">
          <div className="card-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title <span className="req">*</span></label>
              <input
                className="form-input"
                value={form.title}
                onChange={set('title')}
                required
              />
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
                <label className="form-label">Condition <span className="req">*</span></label>
                <select className="form-input form-select" value={form.itemCondition} onChange={set('itemCondition')}>
                  {CONDITIONS.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price, Status & Location */}
            <div className="form-row-2">
              <div className="form-group">
                <label className="form-label">Price (₹) <span className="req">*</span></label>
                <div className="rupee-input-wrap">
                  <span className="rupee-prefix">₹</span>
                  <input
                    type="number"
                    className="form-input price-num-input"
                    value={form.price}
                    onChange={set('price')}
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Listing Status</label>
                <select className="form-input form-select" value={form.status} onChange={set('status')}>
                  <option value="ACTIVE">Active (Available)</option>
                  <option value="RESERVED">Reserved</option>
                  <option value="SOLD">Sold</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Campus Pickup Location</label>
              <input
                className="form-input"
                value={form.location}
                onChange={set('location')}
                placeholder="e.g. Central Library Gate"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Description <span className="req">*</span></label>
              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={set('description')}
                required
                rows={5}
              />
            </div>

            {/* Images */}
            <div className="form-group">
              <label className="form-label">Current Photos</label>
              {existingImages.length > 0 ? (
                <div className="previews-grid" style={{ marginBottom: 12 }}>
                  {existingImages.map((img, i) => (
                    <div key={i} className="preview-thumb-box">
                      <img src={img} alt="" />
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginBottom: 8 }}>No photos currently uploaded.</p>
              )}

              <label className="form-label" style={{ marginTop: 12 }}>Replace Photos (Optional)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImages}
                className="form-input"
              />
              {previews.length > 0 && (
                <div className="previews-grid" style={{ marginTop: 12 }}>
                  {previews.map((p, i) => (
                    <div key={i} className="preview-thumb-box">
                      <img src={p} alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="create-actions-bar">
              <Link to={`/listing/${id}`} className="btn btn-ghost">Cancel</Link>
              <button type="submit" className="btn btn-primary btn-lg flex-1" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
