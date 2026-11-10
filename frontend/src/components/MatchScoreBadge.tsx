import React, { useState } from 'react';
import { MatchResult } from '../types';
import { Sparkles, ChevronDown, ChevronUp, Truck, CheckCircle2, Info } from 'lucide-react';

interface MatchScoreBadgeProps {
  match?: MatchResult | null;
  compact?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ match, compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!match) return null;

  const score = typeof match.matchPercentage === 'number' ? Math.round(match.matchPercentage) : 85;

  // Determine badge color gradient based on score
  const getBadgeStyle = () => {
    if (score >= 85) return 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-600';
    if (score >= 70) return 'bg-teal-50 dark:bg-teal-950/90 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-600';
    return 'bg-amber-50 dark:bg-amber-950/90 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-600';
  };

  const getProgressColor = () => {
    if (score >= 85) return 'bg-emerald-600 dark:bg-emerald-400';
    if (score >= 70) return 'bg-teal-600 dark:bg-teal-400';
    return 'bg-amber-500 dark:bg-amber-400';
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border shadow-xs ${getBadgeStyle()}`}
        title={`AI Match Score: ${score}%`}
      >
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-600 dark:text-emerald-400" />
        <span>{score}% Match</span>
      </div>
    );
  }

  const distanceKm = typeof match.distanceKm === 'number' ? match.distanceKm : 12;

  return (
    <div className="bg-white dark:bg-ecoDark-card rounded-2xl border border-emerald-100/80 dark:border-emerald-500/20 shadow-card p-5 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-extrabold text-base shadow-sm shadow-emerald-500/30">
            {score}%
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white">AI Circular Match</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                {score >= 85 ? 'High Synergy' : score >= 70 ? 'Viable Fit' : 'Moderate Match'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {distanceKm === 0 ? 'Same city' : `${distanceKm} km transit`} • Proximity-weighted
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:text-emerald-800 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-ecoDark-surface hover:bg-emerald-100 dark:hover:bg-ecoDark-hover transition-colors"
        >
          <span>{isOpen ? 'Hide Breakdown' : 'View Factors'}</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 w-full bg-slate-100 dark:bg-ecoDark-surface h-2 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Matching reasons pill row */}
      {Array.isArray(match.reasons) && match.reasons.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {match.reasons.slice(0, 3).map((reason, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800/60"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{reason}</span>
            </span>
          ))}
        </div>
      )}

      {/* Expanded Factors Breakdown */}
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-emerald-950/60 space-y-3.5 text-xs animate-fadeIn">
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            <Info className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Deterministic Scoring Algorithm Weights:</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="bg-slate-50 dark:bg-ecoDark-surface p-2.5 rounded-xl border border-slate-100 dark:border-emerald-950/60">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-1">
                <span>Category (30%)</span>
                <span className="font-bold text-slate-800 dark:text-white">{match.factors.categoryScore}/30</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full" style={{ width: `${(match.factors.categoryScore / 30) * 100}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-ecoDark-surface p-2.5 rounded-xl border border-slate-100 dark:border-emerald-950/60">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-1">
                <span>Proximity (20%)</span>
                <span className="font-bold text-slate-800 dark:text-white">{match.factors.proximityScore}/20</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full" style={{ width: `${(match.factors.proximityScore / 20) * 100}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-ecoDark-surface p-2.5 rounded-xl border border-slate-100 dark:border-emerald-950/60">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-1">
                <span>Quantity (15%)</span>
                <span className="font-bold text-slate-800 dark:text-white">{match.factors.quantityScore}/15</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full" style={{ width: `${(match.factors.quantityScore / 15) * 100}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-ecoDark-surface p-2.5 rounded-xl border border-slate-100 dark:border-emerald-950/60">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-1">
                <span>Price (15%)</span>
                <span className="font-bold text-slate-800 dark:text-white">{match.factors.priceScore}/15</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full" style={{ width: `${(match.factors.priceScore / 15) * 100}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-ecoDark-surface p-2.5 rounded-xl border border-slate-100 dark:border-emerald-950/60">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-1">
                <span>Condition (10%)</span>
                <span className="font-bold text-slate-800 dark:text-white">{match.factors.conditionScore}/10</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full" style={{ width: `${(match.factors.conditionScore / 10) * 100}%` }} />
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-ecoDark-surface p-2.5 rounded-xl border border-slate-100 dark:border-emerald-950/60">
              <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 mb-1">
                <span>Availability (10%)</span>
                <span className="font-bold text-slate-800 dark:text-white">{match.factors.availabilityScore}/10</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-600 dark:bg-emerald-400 h-full rounded-full" style={{ width: `${(match.factors.availabilityScore / 10) * 100}%` }} />
              </div>
            </div>
          </div>

          {/* Logistics Advice */}
          <div className="bg-emerald-50/60 dark:bg-ecoDark-surface p-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-900 dark:text-emerald-200">Transportation & Logistics Recommendation:</p>
              <p className="text-emerald-800 dark:text-emerald-300 mt-0.5">{match.transportationAdvice}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
