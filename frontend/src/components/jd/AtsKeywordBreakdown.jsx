import React, { useState } from 'react';

/**
 * AtsKeywordBreakdown Component - Calm Executive Dark Theme
 *
 * Displays keyword match analysis against a Target Job Description:
 * 1) Circular match score ring (SVG radial gauge) with dynamic color:
 *    - Green (#34D399) for >=75%
 *    - Amber/Orange (#F97316) for 50-74%
 *    - Rose (#F87171) for <50%
 * 2) Matched Skills with green badge tags
 * 3) Missing Keywords with neutral badge tags and one-click copy
 * 4) Actionable Recommendation Tips card with copyable phrases
 */
export default function AtsKeywordBreakdown({
  matchScore = 0,
  matchedKeywords = [],
  missingKeywords = [],
  recommendations = [],
  className = '',
  isLoading = false,
}) {
  const [copiedItem, setCopiedItem] = useState(null);

  if (isLoading) {
    return (
      <div className={`space-y-4 animate-pulse ${className}`} aria-label="Loading keyword analysis">
        <div className="p-4 rounded-xl border border-white/[0.06] bg-[#12151C] flex items-center gap-4">
          <div className="w-20 h-20 rounded-full border-2 border-white/[0.06] bg-[#0B0D12]"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-white/[0.05] rounded"></div>
            <div className="h-3 w-48 bg-white/[0.03] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const normalizedScore = Math.min(100, Math.max(0, Math.round(Number(matchScore) || 0)));

  const getTheme = (score) => {
    if (score >= 75) {
      return {
        stroke: '#34D399',
        text: 'text-[#34D399]',
        bg: 'bg-[#34D399]/5',
        border: 'border-[#34D399]/20',
        badge: 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20',
        ringBg: 'text-[#171B24]',
        label: 'Strong Job Fit',
        subtext: 'High keyword alignment! Your resume passes primary ATS filters.',
      };
    }
    if (score >= 50) {
      return {
        stroke: '#F97316',
        text: 'text-[#F97316]',
        bg: 'bg-[#F97316]/5',
        border: 'border-[#F97316]/20',
        badge: 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20',
        ringBg: 'text-[#171B24]',
        label: 'Moderate Alignment',
        subtext: 'Solid foundation. Incorporating missing keywords will boost your screening rank.',
      };
    }
    return {
      stroke: '#F87171',
      text: 'text-[#F87171]',
      bg: 'bg-[#F87171]/5',
      border: 'border-[#F87171]/20',
      badge: 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20',
      ringBg: 'text-[#171B24]',
      label: 'Needs Keyword Optimization',
      subtext: 'Low keyword overlap. Add suggested technical terms to match job requirements.',
    };
  };

  const theme = getTheme(normalizedScore);

  const radius = 42;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedItem(id);
    setTimeout(() => {
      setCopiedItem(null);
    }, 2000);
  };

  return (
    <div className={`space-y-3.5 ${className}`}>
      {/* 1. Circular Match Score Ring */}
      <div className={`p-4 rounded-xl border ${theme.border} ${theme.bg} shadow-xs flex flex-col sm:flex-row items-center gap-4`}>
        <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
              className={theme.ringBg}
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={theme.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold tracking-tight text-[#ECEEF2]">
              {normalizedScore}%
            </span>
            <span className="text-[10px] text-[#9AA1AE] uppercase font-medium">Fit</span>
          </div>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${theme.badge}`}>
            {theme.label}
          </span>
          <p className="text-xs text-[#9AA1AE] leading-relaxed">
            {theme.subtext}
          </p>
        </div>
      </div>

      {/* 2. Matched Skills */}
      <div className="bg-[#12151C] p-3.5 rounded-xl border border-white/[0.06] shadow-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <span className="text-xs font-semibold text-[#ECEEF2] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
            Matched Keywords ({matchedKeywords.length})
          </span>
          <span className="text-[10px] text-[#34D399] font-medium bg-[#34D399]/10 border border-[#34D399]/20 px-2 py-0.5 rounded-md">
            Verified ATS
          </span>
        </div>

        {matchedKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {matchedKeywords.map((kw, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20"
              >
                <span className="font-bold">✓</span>
                <span>{kw}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6B7280] italic py-1">
            No direct keyword overlap found yet.
          </p>
        )}
      </div>

      {/* 3. Missing Keywords to Add */}
      <div className="bg-[#12151C] p-3.5 rounded-xl border border-white/[0.06] shadow-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <span className="text-xs font-semibold text-[#ECEEF2] uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
            Missing Keywords to Add ({missingKeywords.length})
          </span>
          <span className="text-[10px] text-[#9AA1AE] font-normal">
            Click to copy
          </span>
        </div>

        {missingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {missingKeywords.map((kw, idx) => {
              const isCopied = copiedItem === `kw-${idx}`;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCopy(kw, `kw-${idx}`)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    isCopied
                      ? 'bg-[#34D399] text-[#0B0D12] font-semibold border-[#34D399]'
                      : 'bg-[#171B24] text-[#ECEEF2] border-white/[0.06] hover:bg-[#202531]'
                  }`}
                  title={`Copy "${kw}" to clipboard`}
                >
                  {isCopied ? (
                    <span>✓ Copied</span>
                  ) : (
                    <>
                      <span className="text-[#F97316] font-bold">+</span>
                      <span>{kw}</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#34D399] font-medium py-1">
            ✓ All critical keywords from this posting are matched!
          </p>
        )}
      </div>

      {/* 4. Actionable Recommendation Tips */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-[#12151C] p-3.5 rounded-xl border border-white/[0.06] shadow-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
            <span className="text-xs font-semibold text-[#ECEEF2] uppercase tracking-wider flex items-center gap-1.5">
              <span className="text-[#F97316]">⚡</span>
              Recommendation Tips
            </span>
          </div>

          <div className="space-y-1.5">
            {recommendations.map((rec, idx) => {
              const isCopied = copiedItem === `rec-${idx}`;
              return (
                <div
                  key={idx}
                  className="bg-[#0B0D12] p-2.5 rounded-lg border border-white/[0.06] flex items-center justify-between gap-3"
                >
                  <p className="text-xs text-[#9AA1AE] leading-relaxed flex-1">
                    {rec}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleCopy(rec, `rec-${idx}`)}
                    className="text-[11px] font-medium text-[#9AA1AE] hover:text-[#ECEEF2] transition-colors shrink-0 cursor-pointer"
                  >
                    {isCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
