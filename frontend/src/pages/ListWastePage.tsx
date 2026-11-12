import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  Link2,
  FileImage,
  Sparkles,
  X,
  RefreshCw,
} from 'lucide-react';

export const ListWastePage: React.FC = () => {
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

  // Sample photo presets per category for fast realistic listing
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
      setError('Please provide your company or business name.');
      return;
    }

    if (!formData.title.trim() || !formData.description.trim() || !formData.quantity || !formData.pricePerUnit) {
      setError('Please provide all required material specifications.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.materials.create({
        ...formData,
        companyName: formData.companyName.trim(),
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
        imageUrl: CATEGORY_IMAGES['Paper/Cardboard'],
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
        imageUrl: CATEGORY_IMAGES['Plastic'],
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
        imageUrl: CATEGORY_IMAGES['Wood'],
      },
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];
    setFormData((prev) => ({
      ...prev,
      ...pick,
    }));
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
            {/* Company / Business Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Your Company / Enterprise Name *</span>
                <span className="text-[11px] font-normal text-emerald-700 dark:text-emerald-400">Decide your exact business/plant name</span>
              </label>
              <input
                type="text"
                name="companyName"
                required
                placeholder="e.g. Tata Steel Scrap Division, Bengal Recyclers, etc."
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white font-medium"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                This exact name will be shown to buyers across the marketplace as the supplier enterprise.
              </p>
            </div>

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

            {/* Photograph: Upload JPG from Device, URL, or Preset */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Material Photograph *
                  </label>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Upload your own photo from your phone/computer, or use a web link
                  </p>
                </div>
                <div className="flex bg-slate-100 dark:bg-emerald-950/60 p-0.5 rounded-xl border border-slate-200 dark:border-emerald-900/60 text-xs">
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                      imageMode === 'upload'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload from Device (.jpg, .png)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                      imageMode === 'url'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    <span>Web URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('preset')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                      imageMode === 'preset'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preset</span>
                  </button>
                </div>
              </div>

              {/* Upload JPG / Image Mode */}
              {imageMode === 'upload' && (
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    className="hidden"
                  />
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 scale-[1.01]'
                        : 'border-emerald-500/50 dark:border-emerald-500/40 hover:border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                    }`}
                  >
                    {uploadFileName ? (
                      <div className="flex items-center justify-between gap-4 text-left">
                        <div className="flex items-center gap-4">
                          <img
                            src={formData.imageUrl}
                            alt="Uploaded preview"
                            className="w-20 h-20 rounded-xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Your Photo is Attached Successfully</span>
                            </div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-sm mt-0.5">
                              {uploadFileName}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                              {uploadFileSize} • Compressed for fast marketplace viewing
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-colors"
                          >
                            Replace Photo
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setUploadFileName('');
                              setUploadFileSize('');
                              setFormData((prev) => ({
                                ...prev,
                                imageUrl: categoryPhotoPresets[formData.category] || categoryPhotoPresets['Paper/Cardboard'],
                              }));
                            }}
                            className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Reset to category preset"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4">
                        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 shadow-inner">
                          <Upload className="w-7 h-7" />
                        </div>
                        <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                          Upload Photo of Your Waste Material
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
                          Click below or drag & drop a JPG, JPEG, or PNG image taken from your phone or computer.
                        </p>
                        <div className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all active:scale-95">
                          <FileImage className="w-4 h-4" />
                          <span>Select JPG / Photo from Device</span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                          Supports .jpg, .jpeg, .png, .webp (automatically compressed for fast loading)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* URL Mode */}
              {imageMode === 'url' && (
                <div className="space-y-2">
                  <div className="flex gap-3 items-center">
                    <input
                      type="url"
                      name="imageUrl"
                      required
                      value={formData.imageUrl}
                      onChange={handleChange}
                      placeholder="https://images.unsplash.com/... or any online image URL"
                      className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                    />
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-emerald-900/60 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = categoryPhotoPresets[formData.category] || categoryPhotoPresets['Paper/Cardboard'];
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 dark:text-slate-500">
                      Paste any direct high-resolution image link.
                    </span>
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                    >
                      ← Rather upload a photo file from your device?
                    </button>
                  </div>
                </div>
              )}

              {/* Presets Mode */}
              {imageMode === 'preset' && (
                <div className="bg-slate-50 dark:bg-ecoDark-card/50 p-4 rounded-xl border border-slate-200 dark:border-emerald-900/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Standard Verified Photo for {formData.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          imageUrl: categoryPhotoPresets[formData.category] || categoryPhotoPresets['Paper/Cardboard'],
                        }));
                      }}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Apply default preset
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <img
                      src={categoryPhotoPresets[formData.category] || categoryPhotoPresets['Paper/Cardboard']}
                      alt={formData.category}
                      className="w-16 h-16 rounded-xl object-cover border border-emerald-500/50 shadow-sm"
                    />
                    <div className="text-xs text-slate-600 dark:text-slate-400 flex-1">
                      <p className="font-medium text-slate-800 dark:text-slate-200">
                        High-quality realistic photo representing {formData.category}
                      </p>
                      <button
                        type="button"
                        onClick={() => setImageMode('upload')}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline mt-1 block"
                      >
                        ← Upload your own real photo from device instead
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
