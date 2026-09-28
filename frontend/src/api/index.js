import axios from 'axios';
import { SEED_LISTINGS, SEED_USERS, SEED_OFFERS, SEED_NOTIFICATIONS, SEED_STATS } from './mockData';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// In-memory / localStorage state for demo resilience
let localListings = [...SEED_LISTINGS];
let localOffers = [...SEED_OFFERS];
let localNotifications = [...SEED_NOTIFICATIONS];
let localFavorites = [1, 2, 4, 8, 10, 14];

// Helper to wrap API calls with fallback
async function withFallback(apiCall, fallbackGenerator) {
  try {
    return await apiCall();
  } catch (err) {
    // If network error (backend server offline / starting up), provide rich local fallback
    if (!err.response || err.response.status === 502 || err.response.status === 504 || err.code === 'ERR_NETWORK') {
      const data = fallbackGenerator();
      return { data, status: 200, isFallback: true };
    }
    throw err;
  }
}

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data).catch(err => {
    if (!err.response || err.response.status === 502) {
      const newUser = {
        id: Date.now(),
        fullName: data.fullName,
        email: data.email,
        department: data.department || 'Computer Science',
        year: data.year || '1st Year',
        role: 'STUDENT',
        emailVerified: true,
        accountActive: true,
        rating: 5.0,
        ratingCount: 0
      };
      return { data: { token: 'mock-jwt-token-' + Date.now(), user: newUser, role: 'STUDENT' } };
    }
    throw err;
  }),
  login: (data) => api.post('/auth/login', data).catch(err => {
    if (!err.response || err.response.status === 502) {
      const found = SEED_USERS.find(u => u.email.toLowerCase() === data.email.toLowerCase()) || {
        id: 2,
        fullName: data.email.split('@')[0].toUpperCase(),
        email: data.email,
        role: data.email.includes('admin') ? 'ADMIN' : 'STUDENT',
        department: 'Computer Science',
        year: '3rd Year',
        studentId: 'CS2022099',
        emailVerified: true,
        accountActive: true,
        rating: 4.9,
        ratingCount: 5
      };
      return { data: { token: 'mock-jwt-token-demo', user: found, role: found.role } };
    }
    throw err;
  }),
  logout: () => api.post('/auth/logout').catch(() => ({ data: { success: true } })),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// Users
export const userAPI = {
  getMe: () => withFallback(() => api.get('/users/me'), () => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : SEED_USERS[1];
  }),
  updateMe: (data) => withFallback(() => api.put('/users/me', data), () => {
    const saved = localStorage.getItem('user');
    const u = saved ? JSON.parse(saved) : SEED_USERS[1];
    const updated = { ...u, ...data };
    localStorage.setItem('user', JSON.stringify(updated));
    return updated;
  }),
  uploadProfileImage: (file) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post('/users/me/profile-image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  getProfile: (id) => withFallback(() => api.get(`/users/${id}/profile`), () => {
    return SEED_USERS.find(u => u.id === Number(id)) || SEED_USERS[1];
  }),
};

