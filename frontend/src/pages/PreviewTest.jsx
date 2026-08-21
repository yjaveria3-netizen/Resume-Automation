import React, { useState } from 'react';
import { ResumePreview, ResumeActionBar, defaultResumeData } from '../components/preview';
import { Link } from 'react-router-dom';

export default function PreviewTest() {
  const [viewState, setViewState] = useState('ready'); // 'ready' | 'loading' | 'empty'
  const [format, setFormat] = useState('docx'); // 'docx' | 'pdf'
  const [lastUpdated, setLastUpdated] = useState('Generated 2m ago');
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [deviceFrame, setDeviceFrame] = useState('responsive'); // 'responsive' | 'mobile' | 'tablet'
  const [scale, setScale] = useState(100);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = (selectedFormat) => {
    // Simulate realistic document download
    const fileName = `Alex_Morgan_Resume_v2.4.${selectedFormat}`;
    const element = document.createElement('a');
    const fileContent = `Alex Morgan - Resume Auto-Updater Build\nFormat: .${selectedFormat.toUpperCase()}\nGenerated at: ${new Date().toISOString()}`;
    const file = new Blob([fileContent], { type: selectedFormat === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf' });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast(`Downloaded ${fileName}`);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setViewState('loading');
    showToast('Syncing GitHub commits & re-analyzing keywords...');
    
    setTimeout(() => {
      setIsGenerating(false);
      setViewState('ready');
      setLastUpdated('Generated just now');
      showToast('Resume re-generated successfully!');
    }, 1800);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast('Shareable preview link copied to clipboard!');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-khaki-light/60 py-6 sm:py-8 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Test Suite Control Header */}
        <div className="bg-white rounded-2xl border border-khaki/40 p-4 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-sage/20 text-sage text-xs font-bold uppercase tracking-wider">
                Day 3 Test Suite
              </span>
              <span className="text-xs text-olive-wood/60">Person B — Frontend QA</span>
            </div>
            <h1 className="text-2xl font-bold text-olive-wood mt-1">
              Resume Preview & Action Toolbar Test Harness
            </h1>
            <p className="text-xs text-olive-wood/70 mt-0.5">
              Interactive test harness for verifying US Letter proportions, shimmer states, action bar triggers, and mobile scaling.
            </p>
          </div>

          {/* Quick links & ATS preview badge */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-khaki-light border border-khaki/40 flex items-center gap-2 text-xs font-medium text-olive-wood">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>ATS Score: <strong className="text-sage-hover">94/100</strong></span>
            </div>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-olive-wood hover:bg-khaki/20 border border-khaki/40 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold text-olive-wood hover:bg-khaki/20 border border-khaki/40 transition-colors"
            >
              Upload
            </Link>
          </div>
        </div>

        {/* State & Breakpoint Switcher Bar */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-khaki/40 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Preview State Toggle */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-olive-wood/70">Preview State:</span>
            <div className="inline-flex p-1 bg-khaki-light rounded-xl border border-khaki/40">
              <button
                type="button"
                onClick={() => setViewState('ready')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewState === 'ready'
                    ? 'bg-white text-olive-wood shadow-sm font-semibold'
                    : 'text-olive-wood/70 hover:text-olive-wood'
                }`}
              >
                1. Loaded Resume
              </button>
              <button
                type="button"
                onClick={() => setViewState('loading')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewState === 'loading'
                    ? 'bg-white text-olive-wood shadow-sm font-semibold'
                    : 'text-olive-wood/70 hover:text-olive-wood'
                }`}
              >
                2. Loading Shimmer
              </button>
              <button
                type="button"
                onClick={() => setViewState('empty')}
                className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  viewState === 'empty'
                    ? 'bg-white text-olive-wood shadow-sm font-semibold'
                    : 'text-olive-wood/70 hover:text-olive-wood'
                }`}
              >
                3. Empty State
              </button>
            </div>
          </div>

          {/* Viewport Frame Simulator */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-olive-wood/70">Test Viewport:</span>
            <div className="inline-flex p-1 bg-khaki-light rounded-xl border border-khaki/40">
              <button
                type="button"
                onClick={() => setDeviceFrame('responsive')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  deviceFrame === 'responsive'
                    ? 'bg-white text-olive-wood shadow-sm font-semibold'
                    : 'text-olive-wood/70 hover:text-olive-wood'
                }`}
                title="Full Responsive Width"
              >
                Full / Desktop
              </button>
              <button
                type="button"
                onClick={() => setDeviceFrame('tablet')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  deviceFrame === 'tablet'
                    ? 'bg-white text-olive-wood shadow-sm font-semibold'
                    : 'text-olive-wood/70 hover:text-olive-wood'
                }`}
                title="Simulate Tablet (768px)"
              >
                Tablet (768px)
              </button>
              <button
                type="button"
                onClick={() => setDeviceFrame('mobile')}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  deviceFrame === 'mobile'
                    ? 'bg-white text-olive-wood shadow-sm font-semibold'
                    : 'text-olive-wood/70 hover:text-olive-wood'
                }`}
                title="Simulate Mobile (375px)"
              >
                Mobile (375px)
              </button>
            </div>
          </div>
        </div>

        {/* Live Action Bar Component */}
        <ResumeActionBar
          format={format}
          onFormatChange={(fmt) => {
            setFormat(fmt);
            showToast(`Switched format to .${fmt.toUpperCase()}`);
          }}
          onDownload={handleDownload}
          onRegenerate={handleRegenerate}
          onCopyLink={handleCopyLink}
          isGenerating={isGenerating}
          lastUpdated={lastUpdated}
          scale={scale}
          onScaleChange={(newScale) => setScale(newScale)}
        />

        {/* Viewport Frame Container */}
        <div className="flex justify-center transition-all pb-12">
          <div
            className={`transition-all duration-300 ${
              deviceFrame === 'mobile'
                ? 'w-[375px] border-4 border-olive-wood/30 rounded-3xl p-3 bg-white shadow-2xl overflow-x-hidden'
                : deviceFrame === 'tablet'
                ? 'w-[768px] border-4 border-olive-wood/30 rounded-3xl p-4 bg-white shadow-2xl overflow-x-hidden'
                : 'w-full'
            }`}
            style={deviceFrame === 'responsive' ? { transform: `scale(${scale / 100})`, transformOrigin: 'top center' } : {}}
          >
            {deviceFrame !== 'responsive' && (
              <div className="text-[10px] uppercase font-bold text-center text-olive-wood/40 pb-2 mb-2 border-b border-khaki/30">
                Simulated {deviceFrame.toUpperCase()} Viewport ({deviceFrame === 'mobile' ? '375px' : '768px'})
              </div>
            )}

            {/* Live ResumePreview Component */}
            <ResumePreview
              data={defaultResumeData}
              isLoading={viewState === 'loading'}
              isEmpty={viewState === 'empty'}
              onUploadClick={() => {
                setViewState('loading');
                setTimeout(() => {
                  setViewState('ready');
                  showToast('Resume uploaded & parsed successfully!');
                }, 1000);
              }}
            />
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
