import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { Conversation, Message, MaterialListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { getListingPrimaryImage } from '../utils/categoryImages';
import {
  MessageSquare,
  Send,
  Building2,
  ShieldCheck,
  ArrowRight,
  Clock,
  Tag,
  IndianRupee,
  Layers,
  ExternalLink,
  Store,
  ShoppingCart,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const MessagingPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get('sellerId') || searchParams.get('recipient');
  const directConvId = searchParams.get('conversationId');
  const materialId = searchParams.get('materialId');

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [referencedMaterial, setReferencedMaterial] = useState<MaterialListing | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isNegotiation, setIsNegotiation] = useState(false);
  const [proposedPrice, setProposedPrice] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load referenced material details if materialId is in URL
  useEffect(() => {
    if (materialId) {
      api.materials
        .getById(materialId)
        .then((res) => {
          if (res?.listing) {
            setReferencedMaterial(res.listing);
          }
        })
        .catch((err) => console.error('Failed to load referenced material:', err));
    }
  }, [materialId]);

  const selectConversation = async (convId: string) => {
    try {
      const res = await api.messages.getConversation(convId);
      const conv = res.conversation;
      const currentUserId = user?.id;

      // Strict participant verification guard
      if (conv && currentUserId) {
        const isParticipant =
          conv.buyerId === currentUserId ||
          conv.sellerId === currentUserId ||
          conv.user1Id === currentUserId ||
          conv.user2Id === currentUserId ||
          conv.participant1Id === currentUserId ||
          conv.participant2Id === currentUserId ||
          (conv.otherUser && conv.otherUser.id !== currentUserId);

        if (!isParticipant) {
          console.warn('Unauthorized conversation view blocked.');
          setActiveConv(null);
          setMessages([]);
          return;
        }
      }

      setActiveConv(conv);
      setMessages(Array.isArray(res.messages) ? res.messages : []);
      if (res.conversation?.material) {
        setReferencedMaterial(res.conversation.material);
      }
      scrollToBottom();
    } catch (err) {
      console.error('Failed to load messages for conversation:', err);
      setActiveConv(null);
      setMessages([]);
    }
  };

  const loadConversations = async (autoSelectId?: string) => {
    try {
      const userRole = user?.role;
      const currentUserId = user?.id;

      const res = await api.messages.getConversations({
        role: userRole?.toLowerCase(),
      });
      const rawList = Array.isArray(res.conversations) ? res.conversations : [];

      // Strict participant-only conversation filtering:
      // Buyer: only conversations where buyerId === user.id
      // Seller: only conversations where sellerId === user.id
      const convList = rawList.filter((c: any) => {
        if (!currentUserId) return true;
        if (userRole === 'BUYER') {
          if (c.buyerId) return c.buyerId === currentUserId;
          return c.otherUser?.id !== currentUserId && (c.user1Id === currentUserId || c.participant1Id === currentUserId || c.participant2Id === currentUserId);
        }
        if (userRole === 'SELLER') {
          if (c.sellerId) return c.sellerId === currentUserId;
          return c.otherUser?.id !== currentUserId && (c.user2Id === currentUserId || c.participant1Id === currentUserId || c.participant2Id === currentUserId);
        }
        return c.buyerId === currentUserId || c.sellerId === currentUserId;
      });

      setConversations(convList);

      const targetId = autoSelectId || directConvId;
      if (targetId) {
        selectConversation(targetId);
      } else if (convList.length > 0 && !activeConv) {
        if (recipientId) {
          const match = convList.find(
            (c) => c.user1Id === recipientId || c.user2Id === recipientId || c.otherUser?.id === recipientId
          );
          if (match) {
            selectConversation(match.id);
            return;
          }
        }
        selectConversation(convList[0].id);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations(directConvId || undefined);
  }, [recipientId, directConvId, user?.id, user?.role]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const targetReceiverId = activeConv?.otherUser?.id || recipientId;
      const targetMaterialId = referencedMaterial?.id || activeConv?.materialId;

      const payload: any = {
        conversationId: activeConv?.id,
        receiverId: targetReceiverId,
        materialId: targetMaterialId,
        content: newMessage.trim(),
        isNegotiation,
        proposedPrice: isNegotiation && proposedPrice ? parseFloat(proposedPrice) : undefined,
      };

      const res = await api.messages.send(payload);
      setMessages((prev) => [...prev, res.message]);
      setNewMessage('');
      setIsNegotiation(false);
      setProposedPrice('');
      scrollToBottom();

      // Refresh conversations list to update snippet
      loadConversations(activeConv?.id || res.message.conversationId);
    } catch (err: any) {
      alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const activeMaterial = referencedMaterial || activeConv?.material || activeConv?.request?.material;
  const otherUser = activeConv?.otherUser;

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
                <MessageSquare className="w-3.5 h-3.5" />
                Person-to-Person Direct Messaging
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                {user?.role === 'SELLER' ? 'Seller Hub' : 'Buyer Hub'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2 tracking-tight">
              Buyer–Seller Negotiations &amp; Enquiries
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {user?.role === 'SELLER' ? (
              <Link
                to="/seller/listings"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-ecoDark-surface border border-slate-200 dark:border-emerald-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                My Listings
              </Link>
            ) : (
              <Link
                to="/marketplace"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-ecoDark-surface border border-slate-200 dark:border-emerald-900/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                Browse Catalog
              </Link>
            )}
          </div>
        </div>

        {/* Messaging Two-Panel Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-ecoDark-surface rounded-3xl shadow-card dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/20 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[680px] max-h-[800px] transition-colors"
        >
          {/* Left Panel: Conversations List (4 cols) */}
          <div className="md:col-span-4 border-r border-slate-100 dark:border-emerald-950/60 flex flex-col h-full bg-slate-50/50 dark:bg-ecoDark-card/50">
            <div className="p-4 border-b border-slate-100 dark:border-emerald-950/60 flex items-center justify-between bg-white dark:bg-ecoDark-surface">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Active Dialogues</h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {conversations.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100/80 dark:divide-emerald-950/40">
              {loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading dialogues...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">No active dialogues yet.</p>
                  <p className="text-[11px]">
                    {user?.role === 'SELLER'
                      ? 'Inquiries from buyers will appear here in real-time.'
                      : 'Click "Chat with Seller" from any listing to negotiate.'}
                  </p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => selectConversation(c.id)}
                    className={`w-full p-4 text-left transition-colors flex items-start gap-3 cursor-pointer ${
                      activeConv?.id === c.id
                        ? 'bg-emerald-50/80 dark:bg-ecoDark-hover border-r-4 border-emerald-700 dark:border-emerald-500'
                        : 'hover:bg-slate-100/60 dark:hover:bg-ecoDark-card'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-forest-800 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {c.otherUser?.businessName?.charAt(0) || 'B'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {c.otherUser?.businessName || 'Business Partner'}
                        </h4>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                          {c.lastMessageAt
                            ? new Date(c.lastMessageAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })
                            : ''}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1 leading-snug">
                        {c.lastMessage || 'Open conversation'}
                      </p>

                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-100/60 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">
                          {c.otherUser?.city || 'Verified'}
                        </span>
                        {c.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center ml-auto">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Panel: Chat Window (8 cols) */}
          <div className="md:col-span-8 flex flex-col h-full bg-white dark:bg-ecoDark-surface">
            {activeConv || recipientId ? (
              <>
                {/* 1. Counterparty Header */}
                <div className="p-4 border-b border-slate-100 dark:border-emerald-950/60 flex items-center justify-between bg-white dark:bg-ecoDark-surface z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-900 dark:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {otherUser?.businessName?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                        <span>{otherUser?.businessName || (recipientId ? 'Direct Seller Chat' : 'Counterparty')}</span>
                        {otherUser?.isVerified && (
                          <span title="Verified Enterprise">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <span>{otherUser?.city || 'Verified Facility'}</span>
                        <span>•</span>
                        <span className="capitalize">{otherUser?.role === 'SELLER' ? 'Seller' : 'Buyer'} Account</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Listing Reference Header (Product Card) */}
                {activeMaterial && (
                  <div className="px-4 py-3 bg-emerald-50/80 dark:bg-ecoDark-card border-b border-emerald-100 dark:border-emerald-950/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getListingPrimaryImage(activeMaterial)}
                        alt={activeMaterial.title}
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-200/80 dark:border-emerald-800/40 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                          Inquiry regarding material
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {activeMaterial.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center">
                            <IndianRupee className="w-3 h-3" />
                            {activeMaterial.pricePerUnit} / {activeMaterial.unit || 'kg'}
                          </span>
                          <span>•</span>
                          <span>Lot: {activeMaterial.quantity} {activeMaterial.unit || 'kg'}</span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to={`/materials/${activeMaterial.id}`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-ecoDark-surface hover:bg-slate-50 dark:hover:bg-ecoDark-hover text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <span>View Listing</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                )}

                {/* 3. Messages Body */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-ecoDark-card/30">
                  {messages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                      <p className="font-bold text-slate-600 dark:text-slate-400">No messages yet.</p>
                      <p>Type below to inquire about lot specifications, verify moisture, or propose custom unit rates.</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.senderId === user?.id;

                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 mb-1 px-1">
                            <span>{isMe ? 'You' : m.sender?.businessName || otherUser?.businessName || 'Counterparty'}</span>
                            <span>•</span>
                            <span>
                              {m.createdAt
                                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                : 'Just now'}
                            </span>
                          </div>

                          <div
                            className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isMe
                                ? 'bg-forest-900 dark:bg-emerald-600 text-white rounded-tr-xs shadow-sm'
                                : 'bg-white dark:bg-ecoDark-card text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/80 dark:border-emerald-950/60 shadow-xs'
                            }`}
                          >
                            {/* If Negotiation / Rate Proposal message */}
                            {m.isNegotiation && (
                              <div
                                className={`mb-2 p-2 rounded-xl flex items-center justify-between text-xs font-bold ${
                                  isMe
                                    ? 'bg-white/10 text-emerald-300'
                                    : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60'
                                }`}
                              >
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3.5 h-3.5" />
                                  Proposed Special Rate:
                                </span>
                                <span>₹{m.proposedPrice}</span>
                              </div>
                            )}

                            <p className="whitespace-pre-line">{m.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 4. Input & Rate Proposal Toolbar */}
                <div className="p-4 border-t border-slate-100 dark:border-emerald-950/60 bg-white dark:bg-ecoDark-surface space-y-3">
                  {/* Rate Negotiation Chip */}
                  <div className="flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => setIsNegotiation(!isNegotiation)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                        isNegotiation
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-100 dark:bg-ecoDark-card text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-ecoDark-hover'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{isNegotiation ? 'Special Rate Active' : '+ Propose Special Rate'}</span>
                    </button>

                    {isNegotiation && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 dark:text-slate-400 font-semibold">Offer (₹):</span>
                        <input
                          type="number"
                          step="any"
                          placeholder="e.g. 14.20"
                          value={proposedPrice}
                          onChange={(e) => setProposedPrice(e.target.value)}
                          className="w-24 px-2 py-1 text-xs font-bold border border-emerald-300 dark:border-emerald-700 rounded-lg focus:outline-none text-emerald-900 dark:text-emerald-300 bg-white dark:bg-ecoDark-card"
                        />
                      </div>
                    )}
                  </div>

                  {/* Message Input Form */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={
                        isNegotiation
                          ? 'Add terms for your rate proposal...'
                          : 'Type your message or enquiry to counterparty...'
                      }
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send</span>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 dark:text-slate-500">
                <MessageSquare className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h3 className="font-bold text-base text-slate-700 dark:text-slate-200">Select a dialogue from the list</h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                  Coordinate dispatch schedules, discuss bulk discounting, or negotiate secondary raw material rates directly.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
