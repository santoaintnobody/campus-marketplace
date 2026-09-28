import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import './Admin.css';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try { const res = await adminAPI.getReports(); setReports(res.data); }
    catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const resolve = async (id) => {
    try { await adminAPI.resolveReport(id, 'Reviewed and resolved'); showToast('Report resolved'); fetchReports(); }
    catch (err) { showToast('Error', 'error'); }
  };

  const reject = async (id) => {
    try { await adminAPI.rejectReport(id, 'Report rejected - no violation found'); showToast('Report rejected'); fetchReports(); }
    catch (err) { showToast('Error', 'error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <h1>⚠️ Report Management</h1>
      <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>Review and manage user reports</p>

      {reports.length === 0 ? (
        <div className="empty-state card" style={{ padding: 48 }}>
          <h3>✅ No reports</h3>
          <p>No reports have been submitted yet</p>
        </div>
      ) : (
        <div className="card">
          <table className="admin-table">
            <thead>
              <tr><th>Reporter</th><th>Listing</th><th>Reported User</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r.id}>
                  <td>{r.reporterName}</td>
                  <td>{r.listingTitle}</td>
                  <td>{r.reportedUserName}</td>
                  <td>{r.reason}</td>
                  <td><span className={`chip chip-${r.status === 'PENDING' ? 'pending' : r.status === 'RESOLVED' ? 'active' : 'removed'}`}>{r.status}</span></td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                  <td>
                    {r.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => resolve(r.id)}>Resolve</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => reject(r.id)}>Reject</button>
                      </div>
                    )}
                    {r.status !== 'PENDING' && <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>{r.adminNotes}</span>}
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
