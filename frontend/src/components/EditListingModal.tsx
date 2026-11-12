import React, { useState, useRef, useEffect } from 'react';
import { MaterialListing } from '../types';
import { api } from '../services/api';
import { CATEGORY_IMAGES, getListingPrimaryImage } from '../utils/categoryImages';
import {
  X,
  Upload,
  Link2,
  Sparkles,
  Building2,
  CheckCircle2,
  FileImage,
  Tag,
  IndianRupee,
  MapPin,
  Scale,
  RotateCcw,
} from 'lucide-react';

interface EditListingModalProps {
  listing: MaterialListing;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: MaterialListing) => void;
}

const CATEGORIES = [
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

const CITIES = ['Kolkata', 'Howrah', 'Siliguri', 'Guwahati', 'Durgapur', 'Asansol'];
const CONDITIONS = ['Clean / High Grade', 'Surplus / Unused', 'Minor Defects', 'Recyclable / Unsorted', 'Scrap'];

export const EditListingModal: React.FC<EditListingModalProps> = ({
  listing,
  isOpen,
  onClose,
  onSave,
}) => {
  const getListingImage = (item: MaterialListing) => getListingPrimaryImage(item);

  const getCompanyName = (item: MaterialListing) =>
    item.seller?.businessName ||
    (item as any).companyName ||
    (typeof item.seller === 'string' ? item.seller : 'Enterprise Seller');

  const [companyName, setCompanyName] = useState(getCompanyName(listing));
  const [title, setTitle] = useState(listing.title || '');
  const [category, setCategory] = useState(listing.category || 'Paper/Cardboard');
  const [imageUrl, setImageUrl] = useState(getListingImage(listing));
  const [pricePerUnit, setPricePerUnit] = useState(String(listing.pricePerUnit || ''));
  const [quantity, setQuantity] = useState(String(listing.quantity || ''));
  const [unit, setUnit] = useState(listing.unit || 'kg');
  const [locationCity, setLocationCity] = useState(listing.locationCity || 'Kolkata');
  const [condition, setCondition] = useState(listing.condition || 'Clean / High Grade');
  const [description, setDescription] = useState(listing.description || '');

  const [imageMode, setImageMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && listing) {
      setCompanyName(getCompanyName(listing));
      setTitle(listing.title || '');
      setCategory(listing.category || 'Paper/Cardboard');
      setImageUrl(getListingImage(listing));
      setPricePerUnit(String(listing.pricePerUnit || ''));
      setQuantity(String(listing.quantity || ''));
      setUnit(listing.unit || 'kg');
      setLocationCity(listing.locationCity || 'Kolkata');
      setCondition(listing.condition || 'Clean / High Grade');
      setDescription(listing.description || '');
      setError('');
    }
  }, [isOpen, listing]);

  if (!isOpen) return null;

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
          setImageUrl(dataUrl);
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
    if (file) processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }
    if (!companyName.trim()) {
      setError('Please enter your company / business name');
      return;
    }
    setSaving(true);
    setError('');

    const updates: Partial<MaterialListing> & { companyName?: string; imageUrl?: string } = {
      title: title.trim(),
      category,
      pricePerUnit: parseFloat(pricePerUnit) || listing.pricePerUnit,
      quantity: parseFloat(quantity) || listing.quantity,
      unit,
      locationCity,
      condition,
      description: description.trim(),
      companyName: companyName.trim(),
      imageUrl: imageUrl.trim(),
      images: [
        {
          id: 'img-' + Date.now(),
          listingId: listing.id,
          url: imageUrl.trim(),
          isPrimary: true,
        },
      ],
      seller: {
        ...(listing.seller || {}),
        id: listing.seller?.id || listing.sellerId || 'usr_seller_1',
        businessName: companyName.trim(),
        city: locationCity,
        category: listing.seller?.category || category,
        isVerified: true,
      },
    };

    try {
      const res = await api.materials.update(listing.id, updates);
      const mergedListing: MaterialListing = {
        ...listing,
        ...updates,
        ...(res?.listing || {}),
        images: res?.listing?.images?.length ? res.listing.images : updates.images!,
      } as MaterialListing;

      onSave(mergedListing);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save changes. If uploading a very large photo, try a smaller image or an image URL.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    try {
      const editedMap = JSON.parse(localStorage.getItem('ecoloop_edited_listings') || '{}');
      delete editedMap[listing.id];
      localStorage.setItem('ecoloop_edited_listings', JSON.stringify(editedMap));
      window.location.reload();
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-ecoDark-surface rounded-2xl shadow-2xl border border-slate-200 dark:border-emerald-900/60 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">Edit Waste Listing & Photo</h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Customize company name, upload a JPG photo, and update material details
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Company / Business Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Your Company / Business Name *</span>
            </label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Tata Steel Scrap Division, Bengal Recyclers, etc."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white font-medium"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Decide the exact company or seller name shown for this waste listing.
            </p>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Material Title *</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Clean Corrugated Cardboard"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setCategory(newCat);
                  if (imageMode === 'preset') {
                    setImageUrl(CATEGORY_IMAGES[newCat] || CATEGORY_IMAGES['Paper/Cardboard']);
                  }
                }}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white font-medium"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-emerald-950/60">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Material Photo (Upload JPG or Provide URL) *
              </label>
              <div className="flex bg-slate-100 dark:bg-emerald-950/60 p-0.5 rounded-lg border border-slate-200 dark:border-emerald-900/60 text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                    imageMode === 'upload'
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Upload className="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                  <span>Upload JPG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('url')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                    imageMode === 'url'
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Link2 className="w-3 h-3" />
                  <span>Image URL</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setImageMode('preset');
                    setImageUrl(CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Paper/Cardboard']);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                    imageMode === 'preset'
                      ? 'bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Presets</span>
                </button>
              </div>
            </div>

            {/* Mode 1: Upload JPG/PNG */}
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
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40'
                      : 'border-slate-200 dark:border-emerald-900/60 hover:border-emerald-400 bg-slate-50/50 dark:bg-ecoDark-card/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-14 h-14 rounded-lg object-cover border border-emerald-500/40 shadow-sm shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Photo Attached</span>
                        </div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs mt-0.5">
                          {uploadFileName || 'Current photo'}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          Click to select a different JPG / PNG from device
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors shrink-0"
                    >
                      Choose JPG
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Mode 2: URL */}
            {imageMode === 'url' && (
              <div className="flex gap-2 items-center">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or any photo URL"
                  className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-emerald-900/60 focus:border-emerald-500 focus:outline-none bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-emerald-900/60 shrink-0"
                />
              </div>
            )}

            {/* Mode 3: Presets */}
            {imageMode === 'preset' && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-ecoDark-card border border-slate-200 dark:border-emerald-900/60">
                <img
                  src={CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Paper/Cardboard']}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover border border-emerald-500/40"
                />
                <div className="text-xs">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Standard Industrial Photo for {category}
                  </p>
                  <button
                    type="button"
                    onClick={() => setImageUrl(CATEGORY_IMAGES[category] || CATEGORY_IMAGES['Paper/Cardboard'])}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold mt-0.5"
                  >
                    Use this preset
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Pricing, Quantity, City, Condition */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <IndianRupee className="w-3 h-3 text-emerald-600" />
                <span>Price / {unit}</span>
              </label>
              <input
                type="number"
                step="any"
                value={pricePerUnit}
                onChange={(e) => setPricePerUnit(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Scale className="w-3 h-3 text-emerald-600" />
                <span>Quantity</span>
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="any"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="px-1 text-xs rounded-lg border border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
                >
                  <option value="kg">kg</option>
                  <option value="tons">tons</option>
                  <option value="pieces">pcs</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                <span>City</span>
              </label>
              <select
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Quality Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-emerald-900/60 bg-white dark:bg-ecoDark-card text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-emerald-950/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleResetToDefault}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Reset listing back to built-in factory defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-ecoDark-card transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save & Update Listing'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
