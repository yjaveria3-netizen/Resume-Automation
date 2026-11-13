import React, { useState } from 'react';
import ExecutiveLayout from '../components/layout/ExecutiveLayout';
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
    <ExecutiveLayout
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Preview QA Harness' }]}
    >
      <div className="space-y-5">
        {/* Test Suite Control Header */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 text-[11px] font-medium uppercase tracking-wider">
                Preview QA Suite
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#ECEEF2] mt-1 tracking-tight">
              Resume Preview & Action Toolbar
            </h1>
            <p className="text-xs text-[#9AA1AE] mt-0.5">
              Interactive test harness for verifying US Letter proportions, shimmer states, action bar triggers, and responsive scaling.
            </p>
          </div>

          {/* Quick links & ATS preview badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="px-3 py-1.5 rounded-lg bg-[#0B0D12] border border-white/[0.06] flex items-center gap-2 text-xs font-medium text-[#ECEEF2]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
              <span>ATS Score: <strong className="text-[#34D399] font-semibold">94/100</strong></span>
            </div>
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-[#171B24] border border-white/[0.06] transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* State & Breakpoint Switcher Bar */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Preview State Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[#9AA1AE]">Preview State:</span>
            <div className="inline-flex p-0.5 bg-[#0B0D12] rounded-lg border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setViewState('ready')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewState === 'ready'
                    ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                    : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                }`}
              >
                1. Loaded
              </button>
              <button
                type="button"
                onClick={() => setViewState('loading')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewState === 'loading'
                    ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                    : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                }`}
              >
                2. Loading
              </button>
              <button
                type="button"
                onClick={() => setViewState('empty')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  viewState === 'empty'
                    ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                    : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                }`}
              >
                3. Empty
              </button>
            </div>
          </div>

          {/* Viewport Frame Simulator */}
          <div className="flex items-center gap-2">
            <span className="text-[#9AA1AE]">Test Viewport:</span>
            <div className="inline-flex p-0.5 bg-[#0B0D12] rounded-lg border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setDeviceFrame('responsive')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  deviceFrame === 'responsive'
                    ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                    : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                }`}
                title="Full Responsive Width"
              >
                Full / Desktop
              </button>
              <button
                type="button"
                onClick={() => setDeviceFrame('tablet')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  deviceFrame === 'tablet'
                    ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                    : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                }`}
                title="Simulate Tablet (768px)"
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
                ? 'w-[375px] border border-white/[0.12] rounded-2xl p-3 bg-[#0B0D12] shadow-xl overflow-x-hidden'
                : deviceFrame === 'tablet'
                ? 'w-[768px] border border-white/[0.12] rounded-2xl p-4 bg-[#0B0D12] shadow-xl overflow-x-hidden'
                : 'w-full'
            }`}
            style={deviceFrame === 'responsive' ? { transform: `scale(${scale / 100})`, transformOrigin: 'top center' } : {}}
          >
            {deviceFrame !== 'responsive' && (
              <div className="text-[10px] uppercase font-medium text-center text-[#6B7280] pb-2 mb-2 border-b border-white/[0.06]">
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
        <div className="fixed bottom-6 right-6 z-50 bg-[#12151C] text-[#ECEEF2] px-4 py-2.5 rounded-xl shadow-lg border border-white/[0.06] flex items-center gap-2 text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </ExecutiveLayout>
  );
}
