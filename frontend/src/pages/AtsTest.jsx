import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ExecutiveLayout from '../components/layout/ExecutiveLayout';
import {
  AtsScoreBadge,
  AtsScoreCard,
  mockAtsData94,
  mockScenarios,
} from '../components/ats';

export default function AtsTest() {
  const [selectedPreset, setSelectedPreset] = useState(94);
  const [customScore, setCustomScore] = useState(94);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [deviceFrame, setDeviceFrame] = useState('responsive'); // 'responsive' | 'tablet' | 'mobile'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const currentScenario = isCustomMode
    ? {
        ...mockAtsData94,
        score: customScore,
        tier: customScore >= 80 ? 'Strong Match' : customScore >= 60 ? 'Moderate' : 'Needs Revision',
        breakdown: {
          actionVerbs: { score: customScore, label: customScore >= 80 ? 'Excellent' : 'Needs Work', count: Math.round(customScore * 0.18), target: 15 },
          quantifiableMetrics: { score: Math.max(20, customScore - 5), label: 'Impact Data', count: Math.round(customScore * 0.12), target: 10 },
          keywordAlignment: { score: customScore, label: `${customScore}% Match`, matched: Math.round(customScore * 0.25), total: 25 },
          formattingCleanliness: { score: Math.min(100, customScore + 10), label: 'Structure', status: 'Verified' },
        },
      }
    : mockScenarios[selectedPreset] || mockAtsData94;

  const handleSelectPreset = (scoreVal) => {
    setIsCustomMode(false);
    setSelectedPreset(scoreVal);
    setCustomScore(scoreVal);
    showToast(`Loaded Scenario: Score ${scoreVal} (${mockScenarios[scoreVal].tier})`);
  };

  const handleSliderChange = (e) => {
    const val = Number(e.target.value);
    setIsCustomMode(true);
    setCustomScore(val);
  };

  const handleRecalculate = () => {
    setIsAnalyzing(true);
    showToast('Re-scanning keywords and action verb density...');
    setTimeout(() => {
      setIsAnalyzing(false);
      showToast('ATS Score recalculation complete!');
    }, 1200);
  };

  const handleExport = (reportData) => {
    showToast(`Exported ATS screening report for score ${reportData.score}/100!`);
  };

  return (
    <ExecutiveLayout
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'ATS QA Test Harness' }]}
    >
      <div className="space-y-5">
        {/* Test Control Header */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 text-[11px] font-medium uppercase tracking-wider">
                ATS QA Suite
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#ECEEF2] mt-1 tracking-tight">
              ATS Score & Feedback System
            </h1>
            <p className="text-xs text-[#9AA1AE] mt-0.5">
              Radial circular progress meters, dynamic color thresholds (Green 80+, Amber 60-79, Rose &lt;60), categorized feedback, and responsive layout.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9AA1AE] bg-[#0B0D12] hover:text-[#ECEEF2] hover:bg-[#171B24] border border-white/[0.06] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Interactive Scenario & Viewport Controls Bar */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-3.5 shadow-xs space-y-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Score Preset Scenarios */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[#9AA1AE]">Score Scenarios:</span>
              <div className="inline-flex p-0.5 bg-[#0B0D12] rounded-lg border border-white/[0.06] gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(94)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    !isCustomMode && selectedPreset === 94
                      ? 'bg-[#34D399]/15 text-[#34D399] border border-[#34D399]/30'
                      : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
                  <span>1. Score 94 (Strong)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset(72)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    !isCustomMode && selectedPreset === 72
                      ? 'bg-[#F97316]/15 text-[#F97316] border border-[#F97316]/30'
                      : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316]"></span>
                  <span>2. Score 72 (Moderate)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset(45)}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    !isCustomMode && selectedPreset === 45
                      ? 'bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/30'
                      : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]"></span>
                  <span>3. Score 45 (Revision)</span>
                </button>
              </div>
            </div>

            {/* Viewport Frame Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-[#9AA1AE]">Viewport:</span>
              <div className="inline-flex p-0.5 bg-[#0B0D12] rounded-lg border border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setDeviceFrame('responsive')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    deviceFrame === 'responsive'
                      ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                      : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  Desktop
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceFrame('tablet')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    deviceFrame === 'tablet'
                      ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                      : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  Tablet (768px)
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceFrame('mobile')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    deviceFrame === 'mobile'
                      ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                      : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  Mobile (375px)
                </button>
              </div>
            </div>
          </div>

          {/* Live Dynamic Score Slider */}
          <div className="pt-2 border-t border-white/[0.06] flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <label htmlFor="score-slider" className="text-xs text-[#9AA1AE] whitespace-nowrap">
                Live Interactive Score Slider:
              </label>
              <input
                id="score-slider"
                type="range"
                min="0"
                max="100"
                value={customScore}
                onChange={handleSliderChange}
                className="w-full accent-[#F97316] h-1.5 bg-[#0B0D12] rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] min-w-[3rem] text-center shadow-xs">
                {customScore}
              </span>
            </div>

            <div className="text-[11px] text-[#6B7280] flex items-center gap-2">
              <span>Thresholds:</span>
              <span className="text-[#F87171]">&lt;60 Rose</span>
              <span>•</span>
              <span className="text-[#F97316]">60-79 Amber</span>
              <span>•</span>
              <span className="text-[#34D399]">80+ Green</span>
            </div>
          </div>
        </div>

        {/* Viewport Display Container */}
        <div className="flex justify-center transition-all">
          <div
            className={`transition-all duration-300 ${
              deviceFrame === 'mobile'
                ? 'w-[375px] border border-white/[0.12] rounded-2xl p-3 bg-[#0B0D12] shadow-xl overflow-x-hidden'
                : deviceFrame === 'tablet'
                ? 'w-[768px] border border-white/[0.12] rounded-2xl p-4 bg-[#0B0D12] shadow-xl overflow-x-hidden'
                : 'w-full'
            }`}
          >
            {deviceFrame !== 'responsive' && (
              <div className="text-[10px] uppercase font-medium text-center text-[#6B7280] pb-2 mb-3 border-b border-white/[0.06]">
                Simulated {deviceFrame.toUpperCase()} Viewport ({deviceFrame === 'mobile' ? '375px' : '768px'})
              </div>
            )}

            {/* Master AtsScoreCard Component */}
            <AtsScoreCard
              score={currentScenario.score}
              tier={currentScenario.tier}
              breakdown={currentScenario.breakdown}
              feedback={currentScenario.feedback}
              lastAnalyzed={currentScenario.lastAnalyzed}
              onRecalculate={handleRecalculate}
              onExport={handleExport}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>

        {/* Radial Badge Multi-Size Gallery */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] mb-5">
            <div>
              <h3 className="text-base font-semibold text-[#ECEEF2]">
                Radial Progress Meter Component Sizes & Tiers
              </h3>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Demonstrating SVG stroke-dashoffset scaling across sm, md, lg presets and calm design tokens.
              </p>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-[#0B0D12] text-[#9AA1AE] border border-white/[0.06]">
              AtsScoreBadge.jsx
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center justify-items-center">
            {/* 1. Small Gauge (Needs Revision) */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-[#0B0D12] border border-white/[0.06] w-full">
              <span className="text-xs text-[#6B7280] mb-3">Small (size="sm" / 120px)</span>
              <AtsScoreBadge score={45} size="sm" />
              <span className="text-[11px] font-medium text-[#F87171] mt-3">Score &lt; 60 (Rose)</span>
            </div>

            {/* 2. Medium Gauge (Moderate) */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-[#0B0D12] border border-white/[0.06] w-full">
              <span className="text-xs text-[#6B7280] mb-3">Medium (size="md" / 160px)</span>
              <AtsScoreBadge score={72} size="md" />
              <span className="text-[11px] font-medium text-[#F97316] mt-3">Score 60-79 (Amber)</span>
            </div>

            {/* 3. Large Gauge (Strong Match) */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-[#0B0D12] border border-white/[0.06] w-full">
              <span className="text-xs text-[#6B7280] mb-3">Large (size="lg" / 200px)</span>
              <AtsScoreBadge score={94} size="lg" />
              <span className="text-[11px] font-medium text-[#34D399] mt-3">Score 80+ (Green)</span>
            </div>

            {/* 4. Dynamic Live Gauge */}
            <div className="flex flex-col items-center p-4 rounded-xl bg-[#0B0D12] border border-white/[0.06] w-full">
              <span className="text-xs text-[#6B7280] mb-3">Live Slider Match ({customScore})</span>
              <AtsScoreBadge score={customScore} size="lg" />
              <span className="text-[11px] font-medium text-[#ECEEF2] mt-3">Dynamic Live Gauge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12151C] text-[#ECEEF2] px-4 py-2.5 rounded-xl shadow-lg border border-white/[0.06] flex items-center gap-2 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </ExecutiveLayout>
  );
}
