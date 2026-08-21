import React from 'react';

/**
 * AtsScoreBadge - Radial SVG Circular Progress Gauge for ATS Score
 * 
 * Props:
 * @param {number} score - Integer from 0 to 100
 * @param {number|string} size - Pixel diameter or preset ('sm' | 'md' | 'lg' | 'xl')
 * @param {number} strokeWidth - Gauge ring stroke width in pixels
 * @param {boolean} showTier - Whether to show the tier pill beneath the score
 * @param {string} className - Additional container styling
 */
export default function AtsScoreBadge({
  score = 0,
  size = 'md',
  strokeWidth,
  showTier = true,
  className = '',
}) {
  // Normalize size presets to numeric pixel dimensions
  const sizeMap = {
    sm: 120,
    md: 160,
    lg: 200,
    xl: 240,
  };
  const numericSize = typeof size === 'number' ? size : (sizeMap[size] || 160);
  const numericStroke = strokeWidth || (numericSize >= 200 ? 14 : numericSize >= 160 ? 12 : 9);

  // Clamp score between 0 and 100
  const validScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

  // SVG dimensions & math
  const center = numericSize / 2;
  const radius = (numericSize - numericStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  // Dynamic Color & Tier Logic
  // score >= 80 -> emerald-500 (#10B981), Strong Match
  // 60-79 -> amber-500 (#F59E0B), Moderate
  // < 60 -> rose-500 (#F43F5E), Needs Revision
  const getTierData = (val) => {
    if (val >= 80) {
      return {
        label: 'Strong Match',
        colorHex: '#10B981',
        strokeClass: 'text-emerald-500',
        bgTrackClass: 'text-emerald-500/15',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        ringGlow: 'shadow-emerald-100',
        textColor: 'text-emerald-700',
        icon: '✓',
      };
    }
    if (val >= 60) {
      return {
        label: 'Moderate',
        colorHex: '#F59E0B',
        strokeClass: 'text-amber-500',
        bgTrackClass: 'text-amber-500/15',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        ringGlow: 'shadow-amber-100',
        textColor: 'text-amber-700',
        icon: '▲',
      };
    }
    return {
      label: 'Needs Revision',
      colorHex: '#F43F5E',
      strokeClass: 'text-rose-500',
      bgTrackClass: 'text-rose-500/15',
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      ringGlow: 'shadow-rose-100',
      textColor: 'text-rose-700',
      icon: '!',
    };
  };

  const tier = getTierData(validScore);

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: numericSize, height: numericSize }}
    >
      <svg
        width={numericSize}
        height={numericSize}
        viewBox={`0 0 ${numericSize} ${numericSize}`}
        className="transform -rotate-90 drop-shadow-sm"
      >
        {/* Background Track Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={numericStroke}
          className={`${tier.bgTrackClass} transition-colors duration-500`}
        />

        {/* Animated Progress Foreground Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={numericStroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={`${tier.strokeClass} transition-all duration-700 ease-out`}
          style={{
            transitionProperty: 'stroke-dashoffset, stroke',
          }}
        />
      </svg>

      {/* Center Numerical Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
        <div className="flex items-baseline justify-center">
          <span
            className="font-extrabold tracking-tight text-olive-wood leading-none"
            style={{ fontSize: numericSize >= 200 ? '2.75rem' : numericSize >= 160 ? '2.25rem' : '1.75rem' }}
          >
            {validScore}
          </span>
          <span
            className="font-semibold text-olive-wood/50 ml-0.5"
            style={{ fontSize: numericSize >= 160 ? '0.875rem' : '0.75rem' }}
          >
            /100
          </span>
        </div>

        {showTier && (
          <span
            className={`mt-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold leading-tight flex items-center gap-1 transition-all duration-300 ${tier.badgeBg}`}
          >
            <span className="text-[10px] font-bold">{tier.icon}</span>
            <span>{tier.label}</span>
          </span>
        )}
      </div>
    </div>
  );
}
