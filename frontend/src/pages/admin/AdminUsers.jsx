import { useState, useEffect } from 'react';
import { adminAPI } from '../../api';
import { useToast } from '../../context/ToastContext';
import './Admin.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async (q) => {
    try {
      const res = await adminAPI.getUsers(q);
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const toggleBlock = async (user) => {
    try {
      if (user.accountActive) {
        await adminAPI.blockUser(user.id);
        showToast(`${user.fullName} blocked`);
      } else {
        await adminAPI.unblockUser(user.id);
        showToast(`${user.fullName} unblocked`);
      }
      fetchUsers(search);
    } catch (err) { showToast(err.response?.data?.message || 'Error', 'error'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div>
      <h1>👥 User Management</h1>
      <form className="admin-search" onSubmit={handleSearch}>
        <input className="form-input" placeholder="Search by name or email..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth: 400 }} />
        <button type="submit" className="btn btn-secondary btn-sm">Search</button>
      </form>

      <div className="card">
        <table className="admin-table">
          <thead>
            <tr><th>User</th><th>Student ID</th><th>Department</th><th>Role</th><th>Status</th><th>Rating</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.fullName}</strong><br /><small style={{ color: 'var(--muted)' }}>{u.email}</small></td>
                <td>{u.studentId}</td>
                <td>{u.department} • {u.year}</td>
                <td><span className="chip" style={{ background: u.role === 'ADMIN' ? 'var(--navy)' : 'var(--bg-paper)', color: u.role === 'ADMIN' ? 'white' : 'var(--ink)' }}>{u.role}</span></td>
                <td><span className={`chip ${u.accountActive ? 'chip-active' : 'chip-sold'}`}>{u.accountActive ? 'Active' : 'Blocked'}</span></td>
                <td>{u.rating > 0 ? `★ ${u.rating}` : '-'}</td>
                <td>
                  {u.role !== 'ADMIN' && (
                    <button className={`btn btn-sm ${u.accountActive ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => toggleBlock(u)}>
                      {u.accountActive ? 'Block' : 'Unblock'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
