import React, { useState } from 'react';
import AtsScoreBadge from './AtsScoreBadge';
import AtsFeedbackList from './AtsFeedbackList';
import { mockAtsData94 } from './mockAtsData';

/**
 * AtsScoreCard - Master ATS Feedback Container Component
 * 
 * Props:
 * @param {number} score - Overall ATS score (0-100)
 * @param {string} tier - Tier label ('Strong Match' | 'Moderate' | 'Needs Revision')
 * @param {object} breakdown - Sub-scores object { actionVerbs, quantifiableMetrics, keywordAlignment, formattingCleanliness }
 * @param {Array} feedback - Array of feedback items for AtsFeedbackList
 * @param {string} lastAnalyzed - Timestamp string
 * @param {function} onExport - Callback when user clicks 'Export Report'
 * @param {function} onRecalculate - Callback when user clicks 'Re-calculate'
 * @param {boolean} isAnalyzing - Loading state indicator
 * @param {string} className - Additional CSS class
 */
export default function AtsScoreCard({
  score = mockAtsData94.score,
  tier = mockAtsData94.tier,
  breakdown = mockAtsData94.breakdown,
  feedback = mockAtsData94.feedback,
  lastAnalyzed = mockAtsData94.lastAnalyzed,
  onExport,
  onRecalculate,
  isAnalyzing = false,
  className = '',
}) {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview' | 'Keyword Match' | 'Bullet Improvements'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pass' | 'warn' | 'fail'

  const handleExport = () => {
    if (onExport) {
      onExport({ score, tier, breakdown, feedback });
    } else {
      // Default CSV/Report trigger
      const reportLines = [
        `ATS Resume Screening Report`,
        `Score: ${score}/100 (${tier})`,
        `Generated: ${new Date().toLocaleString()}`,
        `----------------------------------------`,
        `BREAKDOWN:`,
        `Action Verbs: ${breakdown?.actionVerbs?.score || 0}%`,
        `Quantifiable Metrics: ${breakdown?.quantifiableMetrics?.score || 0}%`,
        `Keyword Alignment: ${breakdown?.keywordAlignment?.score || 0}%`,
        `Formatting Cleanliness: ${breakdown?.formattingCleanliness?.score || 0}%`,
        `----------------------------------------`,
        `RECOMMENDATIONS:`,
        ...feedback.map(
          (f, i) =>
            `${i + 1}. [${f.status.toUpperCase()}] ${f.category}: ${f.message}\n   Advice: ${f.suggestion}`
        ),
      ];

      const blob = new Blob([reportLines.join('\n')], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ATS_Report_Score_${score}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // Filter feedback items based on active tab and status filter
  const getTabFilteredFeedback = () => {
    let items = feedback;

    if (activeTab === 'Keyword Match') {
      items = items.filter(
        (i) => i.category === 'Keyword Alignment' || i.tabCategory === 'Keyword Match'
      );
    } else if (activeTab === 'Bullet Improvements') {
      items = items.filter(
        (i) =>
          i.category === 'Action Verbs Used' ||
          i.category === 'Quantifiable Metrics Found' ||
          i.tabCategory === 'Bullet Improvements'
      );
    }
    // 'Overview' shows all items

    if (statusFilter !== 'all') {
      items = items.filter((i) => i.status === statusFilter);
    }

    return items;
  };

  const displayedFeedback = getTabFilteredFeedback();

  // Summary counts for quick inspection
  const passCount = feedback.filter((f) => f.status === 'pass').length;
  const warnCount = feedback.filter((f) => f.status === 'warn').length;
  const failCount = feedback.filter((f) => f.status === 'fail').length;

  return (
    <div
      className={`bg-white rounded-3xl border border-khaki/40 shadow-sm overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Top Header Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-khaki-light/80 to-white border-b border-khaki/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-sage/20 text-sage text-xs font-bold uppercase tracking-wider">
              ATS Analysis
            </span>
            <span className="text-xs text-olive-wood/60">
              Analyzed {lastAnalyzed || 'recently'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-olive-wood mt-1 flex items-center gap-2">
            <span>ATS Resume Strength & Screening</span>
          </h2>
          <p className="text-xs text-olive-wood/70 mt-0.5">
            Automated screening metrics modeled on top applicant tracking algorithms (Jobscan / Resume Worded).
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onRecalculate && (
            <button
              type="button"
              onClick={onRecalculate}
              disabled={isAnalyzing}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-olive-wood bg-white border border-khaki/50 hover:bg-khaki/15 active:scale-95 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg
                className={`w-4 h-4 text-olive-wood/70 ${isAnalyzing ? 'animate-spin' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>{isAnalyzing ? 'Analyzing...' : 'Re-calculate'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-sage hover:bg-sage-hover active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Score Hero & Metric Breakdown */}
      <div className="p-5 sm:p-6 bg-white border-b border-khaki/30 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radial Badge Gauge Column */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-khaki-light/40 rounded-2xl border border-khaki/30">
          <AtsScoreBadge score={score} size={170} strokeWidth={13} showTier={true} />
          
          <p className="text-xs text-center text-olive-wood/70 mt-3 font-medium px-2">
            {score >= 80
              ? '✨ Outstanding keyword alignment and bullet impact. Ready for submission.'
              : score >= 60
              ? '⚠️ Good foundation. Address the amber warnings below to unlock 80+.'
              : '🚨 Significant gaps in metrics and keywords. AI optimization recommended.'}
          </p>

          {/* Mini Status Pill Counters */}
          <div className="mt-3.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              ✓ {passCount} passed
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              ▲ {warnCount} warnings
            </span>
            {failCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold">
                ✕ {failCount} critical
              </span>
            )}
          </div>
        </div>

        {/* 4-Pillar Score Breakdown Bars Column */}
        <div className="lg:col-span-8 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-olive-wood/70 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            ATS Core Criteria Breakdown
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Action Verbs */}
            <div className="p-3.5 rounded-2xl bg-khaki-light/30 border border-khaki/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive-wood">Action Verbs Used</span>
                <span className="font-bold text-olive-wood">
                  {breakdown?.actionVerbs?.score || 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-khaki/20 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${breakdown?.actionVerbs?.score || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-olive-wood/60 mt-1.5">
                <span>{breakdown?.actionVerbs?.label || 'Analyzed'}</span>
                <span>{breakdown?.actionVerbs?.count ?? 0} found / {breakdown?.actionVerbs?.target ?? 15} target</span>
              </div>
            </div>

            {/* 2. Quantifiable Metrics */}
            <div className="p-3.5 rounded-2xl bg-khaki-light/30 border border-khaki/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive-wood">Quantifiable Metrics</span>
                <span className="font-bold text-olive-wood">
                  {breakdown?.quantifiableMetrics?.score || 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-khaki/20 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    (breakdown?.quantifiableMetrics?.score || 0) >= 80
                      ? 'bg-emerald-500'
                      : (breakdown?.quantifiableMetrics?.score || 0) >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${breakdown?.quantifiableMetrics?.score || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-olive-wood/60 mt-1.5">
                <span>{breakdown?.quantifiableMetrics?.label || 'Data points'}</span>
                <span>{breakdown?.quantifiableMetrics?.count ?? 0} bullets with metrics</span>
              </div>
            </div>

            {/* 3. Keyword Alignment */}
            <div className="p-3.5 rounded-2xl bg-khaki-light/30 border border-khaki/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive-wood">Keyword Alignment</span>
                <span className="font-bold text-olive-wood">
                  {breakdown?.keywordAlignment?.score || 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-khaki/20 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    (breakdown?.keywordAlignment?.score || 0) >= 80
                      ? 'bg-emerald-500'
                      : (breakdown?.keywordAlignment?.score || 0) >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${breakdown?.keywordAlignment?.score || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-olive-wood/60 mt-1.5">
                <span>{breakdown?.keywordAlignment?.label || 'Tech terms'}</span>
                <span>{breakdown?.keywordAlignment?.matched ?? 0} / {breakdown?.keywordAlignment?.total ?? 25} matched</span>
              </div>
            </div>

            {/* 4. Formatting Cleanliness */}
            <div className="p-3.5 rounded-2xl bg-khaki-light/30 border border-khaki/30">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-olive-wood">Formatting Cleanliness</span>
                <span className="font-bold text-olive-wood">
                  {breakdown?.formattingCleanliness?.score || 0}%
                </span>
              </div>
              <div className="w-full h-2 bg-khaki/20 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    (breakdown?.formattingCleanliness?.score || 0) >= 80
                      ? 'bg-emerald-500'
                      : (breakdown?.formattingCleanliness?.score || 0) >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${breakdown?.formattingCleanliness?.score || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-olive-wood/60 mt-1.5">
                <span>Single-column US Letter</span>
                <span>{breakdown?.formattingCleanliness?.status || 'Valid'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filter Controls */}
      <div className="px-5 sm:px-6 pt-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-khaki/20">
        {/* Category Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {['Overview', 'Keyword Match', 'Bullet Improvements'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-olive-wood text-white shadow-sm'
                  : 'bg-khaki-light/70 text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Sub-Filter (Pass / Warn / Fail) */}
        <div className="flex items-center gap-1.5 text-xs pb-3 sm:pb-0">
          <span className="text-olive-wood/60 font-medium text-[11px]">Filter:</span>
          {['all', 'pass', 'warn', 'fail'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium uppercase transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-khaki/30 text-olive-wood font-bold border border-khaki/60'
                  : 'text-olive-wood/60 hover:text-olive-wood'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Checklist Content Area */}
      <div className="p-5 sm:p-6 bg-white">
        <AtsFeedbackList items={displayedFeedback} />
      </div>
    </div>
  );
}
