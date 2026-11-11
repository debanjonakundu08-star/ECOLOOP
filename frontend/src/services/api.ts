import {
  User,
  MaterialListing,
  MaterialRequest,
  Conversation,
  Message,
  Order,
  Payment,
  ImpactSummary,
  Notification,
  MatchResult,
} from '../types';

import { MOCK_LISTINGS, MOCK_USERS, MOCK_IMPACT, MOCK_MATCH } from './mockData';

const BASE_URL = '/api';

// In-memory / localStorage cache for mock state and user-customized listings
function getLocalListings(): MaterialListing[] {
  try {
    const saved = localStorage.getItem('ecoloop_custom_listings');
    const editedMap = JSON.parse(localStorage.getItem('ecoloop_edited_listings') || '{}');
    let baseListings = MOCK_LISTINGS;
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        baseListings = [...parsed, ...MOCK_LISTINGS];
      }
    }
    return baseListings.map((item) => {
      if (editedMap[item.id]) {
        const edits = editedMap[item.id];
        return {
          ...item,
          ...edits,
          seller: {
            ...(item.seller || {}),
            businessName: edits.companyName || edits.seller?.businessName || item.seller?.businessName || 'Enterprise Partner',
            city: edits.locationCity || item.seller?.city || 'Kolkata',
          },
          images: edits.imageUrl
            ? [{ id: 'img-edit-' + item.id, listingId: item.id, url: edits.imageUrl, isPrimary: true }]
            : (edits.images && edits.images.length > 0 ? edits.images : item.images),
        };
      }
      return item;
    });
  } catch {}
  return MOCK_LISTINGS;
}

