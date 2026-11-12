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
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
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
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-[#071a13]/90 backdrop-blur-md border-b border-emerald-950/10 dark:border-emerald-500/20 shadow-xs dark:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-500 dark:from-emerald-600 dark:to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 dark:shadow-emerald-500/20 group-hover:scale-105 transition-all duration-300">
              <Recycle className="w-6 h-6 animate-[spin_12s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Eco<span className="text-emerald-600 dark:text-emerald-400">Loop</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  B2B
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 tracking-tight hidden sm:block">
                Turning Leftovers into Leverages
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              to="/marketplace"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/marketplace')
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
              }`}
            >
              <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Marketplace</span>
            </Link>

            <Link
              to="/impact"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/impact')
                  ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Impact Dashboard</span>
            </Link>

            {user && (
              <>
                <Link
                  to="/seller/dashboard"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive('/seller/dashboard')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Business Hub</span>
                </Link>

                <Link
                  to="/orders"
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive('/orders')
                      ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-500/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-ecoDark-surface'
                  }`}
                >
                  <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Orders</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Action Icons & Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button (Dual Mode) */}
            <button
              onClick={toggleTheme}
              className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-ecoDark-surface hover:bg-emerald-100 dark:hover:bg-ecoDark-hover text-emerald-900 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-500/30 shadow-xs transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Forest Light Mode' : 'Switch to Eco Dark Mode'}
              aria-label="Toggle Color Theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-300 animate-[spin_8s_linear_infinite]" />
                  <span className="text-xs font-black tracking-tight text-amber-300 hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-emerald-800" />
                  <span className="text-xs font-black tracking-tight text-emerald-900 hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* List Your Waste CTA Button */}
            <Link
              to={user ? '/list-waste' : '/login'}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-md shadow-emerald-600/30 dark:shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>List Your Waste</span>
            </Link>

            {user ? (
              <>
                {/* Messages icon */}
                <Link
                  to="/messages"
                  className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors relative"
                  title="Messages & Negotiations"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications Bell & Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold flex items-center justify-center animate-bounce">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Panel */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-ecoDark-card rounded-2xl shadow-xl border border-slate-100 dark:border-emerald-500/30 py-3 z-50 animate-fadeIn text-slate-900 dark:text-white">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-emerald-950 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-white">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-300">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-emerald-950/60">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet
                          </div>
                        ) : (
                          notifications.map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className={`p-3.5 hover:bg-slate-50 dark:hover:bg-ecoDark-surface cursor-pointer transition-colors ${
                                !n.isRead ? 'bg-emerald-50/40 dark:bg-emerald-950/40' : ''
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-bold text-xs text-slate-900 dark:text-white">{n.title}</p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
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
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors"
                  >
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-forest-800 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                      {user.businessName.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-ecoDark-card rounded-2xl shadow-xl border border-slate-100 dark:border-emerald-500/30 py-2 z-50 animate-fadeIn text-slate-900 dark:text-white">
                      <div className="px-4 py-2.5 border-b border-slate-100 dark:border-emerald-950">
                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.businessName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                        <span className="mt-1 inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          {user.city} • {user.category}
                        </span>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          <span>Business Profile</span>
                        </Link>

                        <Link
                          to="/seller/dashboard"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          <span>My Listings & Hub</span>
                        </Link>

                        <Link
                          to="/seller/requests"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <Inbox className="w-4 h-4 text-slate-400" />
                          <span>Incoming Requests</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                          <PackageCheck className="w-4 h-4 text-slate-400" />
                          <span>Orders & Transactions</span>
                        </Link>
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-emerald-950">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
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
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 dark:bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-colors shadow-xs"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-ecoDark-surface transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 dark:border-emerald-950/60 py-4 space-y-2 animate-fadeIn bg-white dark:bg-ecoDark-card px-2 rounded-b-2xl shadow-lg">
            {/* Mobile Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-50/60 dark:bg-ecoDark-surface text-slate-800 dark:text-slate-100 border border-emerald-100 dark:border-emerald-500/20"
            >
              <span className="flex items-center gap-2">
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-emerald-700" />}
                <span>{theme === 'dark' ? 'Forest Light Mode' : 'Eco Dark Mode'}</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white dark:bg-ecoDark-card text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30">
                {theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
              </span>
            </button>

            <Link
              to="/marketplace"
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface hover:text-emerald-800"
            >
              Marketplace
            </Link>
            <Link
              to="/impact"
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-ecoDark-surface hover:text-emerald-800"
            >
              Environmental Impact
            </Link>
            <Link
              to={user ? '/list-waste' : '/login'}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 font-bold"
            >
              + List Your Waste
            </Link>
            {user ? (
              <>
                <Link
                  to="/seller/dashboard"
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface"
                >
                  Business Hub (My Listings)
                </Link>
                <Link
                  to="/seller/requests"
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface"
                >
                  Incoming Requests
                </Link>
                <Link
                  to="/orders"
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface"
                >
                  Orders & Shipments
                </Link>
                <Link
                  to="/messages"
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface"
                >
                  Messages & Negotiation
                </Link>
                <Link
                  to="/profile"
                  className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface"
                >
                  Business Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  className="text-center py-2.5 rounded-xl text-sm font-bold border border-slate-200 dark:border-emerald-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-ecoDark-surface"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-center py-2.5 rounded-xl text-sm font-bold bg-emerald-700 text-white"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
