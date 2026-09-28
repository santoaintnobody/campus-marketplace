import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationAPI } from '../api';
import { useToast } from '../context/ToastContext';
import './Notifications.css';

const ICON_MAP = {
  MESSAGE: '💬',
  OFFER_RECEIVED: '🏷️',
  OFFER_ACCEPTED: '🎉',
  OFFER_REJECTED: '❌',
  OFFER_COUNTERED: '🤝',
  LISTING_APPROVED: '✅',
  LISTING_REJECTED: '🚫',
  LISTING_REPORTED: '⚠️',
  LISTING_SOLD: '💰',
  RATING_RECEIVED: '⭐',
  PASSWORD_RESET: '🔐',
  EMAIL_VERIFICATION: '📧',
  LISTING_FAVORITED: '❤️',
  USER_BLOCKED: '🚫',
  USER_UNBLOCKED: '🔓'
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      if (res?.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true, read: true } : n));
      window.dispatchEvent(new CustomEvent('app:badge-refresh'));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      window.dispatchEvent(new CustomEvent('app:badge-refresh'));
      showToast('All notifications marked as read! ✅');
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead && !n.read).length;

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper notif-page">
      <div className="container" style={{ maxWidth: 740 }}>
        <div className="browse-header-banner" style={{ marginBottom: 20 }}>
          <div>
            <span className="browse-eyebrow">Campus Updates</span>
            <h1>🔔 Notifications</h1>
            <p className="browse-subtitle">Real-time alerts for offers, messages, approvals, and reviews.</p>
          </div>
          {unreadCount > 0 && (
            <button className="btn btn-lime btn-sm" onClick={markAllRead}>
              ✓ Mark All Read ({unreadCount})
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">🔔</div>
            <h3>No notifications yet</h3>
            <p>You'll receive notifications whenever a student messages you, makes an offer, or rates a completed exchange.</p>
          </div>
        ) : (
          <div className="notif-list">
            {notifications.map(n => {
              const isUnread = !n.isRead && !n.read;
              return (
                <div
                  key={n.id}
                  className={`notif-item card ${isUnread ? 'unread' : ''}`}
                  onClick={() => isUnread && markRead(n.id)}
                >
                  <div className="card-body notif-card-body">
                    <span className="notif-icon-circle">{ICON_MAP[n.type] || '📌'}</span>
                    <div className="notif-text-content">
                      <div className="notif-title-row">
                        <strong>{n.title}</strong>
                        <span className="notif-time-ago">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>
                      <p className="notif-msg-text">{n.message}</p>
                      {n.referenceId && (
                        <Link to={`/listing/${n.referenceId}`} className="notif-action-link">
                          View Related Listing →
                        </Link>
                      )}
                    </div>
                    {isUnread && <span className="notif-pulse-dot" title="Unread" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
