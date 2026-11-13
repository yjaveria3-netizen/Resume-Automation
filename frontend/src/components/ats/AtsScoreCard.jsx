import React, { useState } from 'react';
import AtsScoreBadge from './AtsScoreBadge';
import AtsFeedbackList from './AtsFeedbackList';
import { mockAtsData94 } from './mockAtsData';

/**
 * AtsScoreCard - Master ATS Feedback Container Component
 * Calm Executive Dark Theme
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
  const [activeTab, setActiveTab] = useState('Overview');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleExport = () => {
    if (onExport) {
      onExport({ score, tier, breakdown, feedback });
    } else {
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

    if (statusFilter !== 'all') {
      items = items.filter((i) => i.status === statusFilter);
    }

    return items;
  };

  const displayedFeedback = getTabFilteredFeedback();
  const passCount = feedback.filter((f) => f.status === 'pass').length;
  const warnCount = feedback.filter((f) => f.status === 'warn').length;
  const failCount = feedback.filter((f) => f.status === 'fail').length;

  return (
    <div
      className={`bg-[#12151C] rounded-xl border border-white/[0.06] shadow-sm overflow-hidden transition-all text-[#ECEEF2] ${className}`}
    >
      {/* Top Header Bar */}
      <div className="p-5 sm:p-6 bg-[#171B24] border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-[#0B0D12] text-[#9AA1AE] border border-white/[0.06] text-[11px] font-medium uppercase tracking-wider">
              ATS Screening Engine
            </span>
            <span className="text-xs text-[#6B7280]">
              Analyzed {lastAnalyzed || 'recently'}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-[#ECEEF2] mt-1 tracking-tight">
            ATS Compatibility & Keyword Alignment
          </h2>
          <p className="text-xs text-[#9AA1AE] mt-0.5">
            Automated screening metrics modeled on enterprise recruitment screeners (Greenhouse / Lever / Workday).
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onRecalculate && (
            <button
              type="button"
              onClick={onRecalculate}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#ECEEF2] bg-[#12151C] border border-white/[0.06] hover:bg-[#202531] active:scale-95 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 text-[#9AA1AE] ${isAnalyzing ? 'animate-spin' : ''}`}
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
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white bg-[#F97316] hover:bg-[#EA580C] active:scale-95 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Main Score Hero & Metric Breakdown */}
      <div className="p-5 sm:p-6 bg-[#12151C] border-b border-white/[0.06] grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radial Badge Gauge Column */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-4 bg-[#0B0D12] rounded-xl border border-white/[0.06]">
          <AtsScoreBadge score={score} size={150} strokeWidth={10} showTier={true} />
          
          <p className="text-xs text-center text-[#9AA1AE] mt-3 font-normal px-2">
            {score >= 80
              ? 'Excellent ATS strength. High keyword match and quantified impact metrics.'
              : score >= 60
              ? 'Good baseline. Address missing keywords to reach the 80+ tier.'
              : 'Action needed: Incorporate target keywords and quantifiable metrics.'}
          </p>

          {/* Mini Status Pill Counters */}
          <div className="mt-3 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 text-[11px] font-medium">
              ✓ {passCount} passed
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20 text-[11px] font-medium">
              ▲ {warnCount} warnings
            </span>
            {failCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20 text-[11px] font-medium">
                ✕ {failCount} critical
              </span>
            )}
          </div>
        </div>

        {/* 4-Pillar Score Breakdown Bars Column */}
        <div className="lg:col-span-8 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9AA1AE] flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            ATS Evaluation Pillars
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Action Verbs */}
            <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/[0.06]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#ECEEF2]">Action Verbs Used</span>
                <span className="font-semibold text-[#34D399]">
                  {breakdown?.actionVerbs?.score || 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#171B24] rounded-full mt-2 overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-[#34D399] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${breakdown?.actionVerbs?.score || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] mt-1.5 font-normal">
                <span>{breakdown?.actionVerbs?.label || 'Analyzed'}</span>
                <span>{breakdown?.actionVerbs?.count ?? 0} found / {breakdown?.actionVerbs?.target ?? 15} target</span>
              </div>
            </div>

            {/* 2. Quantifiable Metrics */}
            <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/[0.06]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#ECEEF2]">Quantifiable Metrics</span>
                <span className="font-semibold text-[#ECEEF2]">
                  {breakdown?.quantifiableMetrics?.score || 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#171B24] rounded-full mt-2 overflow-hidden border border-white/[0.04]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    (breakdown?.quantifiableMetrics?.score || 0) >= 80
                      ? 'bg-[#34D399]'
                      : (breakdown?.quantifiableMetrics?.score || 0) >= 60
                      ? 'bg-[#F97316]'
                      : 'bg-[#F87171]'
                  }`}
                  style={{ width: `${breakdown?.quantifiableMetrics?.score || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] mt-1.5 font-normal">
                <span>{breakdown?.quantifiableMetrics?.label || 'Data points'}</span>
                <span>{breakdown?.quantifiableMetrics?.count ?? 0} bullets with metrics</span>
              </div>
            </div>

            {/* 3. Keyword Alignment */}
            <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/[0.06]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#ECEEF2]">Keyword Alignment</span>
                <span className="font-semibold text-[#ECEEF2]">
                  {breakdown?.keywordAlignment?.score || 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#171B24] rounded-full mt-2 overflow-hidden border border-white/[0.04]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${
                    (breakdown?.keywordAlignment?.score || 0) >= 80
                      ? 'bg-[#34D399]'
                      : (breakdown?.keywordAlignment?.score || 0) >= 60
                      ? 'bg-[#F97316]'
                      : 'bg-[#F87171]'
                  }`}
                  style={{ width: `${breakdown?.keywordAlignment?.score || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] mt-1.5 font-normal">
                <span>{breakdown?.keywordAlignment?.label || 'Tech terms'}</span>
                <span>{breakdown?.keywordAlignment?.matched ?? 0} / {breakdown?.keywordAlignment?.total ?? 25} matched</span>
              </div>
            </div>

            {/* 4. Formatting Cleanliness */}
            <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/[0.06]">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-[#ECEEF2]">Formatting Cleanliness</span>
                <span className="font-semibold text-[#34D399]">
                  {breakdown?.formattingCleanliness?.score || 0}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#171B24] rounded-full mt-2 overflow-hidden border border-white/[0.04]">
                <div
                  className="h-full bg-[#34D399] rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${breakdown?.formattingCleanliness?.score || 0}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#6B7280] mt-1.5 font-normal">
                <span>Single-column Standard</span>
                <span>{breakdown?.formattingCleanliness?.status || 'Valid'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filter Controls */}
      <div className="px-5 sm:px-6 pt-3 bg-[#171B24] flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {['Overview', 'Keyword Match', 'Bullet Improvements'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#12151C] text-[#ECEEF2] border border-white/[0.06] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-xs pb-2 sm:pb-0">
          <span className="text-[#6B7280] font-normal text-[11px]">Filter:</span>
          {['all', 'pass', 'warn', 'fail'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium uppercase transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#12151C] text-[#ECEEF2] border border-white/[0.06]'
                  : 'text-[#6B7280] hover:text-[#ECEEF2]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Checklist Content Area */}
      <div className="p-5 sm:p-6 bg-[#12151C]">
        <AtsFeedbackList items={displayedFeedback} />
      </div>
    </div>
  );
}
