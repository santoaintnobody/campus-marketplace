import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { messageAPI, offerAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Chat.css';

export default function Chat() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Quick Offer Modal in Chat
  const [showQuickOffer, setShowQuickOffer] = useState(false);
  const [quickOfferPrice, setQuickOfferPrice] = useState('');

  const messagesEndRef = useRef(null);

  const initUserId = searchParams.get('userId');
  const initListingId = searchParams.get('listingId');

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConvo) {
      const otherId = activeConvo.otherUserId || activeConvo.otherUser?.id;
      const listingId = activeConvo.listingId || activeConvo.listing?.id;
      if (otherId && listingId) {
        fetchMessages(otherId, listingId);
        const interval = setInterval(() => fetchMessages(otherId, listingId), 6000);
        return () => clearInterval(interval);
      }
    }
  }, [activeConvo?.otherUserId, activeConvo?.otherUser?.id, activeConvo?.listingId, activeConvo?.listing?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await messageAPI.getConversations();
      const list = res?.data || [];
      setConversations(list);

      if (!activeConvo && list.length > 0) {
        if (initUserId && initListingId) {
          const target = list.find(c =>
            (c.otherUserId == initUserId || c.otherUser?.id == initUserId) &&
            (c.listingId == initListingId || c.listing?.id == initListingId)
          );
          setActiveConvo(target || list[0]);
        } else {
          setActiveConvo(list[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (otherUserId, listingId) => {
    try {
      const res = await messageAPI.getConversation(otherUserId, listingId);
      if (res?.data) {
        setMessages(res.data);
        window.dispatchEvent(new CustomEvent('app:badge-refresh'));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo) return;
    const text = newMessage.trim();
    setNewMessage('');
    setSending(true);

    const otherId = activeConvo.otherUserId || activeConvo.otherUser?.id;
    const listingId = activeConvo.listingId || activeConvo.listing?.id;

    try {
      await messageAPI.send({
        recipientId: otherId,
        listingId: listingId,
        content: text
      });
      fetchMessages(otherId, listingId);
      fetchConversations();
      window.dispatchEvent(new CustomEvent('app:badge-refresh'));
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const handleSendQuickOffer = async (e) => {
    e.preventDefault();
    const amount = Number(quickOfferPrice);
    if (!amount || amount <= 0) return showToast('Please enter a valid price', 'error');

    const listingId = activeConvo.listingId || activeConvo.listing?.id;
    try {
      await offerAPI.create({
        listingId: listingId,
        offerAmount: amount,
        message: `Submitted a quick offer of ₹${amount.toLocaleString('en-IN')} in chat.`
      });
      showToast(`Offer of ₹${amount.toLocaleString('en-IN')} submitted! 🎉`);
      setShowQuickOffer(false);
      setQuickOfferPrice('');

      // Send chat confirmation note
      const otherId = activeConvo.otherUserId || activeConvo.otherUser?.id;
      await messageAPI.send({
        recipientId: otherId,
        listingId: listingId,
        content: `I've sent an offer of ₹${amount.toLocaleString('en-IN')} for this item!`
      });
      fetchMessages(otherId, listingId);
    } catch (err) {
      showToast('Error submitting offer', 'error');
    }
  };

  const getOtherName = (c) => c.otherUserName || c.otherUser?.fullName || 'Student';
  const getListingTitle = (c) => c.listingTitle || c.listing?.title || 'Campus Listing';
  const getListingId = (c) => c.listingId || c.listing?.id;
  const getLastMessage = (c) => c.lastMessage?.content || c.lastMessage || 'Start conversation...';

  if (loading) {
    return (
      <div className="page-wrapper chat-page">
        <div className="container">
          <div className="skeleton" style={{ height: 500, borderRadius: 16 }}></div>
        </div>
      </div>
    );
  }

  const activeOtherId = activeConvo ? (activeConvo.otherUserId || activeConvo.otherUser?.id) : null;
  const activeListingId = activeConvo ? getListingId(activeConvo) : null;

  return (
    <div className="page-wrapper chat-page">
      <div className="container">
        <div className="chat-header-banner">
          <div>
            <span className="browse-eyebrow">Student Messaging</span>
            <h1>💬 Campus Chat & Negotiations</h1>
            <p className="browse-subtitle">Coordinate safe handovers and negotiate pricing in real time.</p>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">💬</div>
            <h3>No active conversations yet</h3>
            <p>To start a conversation with a seller, browse the marketplace and click <strong>"Message Seller"</strong> on any item page.</p>
            <div className="empty-state-actions">
              <Link to="/browse" className="btn btn-primary btn-lg">
                🛍️ Explore Marketplace
              </Link>
            </div>
          </div>
        ) : (
          <div className="chat-card card">
            <div className="chat-layout">
              {/* Sidebar: Conversations List */}
              <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                  <h3>Chats ({conversations.length})</h3>
                </div>
                <div className="chat-conversations-list">
                  {conversations.map(c => {
                    const cOtherId = c.otherUserId || c.otherUser?.id;
                    const cListId = getListingId(c);
                    const isSelected = activeOtherId === cOtherId && activeListingId === cListId;

                    return (
                      <div
                        key={`${cOtherId}-${cListId}`}
                        className={`chat-convo-item ${isSelected ? 'active' : ''}`}
                        onClick={() => setActiveConvo(c)}
                      >
                        <div className="chat-avatar">
                          {getOtherName(c).charAt(0)}
                        </div>
                        <div className="chat-convo-details">
                          <div className="chat-convo-top">
                            <span className="convo-name">{getOtherName(c)}</span>
                            {c.unreadCount > 0 && (
                              <span className="chat-unread-dot">{c.unreadCount}</span>
                            )}
                          </div>
                          <div className="convo-item-tag">🏷️ {getListingTitle(c)}</div>
                          <div className="convo-snippet">{getLastMessage(c)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Main: Active Chat Window */}
              <div className="chat-main">
                {activeConvo ? (
                  <>
                    {/* Chat Header */}
                    <div className="chat-main-header">
                      <div className="chat-recipient-info">
                        <div className="chat-avatar-small">
                          {getOtherName(activeConvo).charAt(0)}
                        </div>
                        <div>
                          <div className="chat-recipient-name">
                            {getOtherName(activeConvo)}
                            <span className="verified-tick" title="Verified Student">✓</span>
                          </div>
                          <Link to={`/listing/${activeListingId}`} className="chat-item-link">
                            Item: <strong>{getListingTitle(activeConvo)}</strong> ↗
                          </Link>
                        </div>
                      </div>

                      <div className="chat-header-actions">
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setShowQuickOffer(true)}
                        >
                          🏷️ Make Offer
                        </button>
                        <Link to={`/listing/${activeListingId}`} className="btn btn-ghost btn-sm">
                          View Item
                        </Link>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="chat-messages-container">
                      {messages.length === 0 ? (
                        <div className="chat-no-messages">
                          <span>👋</span>
                          <p>Say hello! Ask about item condition, meetup spot, or negotiate price.</p>
                        </div>
                      ) : (
                        messages.map((m, idx) => {
                          const isMe = m.senderId === user?.id || m.senderId === 2; // match logged in user
                          return (
                            <div key={m.id || idx} className={`chat-bubble-row ${isMe ? 'outgoing' : 'incoming'}`}>
                              <div className={`chat-bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>
                                <div className="bubble-text">{m.content}</div>
                                <div className="bubble-time">
                                  {m.timestamp || m.createdAt ? (
                                    new Date(m.timestamp || m.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                  ) : 'Now'}
                                  {isMe && <span className="read-ticks">✓✓</span>}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Chat Input */}
                    <form className="chat-input-bar" onSubmit={handleSendMessage}>
                      <input
                        type="text"
                        className="form-input chat-msg-input"
                        placeholder={`Message ${getOtherName(activeConvo)}...`}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        autoFocus
                      />
                      <button type="submit" className="btn btn-primary chat-send-btn" disabled={sending || !newMessage.trim()}>
                        {sending ? '...' : 'Send ➤'}
                      </button>
                    </form>
                  </>
                ) : (
                  <div className="empty-state">
                    <p>Select a conversation from the left to start chatting</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Quick Offer Modal in Chat */}
        {showQuickOffer && activeConvo && (
          <div className="modal-overlay" onClick={() => setShowQuickOffer(false)}>
            <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
              <div className="modal-header">
                <h3>Submit Offer to {getOtherName(activeConvo)}</h3>
                <button className="modal-close" onClick={() => setShowQuickOffer(false)}>✕</button>
              </div>
              <form onSubmit={handleSendQuickOffer}>
                <div className="modal-body">
                  <p style={{ color: 'var(--muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                    For: <strong>{getListingTitle(activeConvo)}</strong>
                  </p>
                  <div className="form-group">
                    <label className="form-label">Offer Amount (₹)</label>
                    <div className="offer-input-wrapper">
                      <span className="rupee-symbol">₹</span>
                      <input
                        type="number"
                        className="form-input offer-num-input"
                        placeholder="e.g. 500"
                        value={quickOfferPrice}
                        onChange={e => setQuickOfferPrice(e.target.value)}
                        min="1"
                        required
                        autoFocus
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowQuickOffer(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-lime">
                    Send Offer 🏷️
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
