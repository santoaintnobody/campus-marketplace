import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import './Admin.css';

export default function AdminListings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { fetchListings(); }, []);

  const fetchListings = async () => {
    try { const res = await adminAPI.getPendingListings(); setListings(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    try { await adminAPI.approveListing(id); showToast('Listing approved'); fetchListings(); }
    catch (err) { showToast('Error', 'error'); }
  };

  const reject = async (id) => {
    try { await adminAPI.rejectListing(id); showToast('Listing rejected'); fetchListings(); }
    catch (err) { showToast('Error', 'error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <h1>📦 Listing Moderation</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>Review and moderate pending listings</p>

      {listings.length === 0 ? (
        <div className="empty-state card" style={{ padding: 48 }}>
          <h3>✅ No pending listings</h3>
          <p>All listings have been reviewed</p>
        </div>
      ) : (
        <div className="card">
          <table className="admin-table">
            <thead>
              <tr><th>Title</th><th>Category</th><th>Price</th><th>Seller</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {listings.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.title}</strong></td>
                  <td>{l.category?.replace('_', ' ')}</td>
                  <td className="price">₹{l.price?.toLocaleString('en-IN')}</td>
                  <td>{l.seller?.fullName}</td>
                  <td><span className={`chip chip-${l.status?.toLowerCase()}`}>{l.status}</span></td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={() => approve(l.id)}>✅ Approve</button>
                    <button className="btn btn-danger btn-sm" onClick={() => reject(l.id)}>❌ Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
