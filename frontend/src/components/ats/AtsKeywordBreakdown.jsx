import React from 'react';

/**
 * AtsKeywordBreakdown Component (Person B)
 *
 * Displays keyword match analysis against a Target Job Description:
 * - Overall Match Score %
 * - Matched keyword pills (green)
 * - Missing keyword pills (amber/rose) with actionable recommendations
 */
export default function AtsKeywordBreakdown({
  matchScore = 0,
  matchedKeywords = [],
  missingKeywords = [],
  recommendations = [],
  className = '',
}) {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getScoreBadgeBg = (score) => {
    if (score >= 80) return 'bg-emerald-600';
    if (score >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Match Score Banner */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${getScoreColor(matchScore)}`}>
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
            Job Fit Compatibility
          </span>
          <span className="text-xl sm:text-2xl font-black">
            {matchScore}% Match Score
          </span>
          <p className="text-xs mt-0.5 opacity-80">
            {matchScore >= 80
              ? 'Excellent alignment with job requirements! ATS screening likely to pass.'
              : matchScore >= 60
              ? 'Moderate alignment. Adding missing keywords will boost your ranking.'
              : 'Low keyword alignment. Consider incorporating key target skills.'}
          </p>
        </div>
        <div className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0 ${getScoreBadgeBg(matchScore)}`}>
          {matchScore}%
        </div>
      </div>

      {/* Matched Keywords Section */}
      <div className="bg-white p-4 rounded-2xl border border-khaki/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-olive-wood uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Matched Keywords ({matchedKeywords.length})
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
            Found in Resume
          </span>
        </div>
        {matchedKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold"
              >
                <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                {kw}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-olive-wood/60 italic">No keyword overlap detected yet.</p>
        )}
      </div>

      {/* Missing Keywords Section */}
      <div className="bg-white p-4 rounded-2xl border border-khaki/30 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-olive-wood uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Missing Target Keywords ({missingKeywords.length})
          </span>
          <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
            Recommended Additions
          </span>
        </div>
        {missingKeywords.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((kw, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold"
                title={`Consider adding "${kw}" to your skills or project bullets`}
              >
                <span className="text-amber-500 font-bold">+</span>
                {kw}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-emerald-700 font-medium">All key target terms are present in your resume!</p>
        )}
      </div>

      {/* Actionable Tips & Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-khaki-light/40 p-4 rounded-2xl border border-khaki/30 space-y-2">
          <span className="text-xs font-bold text-olive-wood uppercase tracking-wider flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Actionable Optimization Tips
          </span>
          <ul className="space-y-1.5 text-xs text-olive-wood/80 list-disc list-inside">
            {recommendations.map((rec, i) => (
              <li key={i} className="leading-relaxed">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
