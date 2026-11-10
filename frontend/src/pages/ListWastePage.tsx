import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  Upload,
  AlertCircle,
  Tag,
  MapPin,
  Scale,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';

export const ListWastePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    category: 'Paper/Cardboard',
    title: '',
    description: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    condition: 'Clean / High Grade',
    locationCity: user?.city || 'Kolkata',
    locationAddress: user?.address || 'Industrial Area Phase 2',
    availability: 'Immediate',
    minOrderQuantity: '100',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const categories = [
    'Paper/Cardboard',
    'Plastic',
    'Metal',
    'Glass',
    'Wood',
    'Textile',
    'Food waste',
    'Packaging materials',
    'Construction materials',
    'Industrial scrap',
    'Furniture',
    'Business equipment',
  ];

  const units = ['kg', 'tons', 'pieces', 'pallets', 'liters', 'meters'];
  const conditions = ['Clean / High Grade', 'Surplus / Unused', 'Minor Defects', 'Recyclable / Unsorted', 'Scrap'];
  const cities = ['Kolkata', 'Howrah', 'Siliguri', 'Guwahati', 'Durgapur', 'Asansol'];
  const availabilities = ['Immediate', 'Within 1 week', 'Recurring Monthly', 'Custom'];

  // Sample photo presets per category for fast realistic listing
  const categoryPhotoPresets: Record<string, string> = {
    'Paper/Cardboard': 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
    'Plastic': 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80',
    'Metal': 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    'Glass': 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80',
    'Wood': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    'Textile': 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    'Food waste': 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
    'Packaging materials': 'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?auto=format&fit=crop&w=800&q=80',
    'Construction materials': 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=800&q=80',
    'Industrial scrap': 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    'Furniture': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80',
    'Business equipment': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCat = e.target.value;
    setFormData({
      ...formData,
      category: newCat,
      imageUrl: categoryPhotoPresets[newCat] || formData.imageUrl,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.quantity || !formData.pricePerUnit) {
      setError('Please provide all required material specifications.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.materials.create({
        ...formData,
        images: [formData.imageUrl],
      });
      navigate(`/materials/${res.listing.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to list material.');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoFillSample = () => {
    const samples = [
      {
        category: 'Paper/Cardboard',
        title: 'Kraft Paper Offcuts & Carton Trimmings',
        description: 'Clean pre-consumer kraft paper trimmings from corrugated carton production. Baled in 250 kg cubes. Low moisture <7%, unprinted, zero plastic laminates.',
        quantity: '1800',
        unit: 'kg',
        pricePerUnit: '13.80',
        condition: 'Clean / High Grade',
        locationCity: 'Kolkata',
        locationAddress: 'Sector V Salt Lake, Kolkata',
        availability: 'Immediate',
        minOrderQuantity: '250',
        imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80',
      },
      {
        category: 'Plastic',
        title: 'Shredded HDPE Drum Flakes (Hot-Washed)',
        description: 'Clean high-density polyethylene regrind from food-grade drums. Particle size 8-12mm, melt flow index tested, suitable for direct injection molding or extrusion.',
        quantity: '2500',
        unit: 'kg',
        pricePerUnit: '41.50',
        condition: 'Clean / High Grade',
        locationCity: 'Howrah',
        locationAddress: 'Jalan Industrial Estate, Howrah',
        availability: 'Immediate',
        minOrderQuantity: '500',
        imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKmCDH7D2D8bFnO38_WxnlTwBJjGABM0KLRB5qQCpYUu5rPMwT54zjZqm1&s=10',
      },
      {
        category: 'Wood',
        title: 'Heat-Treated Pine Wood Pallets (ISPM-15)',
        description: 'Standard 1200x1000mm 4-way heavy duty pine pallets. Clean dry condition, load capacity 1200 kg. Tested and ready for warehouse or export shipping.',
        quantity: '120',
        unit: 'pallets',
        pricePerUnit: '310.00',
        condition: 'Surplus / Unused',
        locationCity: 'Siliguri',
        locationAddress: 'Sevoke Road Freight Yard, Siliguri',
        availability: 'Immediate',
        minOrderQuantity: '20',
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
      },
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    setFormData(pick);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-8 sm:p-10 shadow-card border border-emerald-100/80 dark:border-emerald-500/20 transition-colors duration-300">
          {/* Header */}
          <div className="border-b border-slate-100 dark:border-emerald-950/60 pb-6 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
                <PlusCircle className="w-4 h-4" />
                <span>Seller Inventory Onboarding</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                List Your Excess Material or Waste
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Publish secondary raw materials, industrial scrap, or surplus stock to vetted buyers across India.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoFillSample}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-ecoDark-card text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-ecoDark-hover border border-emerald-200 dark:border-emerald-500/30 transition-all shrink-0 self-start sm:self-auto flex items-center gap-1.5"
              title="Click to automatically populate realistic test data"
            >
              <span>✨ Auto-Fill Sample Lot</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category & Title */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Material Stream *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white font-medium"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>


              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Material Title / Batch Name *</label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Clean Corrugated Cardboard (Baled & B-Flute)"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Technical Specifications & Details *</label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Specify dimensions, purity, moisture percentage, chemical history, sorting grade, or packaging format..."
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
              />
            </div>

            {/* Quantity, Unit, Price, MOQ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Available Volume *</label>
                <input
                  type="number"
                  name="quantity"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 1500"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Measurement Unit *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white font-medium"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Price / Unit (₹) *</label>
                <input
                  type="number"
                  name="pricePerUnit"
                  required
                  min="0"
                  step="any"
                  placeholder="e.g. 14.50"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Min Order (MOQ) *</label>
                <input
                  type="number"
                  name="minOrderQuantity"
                  required
                  min="1"
                  step="any"
                  placeholder="e.g. 100"
                  value={formData.minOrderQuantity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Quality condition & Availability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Quality / Condition Grade *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white font-medium"
                >
                  {conditions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Inventory Dispatch Timeline *</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white font-medium"
                >
                  {availabilities.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location City and Facility Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Location Hub City *</label>
                <select
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white font-medium"
                >
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Specific Plant / Warehouse Address *</label>
                <input
                  type="text"
                  name="locationAddress"
                  required
                  placeholder="e.g. Sector V Warehouse, Salt Lake, Kolkata"
                  value={formData.locationAddress}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Photograph URL / Preset */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Material Photograph URL (High-Res Image) *
              </label>
              <div className="flex gap-3 items-center">
                <input
                  type="url"
                  name="imageUrl"
                  required
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-emerald-900/60 shrink-0"
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                A verified industrial preset image is automatically attached for {formData.category}. You can replace it with any image URL.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-5 py-3 rounded-xl font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-ecoDark-card transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3.5 rounded-xl font-bold text-sm bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-100" />
                <span>{loading ? 'Publishing Listing...' : 'Publish to Marketplace'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