function getMockFallback<T>(url: string, options: RequestInit = {}): T | null {
  const method = (options.method || 'GET').toUpperCase();
  const cleanUrl = url.split('?')[0];

  const allListings = getLocalListings();

  if (cleanUrl === '/materials' && method === 'GET') {
    return { listings: allListings, total: allListings.length } as unknown as T;
  }

  if (cleanUrl.startsWith('/materials/') && (method === 'PUT' || method === 'PATCH')) {
    const id = cleanUrl.replace('/materials/', '');
    const body = options.body ? JSON.parse(options.body as string) : {};
    try {
      const editedMap = JSON.parse(localStorage.getItem('ecoloop_edited_listings') || '{}');
      editedMap[id] = {
        ...editedMap[id],
        ...body,
      };
      localStorage.setItem('ecoloop_edited_listings', JSON.stringify(editedMap));
    } catch {}
    const updated = getLocalListings().find(m => m.id === id) || allListings[0];
    return { message: 'Listing updated successfully', listing: updated } as unknown as T;
  }

  if (cleanUrl === '/materials' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const sellerCompanyName = body.companyName || body.businessName || 'Your Enterprise';
    const newListing: MaterialListing = {
      id: 'custom-' + Date.now(),
      sellerId: '02f3d16e-3819-4dcf-8149-2b5d5e5b6101',
      title: body.title || 'Custom Listed Lot',
      description: body.description || 'Pre-inspected surplus material batch',
      category: body.category || 'Paper/Cardboard',
      quantity: parseFloat(body.quantity) || 500,
      unit: body.unit || 'kg',
      pricePerUnit: parseFloat(body.pricePerUnit) || 12.5,
      minOrderQuantity: parseFloat(body.minOrderQuantity) || 50,
      condition: body.condition || 'Clean / High Grade',
      locationCity: body.locationCity || 'Kolkata',
      locationAddress: body.locationAddress || 'Sector V, Salt Lake',
      availability: body.availability || 'Immediate',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seller: {
        id: MOCK_USERS[0].id,
        businessName: sellerCompanyName,
        city: body.locationCity || MOCK_USERS[0].city,
        category: body.category || MOCK_USERS[0].category,
        address: body.locationAddress || MOCK_USERS[0].address,
        bio: 'Verified supplier on EcoLoop',
        isVerified: true,
        phone: '+91 98301 22334',
        _count: {
          listings: 1,
          sellerOrders: 0,
        },
      },
      images: [
        {
          id: 'img-' + Date.now(),
          listingId: 'custom-' + Date.now(),
          url: body.imageUrl || body.images?.[0] || 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80',
          isPrimary: true,
        }
      ]
    };
    try {
      const existing = JSON.parse(localStorage.getItem('ecoloop_custom_listings') || '[]');
      localStorage.setItem('ecoloop_custom_listings', JSON.stringify([newListing, ...existing]));
    } catch {}
    return { message: 'Material published successfully!', listing: newListing } as unknown as T;
  }

  if (cleanUrl.startsWith('/materials/') && method === 'GET') {
    const id = cleanUrl.replace('/materials/', '');
    const found = allListings.find(m => m.id === id) || allListings[0];
    return {
      listing: found,
      aiMatch: MOCK_MATCH,
      related: allListings.filter(m => m.id !== found.id).slice(0, 3),
    } as unknown as T;
  }

  if (cleanUrl === '/materials/seller/my-listings' && method === 'GET') {
    return { listings: allListings.slice(0, 4) } as unknown as T;
  }

  if (cleanUrl === '/impact/summary') {
    return MOCK_IMPACT as unknown as T;
  }

  if (cleanUrl === '/auth/me') {
    const savedRole = localStorage.getItem('ecoloop_user_role') || 'SELLER';
    const user = savedRole === 'BUYER' ? MOCK_USERS[1] : MOCK_USERS[0];
    return { user } as unknown as T;
  }

  if (cleanUrl === '/auth/login' || cleanUrl === '/auth/signup') {
    return { message: 'Logged in successfully', token: 'mock_demo_token', user: MOCK_USERS[0] } as unknown as T;
  }

  if (cleanUrl === '/seller/dashboard') {
    return {
      kpis: { activeListings: allListings.length, pendingRequests: 3, completedSales: 42, totalRevenue: 680000 },
      recentRequests: [],
      myListings: allListings.slice(0, 3),
      recentOrders: [],
      analytics: {
        monthlySales: MOCK_IMPACT.monthlyTrends.map(m => ({ month: m.month, revenue: m.weightKg * 20, orders: m.transactions })),
        categoryBreakdown: MOCK_IMPACT.categoryBreakdown.map(c => ({ name: c.category, value: c.weightKg })),
      },
    } as unknown as T;
  }

  if (cleanUrl === '/matching/recommendations') {
    return {
      recommendations: allListings,
      totalMatches: allListings.length,
      buyerContext: { city: 'Kolkata' },
    } as unknown as T;
  }

  if (cleanUrl === '/notifications') {
    return { notifications: [], unreadCount: 0 } as unknown as T;
  }

  // Sample Order Mock
  const sampleOrder: Order = {
    id: 'ord-demo-101',
    orderNumber: 'ECLP-2026-892',
    buyerId: MOCK_USERS[1].id,
    sellerId: MOCK_USERS[0].id,
    materialId: allListings[0].id,
    quantity: 1200,
    unitPrice: 14.5,
    baseAmount: 17400,
    platformFee: 522,
    logisticsFee: 450,
    totalAmount: 18372,
    paymentStatus: 'PAID',
    deliveryStatus: 'IN_TRANSIT',
    pickupMethod: 'EcoLoop Logistics',
    shippingAddress: 'Sector V Industrial Hub, Salt Lake, Kolkata',
    trackingNotes: 'Commercial trade order',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    buyer: MOCK_USERS[1],
    seller: MOCK_USERS[0],
    material: allListings[0],
  };

  if (cleanUrl === '/orders' && method === 'GET') {
    return { orders: [sampleOrder] } as unknown as T;
  }

  if (cleanUrl.startsWith('/orders/') && method === 'GET') {
    return { order: sampleOrder } as unknown as T;
  }

  if (cleanUrl.startsWith('/checkout/') && method === 'GET') {
    return { order: sampleOrder } as unknown as T;
  }

  if (cleanUrl.includes('/pay') && method === 'POST') {
    const mockPayment: Payment = {
      id: 'pay-' + Date.now(),
      orderId: sampleOrder.id,
      amount: sampleOrder.totalAmount,
      paymentMethod: 'UPI',
      transactionRef: 'TXN-ECLP-' + Math.floor(100000 + Math.random() * 900000),
      status: 'SUCCESS',
      paidAt: new Date().toISOString(),
    };
    return {
      message: 'Simulated escrow payment confirmed!',
      payment: mockPayment,
      order: { ...sampleOrder, paymentStatus: 'PAID' },
      impactRecord: { quantityKg: 1200, co2SavedKg: 1800, waterSavedLiters: 45000 },
    } as unknown as T;
  }

  if (cleanUrl === '/requests' && method === 'POST') {
    return {
      message: 'Purchase request sent successfully!',
      request: {
        id: 'req-' + Date.now(),
        materialId: allListings[0].id,
        buyerId: MOCK_USERS[1].id,
        quantity: 500,
        offeredPrice: 14.0,
        pickupMethod: 'EcoLoop Logistics',
        message: 'Requesting immediate dispatch',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        buyer: MOCK_USERS[1],
        material: allListings[0],
      }
    } as unknown as T;
  }

  if (cleanUrl === '/requests/seller' || cleanUrl === '/requests/buyer') {
    return { requests: [] } as unknown as T;
  }

  if (cleanUrl === '/messages/conversations') {
    return {
      conversations: [
        {
          id: 'conv-1',
          user1Id: MOCK_USERS[0].id,
          user2Id: MOCK_USERS[1].id,
          lastMessage: 'Rate counter-offer confirmed at ₹14.50/kg.',
          lastMessageAt: new Date().toISOString(),
          unreadCount: 0,
          otherUser: MOCK_USERS[1],
          request: {
            id: 'req-1',
            material: allListings[0],
          }
        }
      ]
    } as unknown as T;
  }

  if (cleanUrl.startsWith('/messages/conversation/')) {
    return {
      conversation: { id: 'conv-1', otherUser: MOCK_USERS[1], request: { material: allListings[0] } },
      messages: [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: MOCK_USERS[1].id,
          receiverId: MOCK_USERS[0].id,
          content: 'Hello! Is this batch of cardboard trimmings baled and moisture tested?',
          isNegotiation: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          sender: MOCK_USERS[1],
        },
        {
          id: 'msg-2',
          conversationId: 'conv-1',
          senderId: MOCK_USERS[0].id,
          receiverId: MOCK_USERS[1].id,
          content: 'Yes, moisture is below 6.5% and baled in 250kg cubes ready for truckload dispatch.',
          isNegotiation: true,
          proposedPrice: 14.5,
          createdAt: new Date().toISOString(),
          sender: MOCK_USERS[0],
        }
      ]
    } as unknown as T;
  }

  if (cleanUrl === '/profile/me') {
    return { profile: MOCK_USERS[0] } as unknown as T;
  }

  if (cleanUrl === '/saved') {
    return { savedListings: [] } as unknown as T;
  }

  return null;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('ecoloop_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type') || '';
    // If Vercel or proxy returned HTML (such as index.html rewrite), use safe mock fallback
    if (contentType.includes('text/html')) {
      const fallback = getMockFallback<T>(url, options);
      if (fallback !== null) return fallback;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok || !data) {
      const fallback = getMockFallback<T>(url, options);
      if (fallback !== null) return fallback;
      throw new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    const fallback = getMockFallback<T>(url, options);
    if (fallback !== null) return fallback;
    throw err;
  }
}

