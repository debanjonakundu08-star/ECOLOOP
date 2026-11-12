import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import { Notification } from '../types';
import {
  Recycle,
  PlusCircle,
  Bell,
  MessageSquare,
  User as UserIcon,
  LayoutDashboard,
  PackageCheck,
  LogOut,
  Menu,
  X,
  Inbox,
  BarChart3,
  Search,
  Sun,
  Moon,
  ShoppingCart,
  Store,
  Heart,
  Boxes,
  Send,
  Layers,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const isSeller = user?.role === 'SELLER';
  const isBuyer = user?.role === 'BUYER';

  useEffect(() => {
    if (user) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // 30s poll
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const loadNotifications = async () => {
    try {
      const res = await api.notifications.getAll();
      setNotifications(res.notifications || []);
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif: Notification) => {
    try {
      if (!notif.isRead) {
        await api.notifications.markRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setNotificationsOpen(false);
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#071a13]/90 backdrop-blur-md border-b border-emerald-950/10 dark:border-emerald-500/20 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2 sm:gap-4">
          {/* Logo & Tagline */}
          <Link
            to={isSeller ? '/seller/dashboard' : isBuyer ? '/buyer/dashboard' : '/'}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-500 dark:from-emerald-600 dark:to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 dark:shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300">
              <Recycle className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Eco<span className="text-emerald-600 dark:text-emerald-400">Loop</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  {isSeller ? 'Seller' : isBuyer ? 'Buyer' : 'B2B'}
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight hidden sm:block">
                Turning Leftovers into Leverages
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links - Role Partitioned */}
          <nav className="hidden lg:flex items-center gap-1">
            {isBuyer && (
              <>
                <Link
                  to="/buyer/dashboard"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/buyer/dashboard')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Home / Explore</span>
                </Link>

                <Link
                  to="/marketplace"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/marketplace')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Browse Items</span>
                </Link>

                <Link
                  to="/buyer/wishlist"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/buyer/wishlist')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Wishlist</span>
                </Link>

                <Link
                  to="/messages"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/messages')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Messages</span>
                </Link>

                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/orders')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>My Orders</span>
                </Link>
              </>
            )}

            {isSeller && (
              <>
                <Link
                  to="/seller/dashboard"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/seller/dashboard')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  to="/seller/listings"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/seller/listings')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>My Listings</span>
                </Link>

                <Link
                  to="/seller/add-listing"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/seller/add-listing')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Add New Listing</span>
                </Link>

                <Link
                  to="/messages"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/messages')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Messages</span>
                </Link>

                <Link
                  to="/orders"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/orders')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Orders / Transactions</span>
                </Link>
              </>
            )}

            {!user && (
              <>
                <Link
                  to="/marketplace"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/marketplace')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Explore Marketplace</span>
                </Link>

                <Link
                  to="/impact"
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isActive('/impact')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Impact Metrics</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Toolbar & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="px-2.5 sm:px-3 py-2 rounded-xl bg-emerald-50 dark:bg-ecoDark-surface hover:bg-emerald-100 dark:hover:bg-ecoDark-hover text-emerald-900 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-500/30 shadow-xs transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Color Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 animate-[spin_8s_linear_infinite]" />
                  <span className="text-xs font-black tracking-tight text-amber-300 hidden md:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-black tracking-tight text-emerald-900 hidden md:inline">Dark</span>
                </>
              )}
            </button>

            {/* Role-Specific Primary Quick Action Button */}
            {isSeller ? (
              <Link
                to="/seller/add-listing"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-md shadow-emerald-700/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add New Listing</span>
              </Link>
            ) : isBuyer ? (
              <Link
                to="/marketplace"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/20 hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Browse Surplus</span>
              </Link>
            ) : null}

            {user ? (
              <>
                {/* Messages icon */}
                <Link
                  to="/messages"
                  className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors relative"
                  title="Messages & Negotiations"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications Bell & Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 sm:p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-ecoDark-card rounded-2xl shadow-xl border border-slate-100 dark:border-emerald-500/30 p-4 z-50 animate-fadeIn">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="divide-y divide-slate-100 dark:divide-emerald-950/60 max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                            No notifications right now
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`py-3 px-2 rounded-xl cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-emerald-50/50 dark:bg-emerald-950/40' : 'hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                                <span className="text-[10px] text-slate-400 shrink-0">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Profile Menu */}
                <div className="relative" ref={userRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-forest-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {user.businessName.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-ecoDark-card rounded-2xl shadow-xl border border-slate-100 dark:border-emerald-500/30 py-2 z-50 animate-fadeIn text-slate-900 dark:text-white">
                      {/* User Info Header */}
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-emerald-950">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.businessName}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                            isSeller
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                          }`}>
                            {user.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          {user.city} • {user.category}
                        </p>
                      </div>

                      {/* Navigation Shortcuts strictly matching user role */}
                      <div className="py-1">
                        {isBuyer && (
                          <>
                            <Link
                              to="/buyer/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Buyer Dashboard</span>
                            </Link>

                            <Link
                              to="/marketplace"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <Search className="w-4 h-4 text-slate-400" />
                              <span>Browse Items</span>
                            </Link>

                            <Link
                              to="/buyer/wishlist"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <Heart className="w-4 h-4 text-rose-500" />
                              <span>Wishlist</span>
                            </Link>

                            <Link
                              to="/orders"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <PackageCheck className="w-4 h-4 text-slate-400" />
                              <span>My Orders</span>
                            </Link>
                          </>
                        )}

                        {isSeller && (
                          <>
                            <Link
                              to="/seller/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Seller Dashboard</span>
                            </Link>

                            <Link
                              to="/seller/listings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <Boxes className="w-4 h-4 text-slate-400" />
                              <span>My Listings</span>
                            </Link>

                            <Link
                              to="/seller/add-listing"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                              <span>Add New Listing</span>
                            </Link>

                            <Link
                              to="/orders"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                            >
                              <PackageCheck className="w-4 h-4 text-slate-400" />
                              <span>Orders / Transactions</span>
                            </Link>
                          </>
                        )}

                        <Link
                          to="/messages"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <MessageSquare className="w-4 h-4 text-slate-400" />
                          <span>Messages</span>
                        </Link>

                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>Profile</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-emerald-950">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login?role=buyer"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface transition-colors border border-emerald-200 dark:border-emerald-800/60"
                >
                  Continue as Buyer
                </Link>
                <Link
                  to="/login?role=seller"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-forest-900 dark:bg-emerald-600 text-white hover:bg-forest-800 dark:hover:bg-emerald-500 transition-colors shadow-xs"
                >
                  Continue as Seller
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors cursor-pointer"
              aria-label="Open Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 dark:border-emerald-950/60 py-4 space-y-3 animate-fadeIn bg-white dark:bg-ecoDark-card px-3 rounded-b-2xl shadow-lg">
            {/* Mobile Account Role Banner if logged in */}
            {user && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-ecoDark-surface border border-slate-200/80 dark:border-emerald-900/60 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.businessName}</p>
                  <p className="text-[10px] text-slate-400">{user.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                  isSeller
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'
                }`}>
                  {user.role}
                </span>
              </div>
            )}

            {/* Mobile Navigation links */}
            <div className="space-y-1 pt-1">
              {isBuyer && (
                <>
                  <Link
                    to="/buyer/dashboard"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Home / Explore
                  </Link>
                  <Link
                    to="/marketplace"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Browse Items
                  </Link>
                  <Link
                    to="/buyer/wishlist"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Wishlist
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    My Orders / Transactions
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Profile
                  </Link>
                </>
              )}

              {isSeller && (
                <>
                  <Link
                    to="/seller/dashboard"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/seller/listings"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/seller/add-listing"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface text-emerald-700 dark:text-emerald-400 font-bold"
                  >
                    + Add New Listing
                  </Link>
                  <Link
                    to="/messages"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Orders / Transactions
                  </Link>
                  <Link
                    to="/profile"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Profile
                  </Link>
                </>
              )}

              {!user && (
                <>
                  <Link
                    to="/marketplace"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Explore Marketplace
                  </Link>
                  <Link
                    to="/impact"
                    className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                  >
                    Environmental Impact
                  </Link>
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Link
                      to="/login?role=buyer"
                      className="text-center py-2.5 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface"
                    >
                      Buyer Login
                    </Link>
                    <Link
                      to="/login?role=seller"
                      className="text-center py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800"
                    >
                      Seller Login
                    </Link>
                  </div>
                </>
              )}

              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
