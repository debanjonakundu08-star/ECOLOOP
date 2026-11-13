export type UserRole = 'BUYER' | 'SELLER';

export interface User {
  id: string;
  email: string;
  businessName: string;
  role?: UserRole;
  contactPerson?: string;
  phone: string;
  city: string;
  address?: string;
  category: string;
  bio?: string;
  isVerified: boolean;
  createdAt?: string;
  preferences?: BuyerPreference;
  _count?: {
    listings?: number;
    buyerOrders?: number;
    sellerOrders?: number;
    sellerRequests?: number;
    savedListings?: number;
  };
}

export interface BuyerPreference {
  id: string;
  userId: string;
  preferredCategories: string;
  preferredCities: string;
  maxBudget?: number | null;
  typicalQuantity?: number | null;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  isPrimary: boolean;
}

export interface MaterialListing {
  id: string;
  sellerId: string;
  category: string;
  title: string;
  description: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  condition: string;
  locationCity: string;
  locationAddress: string;
  availability: string;
  minOrderQuantity: number;
  status: 'ACTIVE' | 'RESERVED' | 'SOLD' | 'EXPIRED';
  createdAt: string;
  updatedAt: string;
  images: ListingImage[];
  seller?: {
    id: string;
    businessName: string;
    city: string;
    category?: string;
    address?: string;
    bio?: string;
    isVerified: boolean;
    phone?: string;
    _count?: {
      listings: number;
      sellerOrders: number;
    };
  };
  _count?: {
    requests: number;
    orders: number;
  };
}

export interface MaterialRequest {
  id: string;
  materialId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  offeredPrice: number;
  pickupMethod: string;
  message: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'NEGOTIATING' | 'COUNTERED';
  counterPrice?: number | null;
  counterNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  material: MaterialListing;
  buyer: {
    id: string;
    businessName: string;
    email?: string;
    phone: string;
    city: string;
    category: string;
    isVerified?: boolean;
    address?: string;
  };
  seller?: {
    id: string;
    businessName: string;
    phone: string;
    city: string;
    category: string;
  };
  orders?: Order[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId?: string;
  content: string;
  isNegotiation: boolean;
  proposedPrice?: number | null;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    businessName: string;
    city: string;
  };
}

export interface Conversation {
  id: string;
  buyerId?: string;
  sellerId?: string;
  user1Id?: string;
  user2Id?: string;
  otherUser: {
    id: string;
    businessName: string;
    city: string;
    category: string;
    isVerified: boolean;
  };
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  request?: {
    id: string;
    quantity: number;
    offeredPrice: number;
    status: string;
    material: MaterialListing;
  };
  materialId?: string;
  material?: MaterialListing;
}

export interface Order {
  id: string;
  orderNumber: string;
  requestId?: string;
  materialId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  baseAmount: number;
  platformFee: number;
  logisticsFee: number;
  totalAmount: number;
  pickupMethod: string;
  shippingAddress?: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  deliveryStatus: 'PROCESSING' | 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  trackingNotes?: string;
  createdAt: string;
  updatedAt: string;
  material: MaterialListing;
  buyer: {
    id: string;
    businessName: string;
    city: string;
    address?: string;
    phone: string;
    email?: string;
    category?: string;
  };
  seller: {
    id: string;
    businessName: string;
    city: string;
    address?: string;
    phone: string;
    email?: string;
    category?: string;
  };
  payment?: Payment | null;
  impactRecord?: ImpactRecord | null;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: 'UPI' | 'CARD' | 'NETBANKING' | 'BANK_TRANSFER';
  transactionRef: string;
  status: 'SUCCESS' | 'FAILED';
  paidAt: string;
}

export interface ImpactRecord {
  id: string;
  orderId?: string;
  materialCategory: string;
  quantityKg: number;
  co2SavedKg: number;
  landfillDivertedKg: number;
  waterSavedLiters: number;
  treesEquivalent: number;
  transactionValue: number;
  recordedAt: string;
}

export interface ImpactSummary {
  metrics: {
    totalMaterialsReusedKg: number;
    totalMaterialsReusedTons: number;
    totalCo2SavedKg: number;
    totalLandfillDivertedKg: number;
    totalWaterSavedLiters: number;
    totalTreesEquivalent: number;
    totalValueExchanged: number;
    completedTransactions: number;
  };
  categoryBreakdown: Array<{
    category: string;
    weightKg: number;
    co2Kg: number;
    value: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    weightKg: number;
    co2Kg: number;
    transactions: number;
  }>;
  disclaimer: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