export const api = {
  auth: {
    signup: (body: any) => fetchJson<{ message: string; token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    login: (body: any) => fetchJson<{ message: string; token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    logout: () => fetchJson<{ message: string }>('/auth/logout', { method: 'POST' }),
    me: async () => {
      try {
        const res = await fetchJson<{ user: User }>('/auth/me');
        if (res && res.user) return res;
        return { user: MOCK_USERS[0] };
      } catch {
        return { user: MOCK_USERS[0] };
      }
    },
  },

  profile: {
    getMe: () => fetchJson<{ profile: User }>('/profile/me'),
    updateMe: (body: any) => fetchJson<{ message: string; profile: User }>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    getPublic: (id: string) => fetchJson<{ profile: User }>(`/profile/public/${id}`),
  },

  materials: {
    getAll: async (params: Record<string, any> = {}) => {
      try {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            searchParams.append(key, String(val));
          }
        });
        const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
        const res = await fetchJson<{ listings: MaterialListing[]; total: number }>(`/materials${query}`);
        if (res && Array.isArray(res.listings)) {
          if (res.listings.length === 0 && (params.search || params.category || params.city || params.condition || params.minPrice || params.maxPrice)) {
            return res;
          }
          if (res.listings.length > 0) {
            return res;
          }
        }
        const fallbackListings = getLocalListings();
        return { listings: fallbackListings, total: fallbackListings.length };
      } catch {
        const fallbackListings = getLocalListings();
        return { listings: fallbackListings, total: fallbackListings.length };
      }
    },
    getById: async (id: string) => {
      try {
        const res = await fetchJson<{ listing: MaterialListing; aiMatch: MatchResult | null; related: MaterialListing[] }>(`/materials/${id}`);
        if (res && res.listing) return res;
        const all = getLocalListings();
        const found = all.find(m => m.id === id) || all[0];
        return { listing: found, aiMatch: MOCK_MATCH, related: all.slice(1, 4) };
      } catch {
        const all = getLocalListings();
        const found = all.find(m => m.id === id) || all[0];
        return { listing: found, aiMatch: MOCK_MATCH, related: all.slice(1, 4) };
      }
    },
    getMyListings: () => fetchJson<{ listings: MaterialListing[] }>('/materials/seller/my-listings'),
    create: (body: any) => fetchJson<{ message: string; listing: MaterialListing }>('/materials', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    update: (id: string, body: any) => fetchJson<{ message: string; listing: MaterialListing }>(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
    delete: (id: string) => fetchJson<{ message: string }>(`/materials/${id}`, { method: 'DELETE' }),
  },

  matching: {
    getRecommendations: async () => {
      try {
        const res = await fetchJson<{ recommendations: MaterialListing[]; totalMatches: number; buyerContext: any }>('/matching/recommendations');
        if (res && Array.isArray(res.recommendations)) return res;
        const all = getLocalListings();
        return { recommendations: all, totalMatches: all.length, buyerContext: { city: 'Kolkata' } };
      } catch {
        const all = getLocalListings();
        return { recommendations: all, totalMatches: all.length, buyerContext: { city: 'Kolkata' } };
      }
    },
    getMaterialMatch: (id: string) => fetchJson<{ match: MatchResult }>(`/matching/material/${id}`),
    getBuyersForListing: (listingId: string) => fetchJson<{ matchedBuyers: Array<{ buyer: User; aiMatch: MatchResult }> }>(`/matching/buyers-for-listing/${listingId}`),
  },

  requests: {
    create: (body: any) => fetchJson<{ message: string; request: MaterialRequest }>('/requests', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
    getSellerRequests: () => fetchJson<{ requests: MaterialRequest[] }>('/requests/seller'),
    getBuyerRequests: () => fetchJson<{ requests: MaterialRequest[] }>('/requests/buyer'),
    updateStatus: (id: string, body: { status: string; counterPrice?: number; counterNotes?: string }) =>
      fetchJson<{ message: string; request: MaterialRequest; order?: Order }>(`/requests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },

  messages: {
    getConversations: () => fetchJson<{ conversations: Conversation[] }>('/messages/conversations'),
    getConversation: (id: string) => fetchJson<{ conversation: any; messages: Message[] }>(`/messages/conversation/${id}`),
    send: (body: { conversationId?: string; receiverId?: string; content: string; isNegotiation?: boolean; proposedPrice?: number }) =>
      fetchJson<{ message: Message }>('/messages/send', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  orders: {
    getAll: (params: { status?: string; role?: string } = {}) => {
      const searchParams = new URLSearchParams();
      if (params.status) searchParams.append('status', params.status);
      if (params.role) searchParams.append('role', params.role);
      const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return fetchJson<{ orders: Order[] }>(`/orders${query}`);
    },
    getById: (id: string) => fetchJson<{ order: Order }>(`/orders/${id}`),
    updateDeliveryStatus: (id: string, body: { deliveryStatus: string; trackingNotes?: string }) =>
      fetchJson<{ message: string; order: Order }>(`/orders/${id}/delivery-status`, {
        method: 'PUT',
        body: JSON.stringify(body),
      }),
  },

  checkout: {
    getOrder: (orderId: string) => fetchJson<{ order: Order }>(`/checkout/${orderId}`),
    pay: (orderId: string, body: { paymentMethod: string; paymentDetails?: any }) =>
      fetchJson<{ message: string; payment: Payment; order: Order; impactRecord: any }>(`/checkout/${orderId}/pay`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
  },

  seller: {
    getDashboard: () => fetchJson<{
      kpis: { activeListings: number; pendingRequests: number; completedSales: number; totalRevenue: number };
      recentRequests: MaterialRequest[];
      myListings: MaterialListing[];
      recentOrders: Order[];
      analytics: {
        monthlySales: Array<{ month: string; revenue: number; orders: number }>;
        categoryBreakdown: Array<{ name: string; value: number }>;
      };
    }>('/seller/dashboard'),
  },

  impact: {
    getSummary: () => fetchJson<ImpactSummary>('/impact/summary'),
  },

  saved: {
    getSaved: () => fetchJson<{ savedListings: MaterialListing[] }>('/saved'),
    save: (listingId: string) => fetchJson<{ message: string; isSaved: boolean }>(`/saved/${listingId}`, { method: 'POST' }),
    unsave: (listingId: string) => fetchJson<{ message: string; isSaved: boolean }>(`/saved/${listingId}`, { method: 'DELETE' }),
  },

  notifications: {
    getAll: () => fetchJson<{ notifications: Notification[]; unreadCount: number }>('/notifications'),
    markRead: (id: string) => fetchJson<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),
    markAllRead: () => fetchJson<{ success: boolean }>('/notifications/mark-all-read', { method: 'PUT' }),
  },
};
