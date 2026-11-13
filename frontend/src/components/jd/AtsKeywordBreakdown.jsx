import React, { useState } from 'react';

/**
 * AtsKeywordBreakdown Component (Day 12 Job Matcher)
 *
 * Displays keyword match analysis against a Target Job Description:
 * 1) Large circular match score ring (SVG radial gauge) with dynamic color:
 *    - emerald for >=75%
 *    - amber for 50-74%
 *    - rose for <50%
 * 2) Section 'Matched Skills (N)' with green badge tags (bg-emerald-50 text-emerald-800 border border-emerald-200) with checkmarks
 * 3) Section 'Missing Keywords to Add (N)' with amber badge tags (bg-amber-50 text-amber-800 border border-amber-200) with '+' icons
 *    and one-click copy functionality
 * 4) 'Actionable Recommendation Tips' card with lightbulb icon and copyable suggested bullet phrases
 */
export default function AtsKeywordBreakdown({
  matchScore = 0,
  matchedKeywords = [],
  missingKeywords = [],
  recommendations = [],
  className = '',
}) {
  const [copiedItem, setCopiedItem] = useState(null);

  // Clamp score between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, Math.round(Number(matchScore) || 0)));

  // Color schemes based on thresholds: emerald >=75%, amber 50-74%, rose <50%
  const getTheme = (score) => {
    if (score >= 75) {
      return {
        stroke: '#10b981', // emerald-500
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'bg-emerald-600 text-white',
        ringBg: 'text-emerald-100',
        label: 'Strong Job Fit',
        subtext: 'High keyword alignment! Your resume passes primary ATS filters.',
      };
    }
    if (score >= 50) {
      return {
        stroke: '#f59e0b', // amber-500
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'bg-amber-500 text-white',
        ringBg: 'text-amber-100',
        label: 'Moderate Alignment',
        subtext: 'Solid foundation, but incorporating missing keywords will boost your ranking.',
      };
    }
    return {
      stroke: '#f43f5e', // rose-500
      text: 'text-rose-700',
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      badge: 'bg-rose-500 text-white',
      ringBg: 'text-rose-100',
      label: 'Needs Keyword Optimization',
      subtext: 'Low keyword overlap. Add suggested technical terms to match job requirements.',
    };
  };

  const theme = getTheme(normalizedScore);

  // SVG Radial Gauge geometry
  const radius = 52;
  const strokeWidth = 8;
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
    <div className={`space-y-5 ${className}`}>
      {/* 1. Large Circular Match Score Ring (SVG Radial Gauge) */}
      <div className={`p-5 rounded-3xl border ${theme.border} ${theme.bg} shadow-xs flex flex-col sm:flex-row items-center gap-5 sm:gap-6`}>
        {/* SVG Radial Gauge */}
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            {/* Background Track Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              className={theme.ringBg}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Animated Dynamic Progress Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              stroke={theme.stroke}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Center Text inside ring */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className={`text-2xl font-black tracking-tight ${theme.text}`}>
              {normalizedScore}%
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Match
            </span>
          </div>
        </div>

        {/* Score Details & Description */}
        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Target Job Compatibility
            </span>
            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${theme.badge}`}>
              {theme.label}
            </span>
          </div>
          <h3 className={`text-lg sm:text-xl font-black ${theme.text}`}>
            {normalizedScore >= 75
              ? 'Excellent ATS Match Score'
              : normalizedScore >= 50
              ? 'Competitive ATS Match Score'
              : 'Keyword Action Required'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {theme.subtext}
          </p>
        </div>
      </div>

      {/* 2. Section: Matched Skills (N) with green badge tags */}
      <div className="bg-white p-5 rounded-3xl border border-khaki/30 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-khaki/20">
          <span className="text-xs font-bold text-olive-wood uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Matched Skills ({matchedKeywords.length})
          </span>
          <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Found in Resume
          </span>
        </div>

        {matchedKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-2 pt-1">
            {matchedKeywords.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold shadow-2xs transition-transform hover:scale-105"
              >
                <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>{skill}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic py-1">
            No direct keyword overlap found yet. Paste job requirements to check matching keywords.
          </p>
        )}
      </div>

      {/* 3. Section: Missing Keywords to Add (N) with amber badge tags & copy feature */}
      <div className="bg-white p-5 rounded-3xl border border-khaki/30 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-khaki/20">
          <span className="text-xs font-bold text-olive-wood uppercase tracking-wider flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Missing Keywords to Add ({missingKeywords.length})
          </span>
          <span className="text-[11px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Click to Copy
          </span>
        </div>

        {missingKeywords.length > 0 ? (
          <div className="space-y-2 pt-1">
            <p className="text-[11px] text-slate-500">
              Click any keyword below to copy it directly to your clipboard for quick insertion into your resume bullets:
            </p>
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((kw, idx) => {
                const isCopied = copiedItem === `kw-${idx}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCopy(kw, `kw-${idx}`)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                      isCopied
                        ? 'bg-emerald-600 text-white border-emerald-600 scale-105'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 hover:border-amber-300 active:scale-95'
                    }`}
                    title={`Click to copy "${kw}" to clipboard`}
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <span className="text-amber-600 font-extrabold text-sm leading-none">+</span>
                        <span>{kw}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-emerald-700 font-medium py-1 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
            All critical keywords from this job posting are matched in your resume!
          </p>
        )}
      </div>

      {/* 4. Actionable Recommendation Tips Card with lightbulb icon and copyable suggested bullet phrases */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50/70 via-khaki-light/50 to-amber-50/40 p-5 rounded-3xl border border-amber-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
              {/* Lightbulb Icon */}
              <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14H8a4 4 0 01-.8-7.92 4.002 4.002 0 017.6 0A4 4 0 0112 14z" />
              </svg>
              Actionable Recommendation Tips
            </span>
            <span className="text-[11px] text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded-full">
              Suggested Bullet Phrases
            </span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec, idx) => {
              const isCopied = copiedItem === `rec-${idx}`;
              return (
                <div
                  key={idx}
                  className="bg-white/90 p-3.5 rounded-2xl border border-amber-100 hover:border-amber-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 shadow-2xs group"
                >
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="text-amber-500 font-bold text-xs mt-0.5 select-none">▸</span>
                    <p className="text-xs text-slate-800 leading-relaxed font-medium">
                      {rec}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(rec, `rec-${idx}`)}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isCopied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                    }`}
                    title="Copy phrase to clipboard"
                  >
                    {isCopied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copy Phrase</span>
                      </>
                    )}
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
