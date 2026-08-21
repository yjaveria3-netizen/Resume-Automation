import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AtsScoreBadge,
  AtsFeedbackList,
  AtsScoreCard,
  mockAtsData94,
  mockAtsData72,
  mockAtsData45,
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
    <div className="min-h-[calc(100vh-4rem)] bg-khaki-light/60 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Test Control Header */}
        <div className="bg-white rounded-3xl border border-khaki/40 p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sage/20 text-sage text-xs font-bold uppercase tracking-wider">
                Day 4 QA Test Suite
              </span>
              <span className="text-xs text-olive-wood/60">Person B — Frontend Support & QA</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-olive-wood mt-1">
              ATS Score & Feedback System Test Harness
            </h1>
            <p className="text-xs sm:text-sm text-olive-wood/70 mt-0.5">
              Radial circular progress meters, dynamic color thresholds (Emerald 80+, Amber 60-79, Rose &lt;60), categorized feedback, and mobile scaling.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/dashboard"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-olive-wood bg-khaki-light hover:bg-khaki/20 border border-khaki/40 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/preview-test"
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-olive-wood bg-khaki-light hover:bg-khaki/20 border border-khaki/40 transition-colors"
            >
              Preview Test
            </Link>
          </div>
        </div>

        {/* Interactive Scenario & Viewport Controls Bar */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-khaki/40 p-4 shadow-sm space-y-4 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Score Preset Scenarios */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-olive-wood/80">Score Scenarios:</span>
              <div className="inline-flex p-1 bg-khaki-light rounded-xl border border-khaki/40 gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleSelectPreset(94)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    !isCustomMode && selectedPreset === 94
                      ? 'bg-emerald-500 text-white shadow-sm font-semibold'
                      : 'text-olive-wood/70 hover:text-olive-wood'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                  <span>1. Score 94 (Strong Match)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset(72)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    !isCustomMode && selectedPreset === 72
                      ? 'bg-amber-500 text-white shadow-sm font-semibold'
                      : 'text-olive-wood/70 hover:text-olive-wood'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-300"></span>
                  <span>2. Score 72 (Moderate)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectPreset(45)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    !isCustomMode && selectedPreset === 45
                      ? 'bg-rose-500 text-white shadow-sm font-semibold'
                      : 'text-olive-wood/70 hover:text-olive-wood'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-rose-300"></span>
                  <span>3. Score 45 (Needs Revision)</span>
                </button>
              </div>
            </div>

            {/* Viewport Frame Switcher */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-olive-wood/80">Viewport:</span>
              <div className="inline-flex p-1 bg-khaki-light rounded-xl border border-khaki/40">
                <button
                  type="button"
                  onClick={() => setDeviceFrame('responsive')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    deviceFrame === 'responsive'
                      ? 'bg-white text-olive-wood shadow-sm font-bold'
                      : 'text-olive-wood/70 hover:text-olive-wood'
                  }`}
                >
                  Desktop Full
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceFrame('tablet')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    deviceFrame === 'tablet'
                      ? 'bg-white text-olive-wood shadow-sm font-bold'
                      : 'text-olive-wood/70 hover:text-olive-wood'
                  }`}
                >
                  Tablet (768px)
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceFrame('mobile')}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    deviceFrame === 'mobile'
                      ? 'bg-white text-olive-wood shadow-sm font-bold'
                      : 'text-olive-wood/70 hover:text-olive-wood'
                  }`}
                >
                  Mobile (375px)
                </button>
              </div>
            </div>
          </div>

          {/* Live Dynamic Score Slider */}
          <div className="pt-2 border-t border-khaki/30 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <label htmlFor="score-slider" className="font-bold text-olive-wood/80 whitespace-nowrap">
                Live Interactive Score Slider:
              </label>
              <input
                id="score-slider"
                type="range"
                min="0"
                max="100"
                value={customScore}
                onChange={handleSliderChange}
                className="w-full accent-sage h-2 bg-khaki/20 rounded-lg cursor-pointer"
              />
              <span className="font-mono font-extrabold text-sm px-2.5 py-0.5 rounded-lg bg-olive-wood text-white min-w-[3rem] text-center">
                {customScore}
              </span>
            </div>

            <div className="text-[11px] text-olive-wood/60 flex items-center gap-2">
              <span>Thresholds:</span>
              <span className="text-rose-600 font-semibold">&lt;60 Rose</span>
              <span>•</span>
              <span className="text-amber-600 font-semibold">60-79 Amber</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">80+ Emerald</span>
            </div>
          </div>
        </div>

        {/* Viewport Display Container */}
        <div className="flex justify-center transition-all">
          <div
            className={`transition-all duration-300 ${
              deviceFrame === 'mobile'
                ? 'w-[375px] border-4 border-olive-wood/30 rounded-3xl p-3 bg-white shadow-2xl overflow-x-hidden'
                : deviceFrame === 'tablet'
                ? 'w-[768px] border-4 border-olive-wood/30 rounded-3xl p-4 bg-white shadow-2xl overflow-x-hidden'
                : 'w-full'
            }`}
          >
            {deviceFrame !== 'responsive' && (
              <div className="text-[10px] uppercase font-bold text-center text-olive-wood/40 pb-2 mb-3 border-b border-khaki/30">
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
        <div className="bg-white rounded-3xl border border-khaki/40 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-khaki/30 mb-6">
            <div>
              <h3 className="text-lg font-bold text-olive-wood">
                Radial Progress Meter Component Sizes & Tiers
              </h3>
              <p className="text-xs text-olive-wood/60 mt-0.5">
                Demonstrating SVG stroke-dashoffset scaling across sm, md, lg presets and score tiers.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-khaki-light text-olive-wood border border-khaki/40">
              `AtsScoreBadge.jsx`
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center justify-items-center">
            {/* 1. Small Gauge (Needs Revision) */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-khaki-light/30 border border-khaki/30 w-full">
              <span className="text-xs font-bold text-olive-wood/70 mb-3">Small (size="sm" / 120px)</span>
              <AtsScoreBadge score={45} size="sm" />
              <span className="text-[11px] font-semibold text-rose-600 mt-3">Score &lt; 60 (Rose)</span>
            </div>

            {/* 2. Medium Gauge (Moderate) */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-khaki-light/30 border border-khaki/30 w-full">
              <span className="text-xs font-bold text-olive-wood/70 mb-3">Medium (size="md" / 160px)</span>
              <AtsScoreBadge score={72} size="md" />
              <span className="text-[11px] font-semibold text-amber-600 mt-3">Score 60-79 (Amber)</span>
            </div>

            {/* 3. Large Gauge (Strong Match) */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-khaki-light/30 border border-khaki/30 w-full">
              <span className="text-xs font-bold text-olive-wood/70 mb-3">Large (size="lg" / 200px)</span>
              <AtsScoreBadge score={94} size="lg" />
              <span className="text-[11px] font-semibold text-emerald-600 mt-3">Score 80+ (Emerald)</span>
            </div>

            {/* 4. Extra Large Gauge (Perfect 100) */}
            <div className="flex flex-col items-center p-4 rounded-2xl bg-khaki-light/30 border border-khaki/30 w-full">
              <span className="text-xs font-bold text-olive-wood/70 mb-3">Live Slider Match ({customScore})</span>
              <AtsScoreBadge score={customScore} size="lg" />
              <span className="text-[11px] font-semibold text-sage-hover mt-3">Dynamic Live Gauge</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-olive-wood text-white px-4 py-3 rounded-2xl shadow-xl border border-khaki/30 flex items-center gap-2.5 text-xs animate-bounce">
          <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
