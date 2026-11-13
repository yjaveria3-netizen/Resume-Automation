import React from 'react';

/**
 * PageBudgetMeter Component - Calm Executive Dark Theme
 *
 * Visual progress bar & compact gauge indicating resume line capacity.
 * Warns users when content approaches or exceeds the strict 1-page boundary (45 lines max, 42 threshold).
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
      className={`p-4 rounded-xl border ${
        overflow ? 'border-[#F97316]/50 bg-[#12151C]' : 'border-white/[0.06] bg-[#12151C]'
      } shadow-xs flex flex-col gap-2.5 transition-all ${className}`}
    >
      {/* Top row: Status Badge & Label */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {overflow ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#F97316]/10 border border-[#F97316]/20 text-[#F97316] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
              <span>1-Page Limit Reached</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#34D399]/10 border border-[#34D399]/20 text-[#34D399] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
              <span>Strict 1-Page Safe</span>
            </span>
          )}
          <span className="text-xs font-medium text-[#ECEEF2] hidden sm:inline">
            Resume Line Capacity
          </span>
        </div>

        {/* Capacity Count Text */}
        <span
          className={`text-xs font-medium ${
            overflow ? 'text-[#F97316]' : 'text-[#34D399]'
          }`}
        >
          {overflow ? (
            <span>
              {currentLines} / {maxLines} lines — <span className="underline">Overflow Risk!</span>
            </span>
          ) : (
            <span>
              {currentLines} / {maxLines} lines used
            </span>
          )}
        </span>
      </div>

      {/* Progress Bar Gauge */}
      <div className="w-full bg-[#0B0D12] rounded-full h-1.5 overflow-hidden border border-white/[0.04]">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            overflow
              ? 'bg-[#F97316]'
              : 'bg-[#34D399]'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Helper subtext & quick Smart Swap action if overflow */}
      {overflow && (
        <div className="flex items-center justify-between pt-0.5 text-[11px] text-[#F97316]">
          <span>Page budget reached. Adding more projects will create a 2nd page.</span>
          {onSmartSwapClick && (
            <button
              type="button"
              onClick={onSmartSwapClick}
              className="font-medium underline text-[#F97316] hover:text-[#ECEEF2] cursor-pointer ml-2 px-1"
            >
              Open Smart Swap →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
