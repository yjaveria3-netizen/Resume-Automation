import React, { useState } from 'react';

/**
 * ResumeActionBar Component - Executive Obsidian Dark Theme
 *
 * Sticky dark toolbar positioned above the resume preview containing:
 * - Segmented format toggle (.docx / .pdf)
 * - Last-updated timestamp & format meta
 * - Zoom controls (- / +)
 * - Re-generate button
 * - Copy Link button
 * - Single primary Download button
 */
export default function ResumeActionBar({
  format = 'docx',
  onFormatChange,
  onDownload,
  onRegenerate,
  onCopyLink,
  isGenerating = false,
  lastUpdated = 'Generated 2m ago',
  scale = 100,
  onScaleChange,
  className = ''
}) {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = async () => {
    if (onCopyLink) {
      onCopyLink();
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
      } catch {
        // Fallback for clipboard
      }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    if (onDownload) {
      onDownload(format);
    } else {
      const content = `Resume Auto-Updater Document Export (${format.toUpperCase()})\nGenerated at: ${new Date().toLocaleString()}`;
      const mimeType =
        format === 'docx'
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'application/pdf';
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Resume.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    setTimeout(() => setIsDownloading(false), 1200);
  };

  const isDocx = format === 'docx';

  return (
    <div
      className={`sticky top-16 z-30 bg-[#12151C] border border-white/[0.06] rounded-xl p-2.5 sm:p-3 shadow-md transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        {/* Left Side: Segmented Format Selector & Document Meta */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Segmented Format Toggle (.docx / .pdf) */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-[#0B0D12] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => onFormatChange && onFormatChange('docx')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                isDocx
                  ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
              title="Switch to .docx format"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDocx ? 'bg-[#34D399]' : 'bg-[#6B7280]'}`} />
              <span>.docx</span>
            </button>
            <button
              type="button"
              onClick={() => onFormatChange && onFormatChange('pdf')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                !isDocx
                  ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
              title="Switch to .pdf format"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${!isDocx ? 'bg-[#F97316]' : 'bg-[#6B7280]'}`} />
              <span>.pdf</span>
            </button>
          </div>

          {/* Last Updated Timestamp Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#171B24] text-[#9AA1AE] text-xs font-medium border border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <span>{lastUpdated}</span>
          </div>

          <span className="hidden md:inline-flex items-center text-[11px] text-[#6B7280] px-2 py-1 bg-[#0B0D12] rounded-md border border-white/[0.06]">
            US Letter (8.5" × 11")
          </span>
        </div>

        {/* Right Side: Action Controls (Zoom, Re-generate, Copy Link, Download) */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Zoom / Scale Controls */}
          {onScaleChange && (
            <div className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#0B0D12] border border-white/[0.06] text-xs">
              <button
                type="button"
                onClick={() => onScaleChange(Math.max(50, scale - 15))}
                className="w-5 h-5 rounded flex items-center justify-center text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-[#171B24] transition-colors cursor-pointer"
                title="Zoom Out"
              >
                -
              </button>
              <span className="px-1 text-[11px] font-medium min-w-[32px] text-center text-[#9AA1AE]">
                {scale}%
              </span>
              <button
                type="button"
                onClick={() => onScaleChange(Math.min(150, scale + 15))}
                className="w-5 h-5 rounded flex items-center justify-center text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-[#171B24] transition-colors cursor-pointer"
                title="Zoom In"
              >
                +
              </button>
            </div>
          )}

          {/* Re-generate Button */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-[#171B24] hover:bg-[#202531] text-[#ECEEF2] text-xs font-medium border border-white/[0.06] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Re-generate resume with fresh GitHub commits"
          >
            <svg
              className={`w-3.5 h-3.5 text-[#9AA1AE] ${isGenerating ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="hidden sm:inline">
              {isGenerating ? 'Regenerating...' : 'Re-sync'}
            </span>
          </button>

          {/* Copy Shareable Link Button */}
          <div className="relative inline-block">
            {copied && (
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#34D399] text-[#0B0D12] text-[11px] font-semibold rounded shadow-sm z-50 whitespace-nowrap">
                Copied!
              </div>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                copied
                  ? 'bg-[#34D399]/10 text-[#34D399] border-[#34D399]/30'
                  : 'bg-[#171B24] text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-[#202531] border-white/[0.06]'
              }`}
              title="Copy shareable resume link"
            >
              <svg
                className="w-3.5 h-3.5 text-[#9AA1AE]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="hidden sm:inline">Copy Link</span>
            </button>
          </div>

          {/* Primary Download Button (Clean solid orange CTA) */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-3.5 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95 disabled:opacity-75"
            title={`Download generated resume as ${isDocx ? '.docx' : '.pdf'}`}
          >
            {isDownloading ? (
              <svg
                className="w-3.5 h-3.5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            )}
            <span>
              {isDownloading
                ? 'Exporting...'
                : isDocx
                ? 'Download .docx'
                : 'Download .pdf'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