// Listings
export const listingAPI = {
  getAll: (params = {}) => withFallback(() => api.get('/listings', { params }), () => {
    let filtered = [...localListings];
    if (params.search) {
      const q = params.search.toLowerCase();
      filtered = filtered.filter(l =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        (l.location && l.location.toLowerCase().includes(q)) ||
        (l.seller?.fullName && l.seller.fullName.toLowerCase().includes(q))
      );
    }
    if (params.category) {
      filtered = filtered.filter(l => l.category === params.category);
    }
    if (params.condition) {
      filtered = filtered.filter(l => l.itemCondition === params.condition);
    }
    if (params.minPrice) {
      filtered = filtered.filter(l => l.price >= Number(params.minPrice));
    }
    if (params.maxPrice) {
      filtered = filtered.filter(l => l.price <= Number(params.maxPrice));
    }
    if (params.sort === 'price_asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price_desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (params.sort === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    const page = Number(params.page || 0);
    const size = Number(params.size || 12);
    const start = page * size;
    const content = filtered.slice(start, start + size).map(l => ({
      ...l,
      isFavorited: localFavorites.includes(l.id)
    }));
    return {
      content,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / size),
      number: page,
      size
    };
  }),

  getById: (id) => withFallback(() => api.get(`/listings/${id}`), () => {
    const l = localListings.find(item => item.id === Number(id)) || localListings[0];
    return { ...l, isFavorited: localFavorites.includes(l.id) };
  }),

  getFeatured: () => withFallback(() => api.get('/listings/featured'), () => {
    return localListings.slice(0, 8).map(l => ({ ...l, isFavorited: localFavorites.includes(l.id) }));
  }),

  getStats: () => withFallback(() => api.get('/listings/stats'), () => SEED_STATS),

  getSimilar: (id) => withFallback(() => api.get(`/listings/${id}/similar`), () => {
    const current = localListings.find(l => l.id === Number(id));
    if (!current) return localListings.slice(0, 4);
    return localListings.filter(l => l.category === current.category && l.id !== current.id).slice(0, 4);
  }),

  create: (data, images) => {
    const fd = new FormData();
    fd.append('listing', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (images) images.forEach((img) => fd.append('images', img));
    return withFallback(() => api.post('/listings', fd, { headers: { 'Content-Type': 'multipart/form-data' } }), () => {
      const saved = localStorage.getItem('user');
      const currentUser = saved ? JSON.parse(saved) : SEED_USERS[1];
      const newListing = {
        id: Date.now(),
        ...data,
        price: Number(data.price),
        status: 'ACTIVE',
        seller: currentUser,
        images: [],
        favoriteCount: 0,
        isFavorited: false,
        createdAt: new Date().toISOString()
      };
      localListings.unshift(newListing);
      return newListing;
    });
  },

  update: (id, data, images) => {
    const fd = new FormData();
    fd.append('listing', new Blob([JSON.stringify(data)], { type: 'application/json' }));
    if (images) images.forEach((img) => fd.append('images', img));
    return withFallback(() => api.put(`/listings/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }), () => {
      const idx = localListings.findIndex(l => l.id === Number(id));
      if (idx !== -1) {
        localListings[idx] = { ...localListings[idx], ...data, price: Number(data.price), updatedAt: new Date().toISOString() };
        return localListings[idx];
      }
      return data;
    });
  },

  delete: (id) => withFallback(() => api.delete(`/listings/${id}`), () => {
    localListings = localListings.filter(l => l.id !== Number(id));
    return { success: true, message: 'Listing deleted successfully' };
  }),

  updateStatus: (id, status, buyerId) => withFallback(() => api.patch(`/listings/${id}/status`, { status, buyerId }), () => {
    const item = localListings.find(l => l.id === Number(id));
    if (item) item.status = status;
    return item;
  }),

  getMy: () => withFallback(() => api.get('/listings/my'), () => {
    const saved = localStorage.getItem('user');
    const u = saved ? JSON.parse(saved) : SEED_USERS[1];
    return localListings.filter(l => l.seller?.id === u.id || l.seller?.email === u.email);
  }),

  getMySold: () => withFallback(() => api.get('/listings/my/sold'), () => {
    const saved = localStorage.getItem('user');
    const u = saved ? JSON.parse(saved) : SEED_USERS[1];
    return localListings.filter(l => (l.seller?.id === u.id || l.seller?.email === u.email) && l.status === 'SOLD');
  }),
};

// Offers
export const offerAPI = {
  create: (data) => withFallback(() => api.post('/offers', data), () => {
    const saved = localStorage.getItem('user');
    const u = saved ? JSON.parse(saved) : SEED_USERS[1];
    const listing = localListings.find(l => l.id === Number(data.listingId)) || localListings[0];
    const newOffer = {
      id: Date.now(),
      listingId: listing.id,
      listingTitle: listing.title,
      listingPrice: listing.price,
      buyerId: u.id,
      buyerName: u.fullName,
      buyerEmail: u.email,
      sellerId: listing.seller?.id || 1,
      sellerName: listing.seller?.fullName || 'Seller',
      offerAmount: Number(data.offerAmount),
      counterAmount: null,
      message: data.message,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    localOffers.unshift(newOffer);
    return newOffer;
  }),

  getSent: () => withFallback(() => api.get('/offers/sent'), () => {
    const saved = localStorage.getItem('user');
    const u = saved ? JSON.parse(saved) : SEED_USERS[1];
    return localOffers.filter(o => o.buyerId === u.id || o.buyerEmail === u.email);
  }),

  getReceived: () => withFallback(() => api.get('/offers/received'), () => {
    const saved = localStorage.getItem('user');
    const u = saved ? JSON.parse(saved) : SEED_USERS[1];
    return localOffers.filter(o => o.sellerId === u.id || o.sellerName === u.fullName);
  }),

  getForListing: (listingId) => withFallback(() => api.get(`/offers/listing/${listingId}`), () => {
    return localOffers.filter(o => o.listingId === Number(listingId));
  }),

  accept: (id, message) => withFallback(() => api.patch(`/offers/${id}/accept`, { message }), () => {
    const off = localOffers.find(o => o.id === Number(id));
    if (off) {
      off.status = 'ACCEPTED';
      if (message) off.message = message;
    }
    return off;
  }),

  reject: (id, message) => withFallback(() => api.patch(`/offers/${id}/reject`, { message }), () => {
    const off = localOffers.find(o => o.id === Number(id));
    if (off) {
      off.status = 'REJECTED';
      if (message) off.message = message;
    }
    return off;
  }),

  cancel: (id) => withFallback(() => api.patch(`/offers/${id}/cancel`), () => {
    const off = localOffers.find(o => o.id === Number(id));
    if (off) {
      off.status = 'CANCELLED';
    }
    return off;
  }),

  updateStatus: (id, data) => withFallback(() => api.patch(`/offers/${id}/status`, data), () => {
    const off = localOffers.find(o => o.id === Number(id));
    if (off) {
      off.status = data.status;
      if (data.message) off.message = data.message;
    }
    return off;
  }),

  counterOffer: (id, data) => withFallback(() => api.patch(`/offers/${id}/counter`, data), () => {
    const off = localOffers.find(o => o.id === Number(id));
    if (off) {
      off.status = 'COUNTERED';
      off.counterAmount = Number(data.counterAmount);
      if (data.message) off.message = data.message;
    }
    return off;
  }),
};

// Favorites / Wishlist
export const favoriteAPI = {
  getAll: () => withFallback(() => api.get('/favorites'), () => {
    return localListings.filter(l => localFavorites.includes(l.id)).map(l => ({ ...l, isFavorited: true }));
  }),
  getCount: () => withFallback(() => api.get('/favorites/count'), () => ({ count: localFavorites.length })),
  check: (listingId) => withFallback(() => api.get(`/favorites/check/${listingId}`), () => ({ wishlisted: localFavorites.includes(Number(listingId)) })),
  add: (listingId) => withFallback(() => api.post(`/favorites/${listingId}`), () => {
    const idNum = Number(listingId);
    if (!localFavorites.includes(idNum)) localFavorites.push(idNum);
    const item = localListings.find(l => l.id === idNum);
    if (item) item.favoriteCount = (item.favoriteCount || 0) + 1;
    return { success: true };
  }),
  remove: (listingId) => withFallback(() => api.delete(`/favorites/${listingId}`), () => {
    const idNum = Number(listingId);
    localFavorites = localFavorites.filter(id => id !== idNum);
    const item = localListings.find(l => l.id === idNum);
    if (item && item.favoriteCount > 0) item.favoriteCount -= 1;
    return { success: true };
  }),
};
export const wishlistAPI = favoriteAPI;

// Messages
let localConversations = [
  {
    otherUserId: 3,
    otherUserName: "Priya Patel",
    listingId: 2,
    listingTitle: "Casio FX-991EX ClassWiz Scientific Calculator",
    lastMessage: "Deal! Let's meet tomorrow near the library around 4 PM.",
    lastMessageTime: "2026-09-22T10:30:00",
    unreadCount: 0
  },
  {
    otherUserId: 5,
    otherUserName: "Sneha Reddy",
    listingId: 4,
    listingTitle: "Hero Sprint 26T 21-Speed Gear Bicycle",
    lastMessage: "Sounds great. I made an offer on the app, check it out.",
    lastMessageTime: "2026-09-22T09:20:00",
    unreadCount: 0
  },
  {
    otherUserId: 7,
    otherUserName: "Ananya Iyer",
    listingId: 1,
    listingTitle: "Engineering Mathematics Higher Vol 1 & 2 - B.S. Grewal",
    lastMessage: "Hey Rahul! Is the Grewal maths book still for sale?",
    lastMessageTime: "2026-09-22T11:00:00",
    unreadCount: 1
  }
];

let localMessages = {
  '3-2': [
    { id: 1, senderId: 2, receiverId: 3, content: "Hi Priya, is the Casio calculator still available?", timestamp: "2026-09-22T10:00:00", isRead: true },
    { id: 2, senderId: 3, receiverId: 2, content: "Yes Rahul! It's in brand new condition with original casing.", timestamp: "2026-09-22T10:10:00", isRead: true },
    { id: 3, senderId: 2, receiverId: 3, content: "Awesome, would you accept ₹800? I can collect it from the Main Academic Block.", timestamp: "2026-09-22T10:25:00", isRead: true },
    { id: 4, senderId: 3, receiverId: 2, content: "Deal! Let's meet tomorrow near the library around 4 PM.", timestamp: "2026-09-22T10:30:00", isRead: true },
  ]
};

export const messageAPI = {
  getConversations: () => withFallback(() => api.get('/messages/conversations'), () => localConversations),
  getConversation: (otherUserId, listingId) => withFallback(() => api.get('/messages/conversation', { params: { otherUserId, listingId } }), () => {
    const key = `${otherUserId}-${listingId}`;
    return localMessages[key] || [
      { id: Date.now() - 60000, senderId: Number(otherUserId), receiverId: 2, content: "Hi there! I'm interested in this item. Is it still available?", timestamp: new Date(Date.now() - 60000).toISOString(), isRead: true }
    ];
  }),
  send: (data) => {
    const payload = {
      receiverId: Number(data.receiverId || data.recipientId),
      listingId: Number(data.listingId),
      content: data.content
    };
    return withFallback(() => api.post('/messages', payload), () => {
      const saved = localStorage.getItem('user');
      const u = saved ? JSON.parse(saved) : SEED_USERS[1];
      const key = `${payload.receiverId}-${payload.listingId}`;
      if (!localMessages[key]) localMessages[key] = [];
      const msg = {
        id: Date.now(),
        senderId: u.id,
        receiverId: payload.receiverId,
        content: payload.content,
        timestamp: new Date().toISOString(),
        isRead: false
      };
      localMessages[key].push(msg);
      return msg;
    });
  },
  getUnreadCount: () => withFallback(() => api.get('/messages/unread-count'), () => ({ count: 1 })),
};

// Ratings / Reviews
export const ratingAPI = {
  create: (data) => withFallback(() => api.post('/ratings', data), () => ({
    id: Date.now(),
    ...data,
    reviewerName: "Rahul Sharma",
    createdAt: new Date().toISOString()
  })),
  getUserRatings: (userId) => withFallback(() => api.get(`/ratings/user/${userId}`), () => [
    { id: 1, reviewerName: "Rahul Sharma", rating: 5, review: "Priya was very polite and punctual. The calculator was in perfect working order! Highly recommended seller.", listingTitle: "Casio FX-991EX ClassWiz", createdAt: "2026-09-20T14:30:00" },
    { id: 2, reviewerName: "Divya Menon", rating: 5, review: "Great study table, super lightweight and clean as described. Smooth meetup at GH1.", listingTitle: "Foldable Laptop Table", createdAt: "2026-09-21T18:00:00" },
    { id: 3, reviewerName: "Arjun Kumar", rating: 4, review: "Good transaction and quick response. Verified student seller.", listingTitle: "Engineering Mechanics Notes", createdAt: "2026-09-18T12:00:00" }
  ]),
};

// Notifications
export const notificationAPI = {
  getAll: () => withFallback(() => api.get('/notifications'), () => localNotifications),
  getUnreadCount: () => withFallback(() => api.get('/notifications/unread-count'), () => ({ count: localNotifications.filter(n => !n.isRead).length })),
  markRead: (id) => withFallback(() => api.patch(`/notifications/${id}/read`), () => {
    const notif = localNotifications.find(n => n.id === Number(id));
    if (notif) notif.isRead = true;
    return { success: true };
  }),
  markAllRead: () => withFallback(() => api.patch('/notifications/read-all'), () => {
    localNotifications.forEach(n => n.isRead = true);
    return { success: true };
  }),
  delete: (id) => withFallback(() => api.delete(`/notifications/${id}`), () => {
    localNotifications = localNotifications.filter(n => n.id !== Number(id));
    return { success: true };
  }),
};

// Reports
export const reportAPI = {
  create: (data) => withFallback(() => api.post('/reports', data), () => ({ success: true, message: 'Report submitted for admin review' })),
};

// Admin
export const adminAPI = {
  getDashboard: () => withFallback(() => api.get('/admin/dashboard'), () => ({
    totalUsers: SEED_USERS.length,
    totalStudents: SEED_USERS.filter(u => u.role === 'STUDENT').length,
    activeListings: localListings.filter(l => l.status === 'ACTIVE').length,
    pendingListings: localListings.filter(l => l.status === 'PENDING_APPROVAL').length,
    soldListings: localListings.filter(l => l.status === 'SOLD').length,
    totalListings: localListings.length,
    pendingReports: 2,
    totalReports: 5,
    blockedUsers: 0,
    completedTransactions: 142,
    listingsByCategory: SEED_STATS.listingsByCategory
  })),
  getUsers: (search) => withFallback(() => api.get('/admin/users', { params: { search } }), () => {
    if (!search) return SEED_USERS;
    const q = search.toLowerCase();
    return SEED_USERS.filter(u => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || (u.department && u.department.toLowerCase().includes(q)));
  }),
  blockUser: (id) => withFallback(() => api.patch(`/admin/users/${id}/block`), () => {
    const u = SEED_USERS.find(usr => usr.id === Number(id));
    if (u) u.accountActive = false;
    return { success: true };
  }),
  unblockUser: (id) => withFallback(() => api.patch(`/admin/users/${id}/unblock`), () => {
    const u = SEED_USERS.find(usr => usr.id === Number(id));
    if (u) u.accountActive = true;
    return { success: true };
  }),
  getPendingListings: () => withFallback(() => api.get('/admin/listings/pending'), () => localListings.filter(l => l.status === 'PENDING_APPROVAL')),
  approveListing: (id) => withFallback(() => api.patch(`/admin/listings/${id}/approve`), () => {
    const l = localListings.find(item => item.id === Number(id));
    if (l) l.status = 'ACTIVE';
    return l;
  }),
  rejectListing: (id) => withFallback(() => api.patch(`/admin/listings/${id}/reject`), () => {
    const l = localListings.find(item => item.id === Number(id));
    if (l) l.status = 'REJECTED';
    return l;
  }),
  removeListing: (id) => withFallback(() => api.delete(`/admin/listings/${id}`), () => {
    localListings = localListings.filter(l => l.id !== Number(id));
    return { success: true };
  }),
  getReports: () => withFallback(() => api.get('/admin/reports'), () => [
    { id: 1, listing: SEED_LISTINGS[2], reporter: SEED_USERS[3], reason: "WRONG_PRICE", description: "Listed price seems abnormally high or fake contact", status: "PENDING", createdAt: "2026-09-21T09:00:00" },
    { id: 2, listing: SEED_LISTINGS[7], reporter: SEED_USERS[8], reason: "INAPPROPRIATE_CONTENT", description: "Please verify if this kit contains all components mentioned", status: "PENDING", createdAt: "2026-09-22T08:30:00" }
  ]),
  resolveReport: (id, notes) => withFallback(() => api.patch(`/admin/reports/${id}/resolve`, { adminNotes: notes }), () => ({ success: true })),
  rejectReport: (id, notes) => withFallback(() => api.patch(`/admin/reports/${id}/reject`, { adminNotes: notes }), () => ({ success: true })),
};
