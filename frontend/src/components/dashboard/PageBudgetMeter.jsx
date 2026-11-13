import React from 'react';

/**
 * PageBudgetMeter Component (Day 12 1-Page Strictness)
 *
 * Visual progress bar & compact gauge indicating resume line capacity.
 * Warns users when content approaches or exceeds the strict 1-page boundary (45 lines max, 42 threshold).
 *
 * @param {number} linesUsed - Total lines calculated in resume document
 * @param {number} maxLines - Strict 1-page line limit (default: 45)
 * @param {boolean} isOverflow - Forced overflow state if known
 * @param {string} className - Optional container styling
 * @param {Function} onSmartSwapClick - Optional callback to trigger swap modal manually
 */
export default function PageBudgetMeter({
  linesUsed = 38,
  maxLines = 45,
  isOverflow = false,
  className = '',
  onSmartSwapClick = null,
}) {
  const currentLines = Number(linesUsed) || 0;
  const safeThreshold = 42;
  const overflow = isOverflow || currentLines > safeThreshold;
  const percentage = Math.min(100, Math.round((currentLines / maxLines) * 100));

  return (
    <div
      className={`bg-white p-3.5 sm:p-4 rounded-2xl border ${
        overflow ? 'border-amber-300 bg-amber-50/20' : 'border-khaki/40'
      } shadow-xs flex flex-col gap-2 transition-all ${className}`}
    >
      {/* Top row: Status Badge & Label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {overflow ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-extrabold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              ■■ 1-Page Limit Reached
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-extrabold">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              ■ 1-Page Optimal
            </span>
          )}
          <span className="text-xs font-bold text-olive-wood/80 hidden sm:inline">
            1-Page Line Budget
          </span>
        </div>

        {/* Capacity Count Text */}
        <span
          className={`text-xs font-extrabold ${
            overflow ? 'text-amber-800' : 'text-emerald-700'
          }`}
        >
          {overflow ? (
            <span>
              {currentLines} / {maxLines} lines — <span className="underline">Overflow Risk!</span>
            </span>
          ) : (
            <span>
              {currentLines} / {maxLines} lines used — 1 Page Safe
            </span>
          )}
        </span>
      </div>

      {/* Progress Bar Gauge */}
      <div className="w-full bg-khaki/20 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            overflow
              ? 'bg-gradient-to-r from-amber-400 to-amber-600'
              : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Helper subtext & quick Smart Swap action if overflow */}
      {overflow && (
        <div className="flex items-center justify-between pt-0.5 text-[11px] text-amber-900">
          <span>Page budget reached. Adding more projects will create page 2.</span>
          {onSmartSwapClick && (
            <button
              type="button"
              onClick={onSmartSwapClick}
              className="font-bold underline text-amber-900 hover:text-amber-950 cursor-pointer ml-2 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded px-1"
            >
              Open Smart Swap
            </button>
          )}
        </div>
      )}
    </div>
  );
}
