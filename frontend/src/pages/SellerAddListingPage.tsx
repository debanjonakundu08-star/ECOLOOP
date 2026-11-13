import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_IMAGES } from '../utils/categoryImages';
import {
  PlusCircle,
  Upload,
  AlertCircle,
  Tag,
  MapPin,
  Scale,
  IndianRupee,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  FileImage,
  Layers,
  X,
  Store,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const SellerAddListingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: user?.businessName || '',
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
    imageUrl: CATEGORY_IMAGES['Paper/Cardboard'],
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [uploadFileName, setUploadFileName] = useState<string>('');
  const [uploadFileSize, setUploadFileSize] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (.jpg, .jpeg, .png, .webp)');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 720;
        let width = img.width;
        let height = img.height;
        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.70);
          setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
          setUploadFileName(file.name);
          setUploadFileSize((file.size / 1024).toFixed(1) + ' KB');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

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

  const categoryPhotoPresets: Record<string, string> = CATEGORY_IMAGES;

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

    if (!formData.companyName.trim()) {
      setError('Please provide your registered company or business name.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.quantity || !formData.pricePerUnit) {
      setError('Please complete all required material specifications.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.materials.create({
        ...formData,
        companyName: formData.companyName.trim(),
        images: [formData.imageUrl],
      });
      navigate('/seller/listings');
    } catch (err: any) {
      setError(err.message || 'Failed to publish new listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-ecoDark-bg py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <Link
            to="/seller/listings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Listings</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-500/30">
            <Store className="w-3.5 h-3.5" />
            Seller Inventory Portal
          </span>
        </div>

        {/* Header Banner */}
        <div className="bg-white dark:bg-ecoDark-surface rounded-3xl p-6 sm:p-8 border border-emerald-100/80 dark:border-emerald-500/20 shadow-card">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <PlusCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              <span>List Your Waste</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
              Publish secondary raw materials, industrial scrap, or recyclable surplus lots to verified buyers across the B2B circular economy network.
            </p>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Seller Information */}
          <div className="bg-white dark:bg-ecoDark-surface p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-emerald-950/80 pb-3">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>1. Seller Business Information</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Business / Company Name *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="e.g. Acme Polymers &amp; Packaging"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Facility City *
                </label>
                <select
                  name="locationCity"
                  value={formData.locationCity}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                >
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2. Material Specifications */}
          <div className="bg-white dark:bg-ecoDark-surface p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-emerald-950/80 pb-3">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>2. Material Specifications</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Material Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Listing Title *
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Clean Corrugated Cardboard Trimmings"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Technical Description &amp; Material Quality *
              </label>
              <textarea
                name="description"
                rows={3}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Provide detailed material grade, moisture level, contamination rate, baling format, origin process, etc."
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Unit of Measure *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Price per Unit (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="number"
                    step="0.01"
                    name="pricePerUnit"
                    required
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    placeholder="15.50"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Condition / Grade
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                >
                  {conditions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Min Order Quantity
                </label>
                <input
                  type="number"
                  name="minOrderQuantity"
                  value={formData.minOrderQuantity}
                  onChange={handleChange}
                  placeholder="100"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Availability
                </label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                >
                  {availabilities.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 3. Image Upload / Photo Selection */}
          <div className="bg-white dark:bg-ecoDark-surface p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-emerald-500/20 shadow-card space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-emerald-950/80 pb-3">
              <ImageIcon className="w-4 h-4 text-emerald-600" />
              <span>3. Material Photo &amp; Lot Documentation</span>
            </h2>

            {/* Mode Selector */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-ecoDark-card rounded-xl max-w-sm">
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  imageMode === 'upload'
                    ? 'bg-white dark:bg-emerald-600 text-emerald-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  imageMode === 'url'
                    ? 'bg-white dark:bg-emerald-600 text-emerald-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Photo URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode('preset')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  imageMode === 'preset'
                    ? 'bg-white dark:bg-emerald-600 text-emerald-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Category Preset
              </button>
            </div>

            {/* Upload Area */}
            {imageMode === 'upload' && (
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                    : 'border-slate-300 dark:border-emerald-900/60 hover:border-emerald-500 bg-slate-50/50 dark:bg-ecoDark-card/50'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {uploadFileName ? uploadFileName : 'Drop your material photo here, or browse files'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Supports PNG, JPG, WEBP. High quality images increase buyer enquiry rates.
                </p>
              </div>
            )}

            {imageMode === 'url' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Direct Image URL
                </label>
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/lot-photo.jpg"
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
              </div>
            )}

            {imageMode === 'preset' && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Using verified high-resolution photograph for <strong>{formData.category}</strong>.
              </p>
            )}

            {/* Photo Preview */}
            {formData.imageUrl && (
              <div className="pt-2">
                <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 dark:border-emerald-800/40 shadow-sm">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-48 h-32 object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white">
                    Preview
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              to="/seller/listings"
              className="px-6 py-3 rounded-2xl font-bold text-xs bg-slate-100 dark:bg-ecoDark-card hover:bg-slate-200 dark:hover:bg-ecoDark-hover text-slate-700 dark:text-slate-300 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 rounded-2xl font-bold text-xs bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white transition-all shadow-md shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Publishing Lot to Marketplace...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
