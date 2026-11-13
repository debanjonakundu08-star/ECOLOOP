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
} from '../types';

import { MOCK_LISTINGS, MOCK_USERS, MOCK_IMPACT } from './mockData';
import { getCategoryFallbackImage, isLegacyStockUrl } from '../utils/categoryImages';

const BASE_URL = '/api';

export function getSessionId(): string {
  try {
    let sid = localStorage.getItem('ecoloop_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
      localStorage.setItem('ecoloop_session_id', sid);
    }
    return sid;
  } catch {
    return 'sess_default';
  }
}

function getMockUser(): User | null {
  try {
    const savedUser = localStorage.getItem('ecoloop_mock_user');
    if (savedUser) {
      return JSON.parse(savedUser) as User;
    }
    const token = localStorage.getItem('ecoloop_token');
    if (token && token.startsWith('mock_token_')) {
      const sid = getSessionId();
      return {
        ...MOCK_USERS[1],
        id: 'usr_buyer_' + sid,
        email: `buyer_${sid}@demo.ecoloop.com`,
        role: 'BUYER',
      };
    }
  } catch {}
  return null;
}

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
        const cleanEditUrl = edits.imageUrl && !isLegacyStockUrl(edits.imageUrl) ? edits.imageUrl : '';
        return {
          ...item,
          ...edits,
          seller: {
            ...(item.seller || {}),
            businessName: edits.companyName || edits.seller?.businessName || item.seller?.businessName || 'Enterprise Partner',
            city: edits.locationCity || item.seller?.city || 'Kolkata',
          },
          images: cleanEditUrl
            ? [{ id: 'img-edit-' + item.id, listingId: item.id, url: cleanEditUrl, isPrimary: true }]
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
    const queryPart = url.includes('?') ? url.split('?')[1] : '';
    const searchParams = new URLSearchParams(queryPart);
    const categoryParam = searchParams.get('category');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const searchParam = searchParams.get('search');
    const conditionParam = searchParams.get('condition');
    const cityParam = searchParams.get('city');

    let filtered = allListings;

    if (categoryParam && categoryParam !== 'All') {
      const catLower = categoryParam.toLowerCase();
      filtered = filtered.filter((item) => {
        const itemCat = (item.category || '').toLowerCase();
        if (catLower === 'paper' || catLower === 'cardboard' || catLower === 'paper/cardboard') {
          return itemCat.includes('paper') || itemCat.includes('cardboard');
        }
        return itemCat === catLower || itemCat.includes(catLower);
      });
    }

    if (minPriceParam !== null && minPriceParam !== '') {
      const minVal = parseFloat(minPriceParam);
      if (!isNaN(minVal)) {
        filtered = filtered.filter((item) => Number(item.pricePerUnit) >= minVal);
      }
    }

    if (maxPriceParam !== null && maxPriceParam !== '') {
      const maxVal = parseFloat(maxPriceParam);
      if (!isNaN(maxVal)) {
        filtered = filtered.filter((item) => Number(item.pricePerUnit) <= maxVal);
      }
    }

    if (conditionParam && conditionParam !== 'All') {
      filtered = filtered.filter((item) => item.condition === conditionParam);
    }

    if (cityParam) {
      filtered = filtered.filter((item) => (item.locationCity || '').toLowerCase().includes(cityParam.toLowerCase()));
    }

    if (searchParam) {
      const q = searchParam.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.title || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.category || '').toLowerCase().includes(q)
      );
    }

    return { listings: filtered, total: filtered.length } as unknown as T;
  }

  if (cleanUrl.startsWith('/materials/') && (method === 'PUT' || method === 'PATCH')) {
    const id = cleanUrl.replace('/materials/', '');
    const currentUser = getMockUser();
    const existing = allListings.find(m => m.id === id);
    if (!currentUser || !existing || existing.sellerId !== currentUser.id) {
      throw new Error('Only the business that listed this item can edit it.');
    }
    const body = options.body ? JSON.parse(options.body as string) : {};
    try {
      const editedMap = JSON.parse(localStorage.getItem('ecoloop_edited_listings') || '{}');
      editedMap[id] = {
        ...editedMap[id],
        ...body,
      };
      localStorage.setItem('ecoloop_edited_listings', JSON.stringify(editedMap));
    } catch {
      throw new Error('Browser storage limit reached. Try using a smaller image or an image URL.');
    }
    const updated = getLocalListings().find(m => m.id === id) || existing;
    return { message: 'Listing updated successfully', listing: updated } as unknown as T;
  }

  if (cleanUrl === '/materials' && method === 'POST') {
    const currentUser = getMockUser();
    if (!currentUser) {
      throw new Error('Please log in to list waste materials.');
    }
    const body = options.body ? JSON.parse(options.body as string) : {};
    const sellerCompanyName = body.companyName || body.businessName || currentUser.businessName || 'Your Enterprise';
    const listingId = 'custom-' + Date.now();
    const newListing: MaterialListing = {
      id: listingId,
      sellerId: currentUser.id,
      title: body.title || 'Custom Listed Lot',
      description: body.description || 'Pre-inspected surplus material batch',
      category: body.category || 'Paper/Cardboard',
      quantity: parseFloat(body.quantity) || 500,
      unit: body.unit || 'kg',
      pricePerUnit: parseFloat(body.pricePerUnit) || 12.5,
      minOrderQuantity: parseFloat(body.minOrderQuantity) || 50,
      condition: body.condition || 'Clean / High Grade',
      locationCity: body.locationCity || currentUser.city || 'Kolkata',
      locationAddress: body.locationAddress || currentUser.address || 'Sector V, Salt Lake',
      availability: body.availability || 'Immediate',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      seller: {
        id: currentUser.id,
        businessName: sellerCompanyName,
        city: body.locationCity || currentUser.city,
        category: body.category || currentUser.category,
        address: body.locationAddress || currentUser.address,
        bio: currentUser.bio || 'Verified business on EcoLoop',
        isVerified: true,
        phone: currentUser.phone || '+91 98301 22334',
        _count: {
          listings: 1,
          sellerOrders: 0,
        },
      },
      images: [
        {
          id: 'img-' + Date.now(),
          listingId,
          url: body.imageUrl || body.images?.[0] || getCategoryFallbackImage(body.category, body.title),
          isPrimary: true,
        }
      ]
    };
    try {
      const existing = JSON.parse(localStorage.getItem('ecoloop_custom_listings') || '[]');
      localStorage.setItem('ecoloop_custom_listings', JSON.stringify([newListing, ...existing]));
    } catch {
      throw new Error('Browser storage limit reached. Try using a smaller photo or an image URL.');
    }
    return { message: 'Material published successfully!', listing: newListing } as unknown as T;
  }

  if (cleanUrl.startsWith('/materials/') && method === 'GET') {
    const id = cleanUrl.replace('/materials/', '');
    const found = allListings.find(m => m.id === id) || allListings[0];
    return {
      listing: found,
      related: allListings.filter(m => m.id !== found.id).slice(0, 3),
    } as unknown as T;
  }

  if (cleanUrl.startsWith('/materials/') && method === 'PUT') {
    const id = cleanUrl.replace('/materials/', '');
    const currentUser = getMockUser();
    if (!currentUser) {
      const err = new Error('Authentication required: Please log in to edit listings.');
      (err as any).isApiError = true;
      throw err;
    }
    const existing = allListings.find(m => m.id === id);
    if (!existing) {
      const err = new Error('Listing not found.');
      (err as any).isApiError = true;
      throw err;
    }
    // Strict ownership verification: only original poster can edit
    if (existing.sellerId && existing.sellerId !== currentUser.id) {
      const err = new Error('Access denied (403): Only the original owner who listed this item can edit it.');
      (err as any).isApiError = true;
      throw err;
    }
    const body = options.body ? JSON.parse(options.body as string) : {};
    const editedMap = JSON.parse(localStorage.getItem('ecoloop_edited_listings') || '{}');
    editedMap[id] = { ...(editedMap[id] || {}), ...body };
    localStorage.setItem('ecoloop_edited_listings', JSON.stringify(editedMap));

    try {
      const custom = JSON.parse(localStorage.getItem('ecoloop_custom_listings') || '[]');
      const updatedCustom = custom.map((c: any) => c.id === id ? { ...c, ...body } : c);
      localStorage.setItem('ecoloop_custom_listings', JSON.stringify(updatedCustom));
    } catch {}

    const updatedListing = {
      ...existing,
      ...body,
      sellerId: existing.sellerId || currentUser.id,
      seller: {
        ...(existing.seller || {}),
        businessName: body.companyName || existing.seller?.businessName || currentUser.businessName,
      },
    };
    return { message: 'Listing updated successfully.', listing: updatedListing } as unknown as T;
  }

  if (cleanUrl.startsWith('/materials/') && method === 'DELETE') {
    const id = cleanUrl.replace('/materials/', '');
    const currentUser = getMockUser();
    if (!currentUser) {
      const err = new Error('Authentication required: Please log in to delete listings.');
      (err as any).isApiError = true;
      throw err;
    }
    const existing = allListings.find(m => m.id === id);
    if (existing && existing.sellerId && existing.sellerId !== currentUser.id) {
      const err = new Error('Access denied (403): Only the original owner who listed this item can delete it.');
      (err as any).isApiError = true;
      throw err;
    }
    try {
      const custom = JSON.parse(localStorage.getItem('ecoloop_custom_listings') || '[]');
      localStorage.setItem('ecoloop_custom_listings', JSON.stringify(custom.filter((c: any) => c.id !== id)));
    } catch {}
    return { message: 'Listing removed successfully.' } as unknown as T;
  }

  if (cleanUrl === '/materials/seller/my-listings' && method === 'GET') {
    const currentUser = getMockUser();
    const myListings = currentUser ? allListings.filter(m => m.sellerId === currentUser.id) : [];
    return { listings: myListings } as unknown as T;
  }

  if (cleanUrl === '/impact/summary') {
    return MOCK_IMPACT as unknown as T;
  }

  if (cleanUrl === '/auth/me') {
    return { user: getMockUser() } as unknown as T;
  }

  if (cleanUrl === '/auth/login') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const email = (body.email || '').toLowerCase().trim();
    let registered: User[] = [];
    try {
      registered = JSON.parse(localStorage.getItem('ecoloop_registered_users') || '[]');
    } catch {}
    const selectedRole = (body.role || '').toUpperCase() === 'SELLER' ? 'SELLER' : 'BUYER';
    let user = registered.find(u => u.email.toLowerCase() === email);
    const sid = getSessionId();
    if (!user) {
      if (email === 'purchase@greentechpolymers.in' || email === 'buyer@ecoloop.com' || (!email && selectedRole === 'BUYER')) {
        user = {
          ...MOCK_USERS[1],
          id: 'usr_buyer_' + sid,
          email: `buyer_${sid}@demo.ecoloop.com`,
          role: 'BUYER',
        };
      } else if (email === 'greenpack@ecoloop.com' || email === 'seller@ecoloop.com' || email === 'packaging@bengaleco.in' || (!email && selectedRole === 'SELLER')) {
        user = {
          ...MOCK_USERS[0],
          id: 'usr_seller_' + sid,
          email: `seller_${sid}@demo.ecoloop.com`,
          role: 'SELLER',
        };
      } else if (email) {
        // Fallback persistent business account derived from email
        user = {
          id: 'usr_' + email.replace(/[^a-z0-9]/g, '_') + '_' + sid,
          businessName: email.split('@')[0].replace(/[^a-zA-Z0-9 ]/g, ' ').toUpperCase(),
          email,
          role: selectedRole,
          phone: '+91 98300 00000',
          city: 'Kolkata',
          category: 'Packaging materials',
          isVerified: true,
          createdAt: new Date().toISOString(),
        };
        try {
          localStorage.setItem('ecoloop_registered_users', JSON.stringify([...registered, user]));
        } catch {}
      } else {
        throw new Error('Please enter your business email and password.');
      }
    } else if (body.role && user.role !== selectedRole) {
      user = { ...user, role: selectedRole };
    }
    const token = 'mock_token_' + user.id;
    try {
      localStorage.setItem('ecoloop_mock_user', JSON.stringify(user));
      localStorage.setItem('ecoloop_token', token);
    } catch {}
    return { message: 'Logged in successfully', token, user } as unknown as T;
  }

  if (cleanUrl === '/auth/signup') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    if (body.password && body.confirmPassword && body.password !== body.confirmPassword) {
      throw new Error('Passwords do not match.');
    }
    const email = (body.email || '').toLowerCase().trim();
    let registered: User[] = [];
    try {
      registered = JSON.parse(localStorage.getItem('ecoloop_registered_users') || '[]');
    } catch {}
    const existing = registered.find(u => u.email.toLowerCase() === email) ||
      MOCK_USERS.find(u => u.email.toLowerCase() === email);
    if (existing) {
      throw new Error('A business with this email already exists.');
    }
    const assignedRole = (body.role || '').toUpperCase() === 'SELLER' ? 'SELLER' : 'BUYER';
    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      businessName: body.businessName?.trim() || 'EcoLoop Enterprise',
      email,
      role: assignedRole,
      contactPerson: body.contactPerson?.trim() || undefined,
      phone: body.phone?.trim() || '+91 98300 00000',
      city: body.city || 'Kolkata',
      address: body.address?.trim() || undefined,
      category: body.category || 'Packaging materials',
      bio: body.bio?.trim() || undefined,
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    const token = 'mock_token_' + newUser.id;
    try {
      localStorage.setItem('ecoloop_registered_users', JSON.stringify([...registered, newUser]));
      localStorage.setItem('ecoloop_mock_user', JSON.stringify(newUser));
      localStorage.setItem('ecoloop_token', token);
    } catch {}
    return { message: 'Account registered successfully', token, user: newUser } as unknown as T;
  }

  if (cleanUrl === '/seller/dashboard') {
    const currentUser = getMockUser();
    const myListings = currentUser ? allListings.filter(m => m.sellerId === currentUser.id) : [];
    const soldListings = myListings.filter(m => m.availability === 'SOLD');
    const availableListings = myListings.filter(m => m.availability !== 'SOLD');
    return {
      kpis: {
        totalListings: myListings.length,
        activeListings: availableListings.length,
        soldItems: soldListings.length,
        availableItems: availableListings.length,
        buyerEnquiries: 0,
        pendingRequests: 0,
        completedSales: 0,
        totalRevenue: 0,
      },
      recentRequests: [],
      myListings,
      recentOrders: [],
      analytics: {
        monthlySales: MOCK_IMPACT.monthlyTrends.map(m => ({ month: m.month, revenue: m.weightKg * 20, orders: m.transactions })),
        categoryBreakdown: MOCK_IMPACT.categoryBreakdown.map(c => ({ name: c.category, value: c.weightKg })),
      },
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
    const currentUser = getMockUser();
    let orders: Order[] = [];
    try {
      orders = JSON.parse(localStorage.getItem('ecoloop_custom_orders') || '[]');
    } catch {}

    if (currentUser) {
      orders = orders.filter(o => currentUser.role === 'SELLER' ? o.sellerId === currentUser.id : o.buyerId === currentUser.id);
      if (currentUser.id === MOCK_USERS[1].id) {
        orders.push(sampleOrder);
      }
    }
    return { orders } as unknown as T;
  }

  if (cleanUrl.startsWith('/orders/') && method === 'DELETE') {
    const orderId = cleanUrl.replace('/orders/', '');
    try {
      const stored = JSON.parse(localStorage.getItem('ecoloop_custom_orders') || '[]');
      const filtered = stored.filter((o: any) => o.id !== orderId);
      localStorage.setItem('ecoloop_custom_orders', JSON.stringify(filtered));
    } catch {}
    return { message: 'Order removed successfully.', id: orderId } as unknown as T;
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

  if (cleanUrl.startsWith('/requests/') && method === 'DELETE') {
    const reqId = cleanUrl.replace('/requests/', '');
    try {
      const stored = JSON.parse(localStorage.getItem('ecoloop_buyer_requests') || '[]');
      const filtered = stored.filter((r: any) => r.id !== reqId);
      localStorage.setItem('ecoloop_buyer_requests', JSON.stringify(filtered));
    } catch {}
    return { message: 'Purchase offer cancelled and removed.', id: reqId } as unknown as T;
  }

  if (cleanUrl === '/requests' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const currentUser = getMockUser() || MOCK_USERS[1];
    const targetMaterial = allListings.find(m => m.id === body.materialId) || allListings[0];
    const newReq: MaterialRequest = {
      id: 'req-' + Date.now(),
      materialId: targetMaterial.id,
      buyerId: currentUser.id,
      sellerId: targetMaterial.sellerId || MOCK_USERS[0].id,
      quantity: parseFloat(body.quantity) || 500,
      offeredPrice: parseFloat(body.offeredPrice) || 14.0,
      pickupMethod: body.pickupMethod || 'EcoLoop Logistics',
      message: body.message || 'Requesting dispatch',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      buyer: currentUser as any,
      seller: (targetMaterial.seller || MOCK_USERS[0]) as any,
      material: targetMaterial,
    };
    try {
      const stored = JSON.parse(localStorage.getItem('ecoloop_buyer_requests') || '[]');
      localStorage.setItem('ecoloop_buyer_requests', JSON.stringify([newReq, ...stored]));
    } catch {}
    return {
      message: 'Purchase request sent successfully!',
      request: newReq,
    } as unknown as T;
  }

  if (cleanUrl === '/requests/buyer' && method === 'GET') {
    const currentUser = getMockUser();
    let custom: MaterialRequest[] = [];
    try {
      custom = JSON.parse(localStorage.getItem('ecoloop_buyer_requests') || '[]');
    } catch {}

    // Strictly filter custom requests by current logged in user ID
    let userRequests = currentUser
      ? custom.filter((r) => r.buyerId === currentUser.id)
      : [];

    const defaultBuyerRequests: MaterialRequest[] = [
      {
        id: 'req-demo-accepted',
        materialId: allListings[0]?.id || 'mat-1',
        buyerId: MOCK_USERS[1].id,
        sellerId: allListings[0]?.sellerId || MOCK_USERS[0].id,
        quantity: 1200,
        offeredPrice: 14.5,
        pickupMethod: 'EcoLoop Logistics',
        message: 'Looking for prompt batch collection.',
        status: 'ACCEPTED',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        buyer: MOCK_USERS[1],
        seller: allListings[0]?.seller || MOCK_USERS[0],
        material: allListings[0],
        orderId: 'ord-demo-101',
      } as any,
      {
        id: 'req-demo-countered',
        materialId: allListings[1]?.id || 'mat-2',
        buyerId: MOCK_USERS[1].id,
        sellerId: allListings[1]?.sellerId || MOCK_USERS[0].id,
        quantity: 800,
        offeredPrice: 22.0,
        counterPrice: 24.5,
        counterNotes: 'We can supply washed & baled grade at ₹24.50/kg.',
        pickupMethod: 'Self Pickup',
        message: 'Need monthly recurring delivery.',
        status: 'COUNTERED',
        createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        buyer: MOCK_USERS[1],
        seller: allListings[1]?.seller || MOCK_USERS[0],
        material: allListings[1],
      },
      {
        id: 'req-demo-pending',
        materialId: allListings[2]?.id || 'mat-3',
        buyerId: MOCK_USERS[1].id,
        sellerId: allListings[2]?.sellerId || MOCK_USERS[0].id,
        quantity: 1500,
        offeredPrice: 38.0,
        pickupMethod: 'EcoLoop Logistics',
        message: 'Formal procurement proposal submitted for evaluation.',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        buyer: MOCK_USERS[1],
        seller: allListings[2]?.seller || MOCK_USERS[0],
        material: allListings[2],
      },
    ];

    // Only include demo requests for the specific demo account
    if (currentUser?.id === MOCK_USERS[1].id) {
      userRequests = [...userRequests, ...defaultBuyerRequests];
    }

    return { requests: userRequests } as unknown as T;
  }

  if (cleanUrl === '/requests/seller' && method === 'GET') {
    const currentUser = getMockUser();
    let custom: MaterialRequest[] = [];
    try {
      custom = JSON.parse(localStorage.getItem('ecoloop_buyer_requests') || '[]');
    } catch {}

    let sellerRequests = currentUser
      ? custom.filter((r) => r.sellerId === currentUser.id)
      : [];

    if (currentUser?.id === MOCK_USERS[0].id) {
      sellerRequests = [
        ...sellerRequests,
        {
          id: 'req-seller-demo-1',
          materialId: allListings[0]?.id || 'mat-1',
          buyerId: MOCK_USERS[1].id,
          sellerId: MOCK_USERS[0].id,
          quantity: 1200,
          offeredPrice: 14.5,
          pickupMethod: 'EcoLoop Logistics',
          message: 'Interested in acquiring 1.2 metric tonnes for pulping.',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          buyer: MOCK_USERS[1],
          seller: MOCK_USERS[0],
          material: allListings[0],
        },
      ];
    }
    return { requests: sellerRequests } as unknown as T;
  }

  if (cleanUrl === '/messages/conversations') {
    const currentUser = getMockUser();
    if (!currentUser) return { conversations: [] } as unknown as T;
    let customConvs: Conversation[] = [];
    try {
      customConvs = JSON.parse(localStorage.getItem(`ecoloop_convs_${currentUser.id}`) || '[]');
    } catch {}
    const scoped = customConvs.filter((c: any) => {
      if (currentUser.role === 'BUYER') {
        return c.buyerId === currentUser.id || (!c.buyerId && c.otherUser?.id !== currentUser.id);
      }
      return c.sellerId === currentUser.id || (!c.sellerId && c.otherUser?.id !== currentUser.id);
    });
    return { conversations: scoped } as unknown as T;
  }

  if (cleanUrl.startsWith('/messages/conversation/')) {
    const convId = cleanUrl.replace('/messages/conversation/', '');
    const currentUser = getMockUser();
    if (!currentUser) return { conversation: null, messages: [] } as unknown as T;
    let customConvs: Conversation[] = [];
    let customMsgs: Message[] = [];
    try {
      customConvs = JSON.parse(localStorage.getItem(`ecoloop_convs_${currentUser.id}`) || '[]');
      customMsgs = JSON.parse(localStorage.getItem(`ecoloop_msgs_${convId}`) || '[]');
    } catch {}
    const found = customConvs.find((c) => c.id === convId) || {
      id: convId,
      buyerId: currentUser.role === 'BUYER' ? currentUser.id : 'usr_buyer_partner',
      sellerId: currentUser.role === 'SELLER' ? currentUser.id : 'usr_seller_1',
      otherUser: currentUser.role === 'BUYER' ? MOCK_USERS[0] : MOCK_USERS[1],
      lastMessage: 'Active enquiry thread',
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
    };
    return {
      conversation: found,
      messages: customMsgs,
    } as unknown as T;
  }

  if (cleanUrl === '/messages/send' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    const currentUser = getMockUser() || MOCK_USERS[0];
    const convId = body.conversationId || ('conv_' + Date.now());
    const isBuyer = currentUser.role === 'BUYER';
    const otherPartner = isBuyer ? MOCK_USERS[0] : MOCK_USERS[1];
    const targetReceiverId = body.receiverId || otherPartner.id;

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      conversationId: convId,
      senderId: currentUser.id,
      receiverId: targetReceiverId,
      content: body.content,
      isNegotiation: body.isNegotiation || false,
      proposedPrice: body.proposedPrice,
      isRead: true,
      createdAt: new Date().toISOString(),
      sender: currentUser,
    };

    try {
      const existingMsgs = JSON.parse(localStorage.getItem(`ecoloop_msgs_${convId}`) || '[]');
      localStorage.setItem(`ecoloop_msgs_${convId}`, JSON.stringify([...existingMsgs, newMsg]));

      const userConvs: Conversation[] = JSON.parse(localStorage.getItem(`ecoloop_convs_${currentUser.id}`) || '[]');
      const existingIndex = userConvs.findIndex((c) => c.id === convId);
      const updatedConv: Conversation = {
        id: convId,
        buyerId: isBuyer ? currentUser.id : targetReceiverId,
        sellerId: isBuyer ? targetReceiverId : currentUser.id,
        user1Id: currentUser.id,
        user2Id: targetReceiverId,
        otherUser: otherPartner,
        lastMessage: body.content,
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
      };

      if (existingIndex >= 0) {
        userConvs[existingIndex] = updatedConv;
      } else {
        userConvs.unshift(updatedConv);
      }
      localStorage.setItem(`ecoloop_convs_${currentUser.id}`, JSON.stringify(userConvs));
    } catch {}

    return { message: newMsg } as unknown as T;
  }

  if (cleanUrl === '/profile/me') {
    return { profile: MOCK_USERS[0] } as unknown as T;
  }

  if (cleanUrl === '/saved' && method === 'GET') {
    let savedIds: string[] = ['mat_1', 'mat_2'];
    try {
      const stored = localStorage.getItem('ecoloop_saved_listings');
      if (stored) savedIds = JSON.parse(stored);
    } catch {}
    const savedListings = allListings.filter(m => savedIds.includes(m.id));
    return { savedListings } as unknown as T;
  }

  if (cleanUrl.startsWith('/saved/') && method === 'POST') {
    const listingId = cleanUrl.replace('/saved/', '');
    let savedIds: string[] = ['mat_1', 'mat_2'];
    try {
      const stored = localStorage.getItem('ecoloop_saved_listings');
      if (stored) savedIds = JSON.parse(stored);
      if (!savedIds.includes(listingId)) savedIds.push(listingId);
      localStorage.setItem('ecoloop_saved_listings', JSON.stringify(savedIds));
    } catch {}
    return { message: 'Item added to wishlist', isSaved: true } as unknown as T;
  }

  if (cleanUrl.startsWith('/saved/') && method === 'DELETE') {
    const listingId = cleanUrl.replace('/saved/', '');
    let savedIds: string[] = ['mat_1', 'mat_2'];
    try {
      const stored = localStorage.getItem('ecoloop_saved_listings');
      if (stored) savedIds = JSON.parse(stored);
      savedIds = savedIds.filter(id => id !== listingId);
      localStorage.setItem('ecoloop_saved_listings', JSON.stringify(savedIds));
    } catch {}
    return { message: 'Item removed from wishlist', isSaved: false } as unknown as T;
  }

  return null;
}

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('ecoloop_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Session-Id': getSessionId(),
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
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const apiErr = new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
        (apiErr as any).isApiError = true;
        throw apiErr;
      }
      const fallback = getMockFallback<T>(url, options);
      if (fallback !== null) return fallback;
      throw new Error(data?.error || data?.message || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (err: any) {
    if (err?.isApiError) throw err;
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
      body: JSON.stringify({ ...body, sessionId: getSessionId() }),
    }),
    logout: () => fetchJson<{ message: string }>('/auth/logout', { method: 'POST' }),
    me: async () => {
      try {
        const res = await fetchJson<{ user: User | null }>('/auth/me');
        if (res && res.user) return res;
        return { user: getMockUser() };
      } catch {
        return { user: getMockUser() };
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
          return res;
        }
        let list = getLocalListings();
        return { listings: list, total: list.length };
      } catch {
        let list = getLocalListings();
        if (params.category && params.category !== 'All') {
          const cat = params.category.toLowerCase();
          list = list.filter((m) => {
            const mCat = (m.category || '').toLowerCase();
            if (cat === 'paper' || cat === 'cardboard' || cat === 'paper/cardboard') {
              return mCat.includes('paper') || mCat.includes('cardboard');
            }
            return mCat === cat || mCat.includes(cat);
          });
        }
        if (params.minPrice !== undefined && params.minPrice !== '') {
          const min = parseFloat(params.minPrice);
          if (!isNaN(min)) list = list.filter((m) => Number(m.pricePerUnit) >= min);
        }
        if (params.maxPrice !== undefined && params.maxPrice !== '') {
          const max = parseFloat(params.maxPrice);
          if (!isNaN(max)) list = list.filter((m) => Number(m.pricePerUnit) <= max);
        }
        if (params.condition && params.condition !== 'All') {
          list = list.filter((m) => m.condition === params.condition);
        }
        if (params.search) {
          const q = params.search.toLowerCase();
          list = list.filter((m) => (m.title || '').toLowerCase().includes(q) || (m.description || '').toLowerCase().includes(q));
        }
        return { listings: list, total: list.length };
      }
    },
    getById: async (id: string) => {
      try {
        const res = await fetchJson<{ listing: MaterialListing; related: MaterialListing[] }>(`/materials/${id}`);
        if (res && res.listing) return res;
        const all = getLocalListings();
        const found = all.find(m => m.id === id) || all[0];
        return { listing: found, related: all.filter(m => m.id !== found.id).slice(0, 3) };
      } catch {
        const all = getLocalListings();
        const found = all.find(m => m.id === id) || all[0];
        return { listing: found, related: all.filter(m => m.id !== found.id).slice(0, 3) };
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
    delete: (id: string) => fetchJson<{ message: string; id: string }>(`/requests/${id}`, { method: 'DELETE' }),
    cancel: (id: string) => fetchJson<{ message: string; id: string }>(`/requests/${id}/cancel`, { method: 'PUT' }),
  },

  messages: {
    getConversations: (params?: { role?: string }) => {
      const query = params?.role ? `?role=${params.role}` : '';
      return fetchJson<{ conversations: Conversation[] }>(`/messages/conversations${query}`);
    },
    getConversation: (id: string) => fetchJson<{ conversation: any; messages: Message[] }>(`/messages/conversation/${id}`),
    send: (body: { conversationId?: string; receiverId?: string; materialId?: string; content: string; isNegotiation?: boolean; proposedPrice?: number }) =>
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
    delete: (id: string) => fetchJson<{ message: string; id: string }>(`/orders/${id}`, { method: 'DELETE' }),
    cancel: (id: string) => fetchJson<{ message: string; order: Order }>(`/orders/${id}/cancel`, { method: 'PUT' }),
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
      kpis: {
        totalListings: number;
        activeListings: number;
        soldItems: number;
        availableItems: number;
        buyerEnquiries: number;
        pendingRequests: number;
        completedSales: number;
        totalRevenue: number;
      };
      recentRequests: MaterialRequest[];
      myListings: MaterialListing[];
      recentOrders: Order[];
      analytics: {
        monthlySales: Array<{ month: string; revenue: number; orders: number }>;
        categoryBreakdown: Array<{ name: string; value: number }>;
      };
      notifications?: Notification[];
      unreadNotificationsCount?: number;
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
