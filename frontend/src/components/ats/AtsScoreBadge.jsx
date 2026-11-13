import React from 'react';

/**
 * AtsScoreBadge - Radial SVG Circular Progress Gauge for ATS Score
 * Calm Executive Dark Theme
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
  const sizeMap = {
    sm: 120,
    md: 160,
    lg: 200,
    xl: 240,
  };
  const numericSize = typeof size === 'number' ? size : (sizeMap[size] || 160);
  const numericStroke = strokeWidth || (numericSize >= 200 ? 12 : numericSize >= 160 ? 10 : 8);

  // Clamp score between 0 and 100
  const validScore = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

  // SVG dimensions & math
  const center = numericSize / 2;
  const radius = (numericSize - numericStroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (validScore / 100) * circumference;

  // Dynamic Color & Tier Logic:
  // score >= 80 -> Green (#34D399), Strong Match
  // 60-79 -> Orange (#F97316), Moderate
  // < 60 -> Red (#F87171), Needs Revision
  const getTierData = (val) => {
    if (val >= 80) {
      return {
        label: 'Strong Match',
        colorHex: '#34D399',
        strokeColor: '#34D399',
        bgTrackColor: '#171B24',
        badgeBg: 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20',
        icon: '✓',
      };
    }
    if (val >= 60) {
      return {
        label: 'Moderate',
        colorHex: '#F97316',
        strokeColor: '#F97316',
        bgTrackColor: '#171B24',
        badgeBg: 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20',
        icon: '▲',
      };
    }
    return {
      label: 'Needs Revision',
      colorHex: '#F87171',
      strokeColor: '#F87171',
      bgTrackColor: '#171B24',
      badgeBg: 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20',
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
        className="transform -rotate-90"
      >
        {/* Background Track Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={tier.bgTrackColor}
          strokeWidth={numericStroke}
          className="transition-colors duration-500"
        />

        {/* Animated Progress Foreground Ring */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="transparent"
          stroke={tier.strokeColor}
          strokeWidth={numericStroke}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{
            transitionProperty: 'stroke-dashoffset, stroke',
          }}
        />
      </svg>

      {/* Center Numerical Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
        <div className="flex items-baseline justify-center">
          <span
            className="font-bold tracking-tight text-[#ECEEF2] leading-none"
            style={{ fontSize: numericSize >= 200 ? '2.5rem' : numericSize >= 160 ? '2rem' : '1.5rem' }}
          >
            {validScore}
          </span>
          <span
            className="font-normal text-[#9AA1AE] ml-0.5"
            style={{ fontSize: numericSize >= 160 ? '0.875rem' : '0.75rem' }}
          >
            /100
          </span>
        </div>

        {showTier && (
          <span
            className={`mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium leading-tight flex items-center gap-1 transition-all duration-300 ${tier.badgeBg}`}
          >
            <span className="text-[10px] font-semibold">{tier.icon}</span>
            <span>{tier.label}</span>
          </span>
        )}
      </div>
    </div>
  );
}
