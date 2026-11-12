import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Tag,
  ShieldCheck,
  Edit3,
  Save,
  CheckCircle2,
  Boxes,
  PackageCheck,
  LayoutDashboard,
  Target,
  HelpCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    contactPerson: '',
    phone: '',
    city: '',
    address: '',
    category: '',
    bio: '',
    preferredCategories: '',
    preferredCities: '',
    maxBudget: '',
    typicalQuantity: '',
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const categories = [
    'Manufacturing',
    'Packaging',
    'Recycling',
    'Textiles',
    'Food & Beverage',
    'Construction',
    'Retail',
    'Automotive & Scrap',
  ];

  const cities = ['Kolkata', 'Howrah', 'Siliguri', 'Guwahati', 'Durgapur', 'Asansol'];

  useEffect(() => {
    if (user) {
      setFormData({
        businessName: user.businessName || '',
        contactPerson: user.contactPerson || '',
        phone: user.phone || '',
        city: user.city || 'Kolkata',
        address: user.address || '',
        category: user.category || 'Manufacturing',
        bio: user.bio || '',
        preferredCategories: user.preferences?.preferredCategories || '',
        preferredCities: user.preferences?.preferredCities || user.city || '',
        maxBudget: user.preferences?.maxBudget ? String(user.preferences.maxBudget) : '',
        typicalQuantity: user.preferences?.typicalQuantity ? String(user.preferences.typicalQuantity) : '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await api.profile.updateMe(formData);
      await refreshUser();
      setIsEditing(false);
      setSuccessMsg('Business profile and sourcing preferences updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-10 shadow-card dark:shadow-glow-sm border border-emerald-100/80 dark:border-emerald-500/20 transition-colors"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100 dark:border-emerald-950/60">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-800 to-emerald-600 dark:from-emerald-600 dark:to-emerald-400 text-white font-black text-2xl flex items-center justify-center shadow-md">
                {user.businessName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">{user.businessName}</h1>
                  {user.isVerified && (
                    <span title="Verified Business">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {user.category} • Member since {new Date(user.createdAt || Date.now()).getFullYear()}
                </p>
                <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  GST Verified Entity
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 dark:bg-emerald-600 text-white hover:bg-emerald-700 dark:hover:bg-emerald-500 transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-ecoDark-hover cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {successMsg && (
            <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Stats Banner */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <Link
              to="/seller/dashboard"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card hover:bg-emerald-50/50 dark:hover:bg-ecoDark-hover border border-slate-100 dark:border-emerald-950/60 transition-all block"
            >
              <div className="text-2xl font-black text-slate-900 dark:text-white">{user._count?.listings ?? 0}</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Listed Materials</div>
            </Link>

            <Link
              to="/seller/requests"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card hover:bg-emerald-50/50 dark:hover:bg-ecoDark-hover border border-slate-100 dark:border-emerald-950/60 transition-all block"
            >
              <div className="text-2xl font-black text-slate-900 dark:text-white">{user._count?.sellerRequests ?? 0}</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Buyer Inquiries</div>
            </Link>

            <Link
              to="/orders?role=buyer"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card hover:bg-emerald-50/50 dark:hover:bg-ecoDark-hover border border-slate-100 dark:border-emerald-950/60 transition-all block"
            >
              <div className="text-2xl font-black text-slate-900 dark:text-white">{user._count?.buyerOrders ?? 0}</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Purchases</div>
            </Link>

            <Link
              to="/orders?role=seller"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-ecoDark-card hover:bg-emerald-50/50 dark:hover:bg-ecoDark-hover border border-slate-100 dark:border-emerald-950/60 transition-all block"
            >
              <div className="text-2xl font-black text-slate-900 dark:text-white">{user._count?.sellerOrders ?? 0}</div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Sales Completed</div>
            </Link>
          </div>

          {/* Edit / View Profile Form */}
          <form onSubmit={handleSave} className="mt-8 space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Corporate Credentials & Contact
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    name="businessName"
                    disabled={!isEditing}
                    value={formData.businessName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Contact Officer</label>
                  <input
                    type="text"
                    name="contactPerson"
                    disabled={!isEditing}
                    value={formData.contactPerson}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Official Email</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-slate-100 dark:bg-ecoDark-card text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Hub City</label>
                  <select
                    name="city"
                    disabled={!isEditing}
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-none bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white font-medium"
                  >
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Industry Sector</label>
                  <select
                    name="category"
                    disabled={!isEditing}
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 focus:outline-none bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Facility Address</label>
                <input
                  type="text"
                  name="address"
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Overview / Bio</label>
                <textarea
                  name="bio"
                  rows={2}
                  disabled={!isEditing}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Sourcing & Procurement Preferences */}
            <div className="pt-4 border-t border-slate-100 dark:border-emerald-950/60 space-y-4">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Sourcing & Procurement Preferences
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Record your preferred categories, sourcing cities, and target budget for your business profile.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Target Waste Categories (comma separated)
                  </label>
                  <input
                    type="text"
                    name="preferredCategories"
                    disabled={!isEditing}
                    placeholder="e.g. Paper/Cardboard,Plastic,Wood"
                    value={formData.preferredCategories}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Sourcing Cities (comma separated)
                  </label>
                  <input
                    type="text"
                    name="preferredCities"
                    disabled={!isEditing}
                    placeholder="e.g. Kolkata,Howrah"
                    value={formData.preferredCities}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Target Budget per Unit (₹)
                  </label>
                  <input
                    type="number"
                    name="maxBudget"
                    disabled={!isEditing}
                    placeholder="e.g. 50"
                    value={formData.maxBudget}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Typical Procurement Batch (kg)
                  </label>
                  <input
                    type="number"
                    name="typicalQuantity"
                    disabled={!isEditing}
                    placeholder="e.g. 1000"
                    value={formData.typicalQuantity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 disabled:bg-slate-50 dark:disabled:bg-ecoDark-card disabled:text-slate-600 dark:disabled:text-slate-400 bg-white dark:bg-ecoDark-surface text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="pt-4 border-t border-slate-100 dark:border-emerald-950/60 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-ecoDark-card cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </form>
        </motion.div>

        {/* Quick Links Footer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/seller/dashboard"
            className="p-5 bg-white dark:bg-ecoDark-surface rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all flex items-center gap-3"
          >
            <LayoutDashboard className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Seller Dashboard</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">View sales metrics and inventory</div>
            </div>
          </Link>

          <Link
            to="/orders"
            className="p-5 bg-white dark:bg-ecoDark-surface rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-500/50 transition-all flex items-center gap-3"
          >
            <PackageCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">Track Orders</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">All procurement shipments</div>
            </div>
          </Link>

          <div className="p-5 bg-white dark:bg-ecoDark-surface rounded-2xl border border-slate-200/80 dark:border-emerald-500/20 shadow-2xs flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">EcoLoop Support</div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500">support@ecoloop.in</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
