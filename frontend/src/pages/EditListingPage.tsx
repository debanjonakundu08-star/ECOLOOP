import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { MaterialListing } from '../types';
import { useAuth } from '../context/AuthContext';
import { EditListingModal } from '../components/EditListingModal';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState<MaterialListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadListing() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.materials.getById(id);
        if (res && res.listing) {
          setListing(res.listing);
        } else {
          setError('Listing not found');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Verifying listing ownership permissions...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-ecoDark-surface border border-slate-200 dark:border-emerald-900/60 shadow-xl text-center space-y-4">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Listing Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{error || 'This listing does not exist or has been removed.'}</p>
          <Link
            to="/marketplace"
            className="inline-block px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 text-white"
          >
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = Boolean(user && listing.sellerId && user.id === listing.sellerId);

  // Direct URL access restriction: Deny non-owners
  if (!isOwner) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-ecoDark-surface border border-red-200 dark:border-red-900/60 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-600 dark:text-red-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Access Denied (403)</h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            You cannot edit this listing. Only the registered user who originally posted this material can modify or edit it.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              to={`/materials/${id}`}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
            >
              View Material Listing
            </Link>
            <Link
              to="/marketplace"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-ecoDark-card text-slate-700 dark:text-slate-300 transition-colors"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-ecoDark-surface border border-emerald-200 dark:border-emerald-800/60 shadow-xl text-center space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Authorized Owner Access</h2>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Editing listing: <strong className="text-emerald-700 dark:text-emerald-400">{listing.title}</strong>
        </p>
        <button
          onClick={() => navigate(`/materials/${id}`)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Material View</span>
        </button>

        <EditListingModal
          listing={listing}
          isOpen={true}
          onClose={() => navigate(`/materials/${id}`)}
          onSave={(updated) => {
            navigate(`/materials/${id}`, { replace: true });
          }}
        />
      </div>
    </div>
  );
};
