import React, { useState } from 'react';

/**
 * ResumeActionBar Component
 *
 * A sticky toolbar positioned above or alongside the resume preview containing:
 * - Primary 'Download .docx' / 'Download .pdf' button with format icon
 * - Format selector toggle (.docx / .pdf)
 * - 'Copy Link' button with copy feedback
 * - 'Re-generate' trigger button with loading spin feedback
 * - Last-updated timestamp status badge ('Generated 2m ago')
 * - Zoom & view scale toggles (75%, 100%, 125%, Fit)
 *
 * @param {Object} props
 * @param {string} [props.format="docx"] - Selected format ('docx' | 'pdf')
 * @param {Function} [props.onFormatChange] - Handler for format switch
 * @param {Function} [props.onDownload] - Handler for download action
 * @param {Function} [props.onRegenerate] - Handler for re-generation trigger
 * @param {Function} [props.onCopyLink] - Handler for copy link action
 * @param {boolean} [props.isGenerating=false] - Whether regeneration is in progress
 * @param {string} [props.lastUpdated="Generated 2m ago"] - Timestamp text
 * @param {number} [props.scale=100] - Document zoom percentage
 * @param {Function} [props.onScaleChange] - Handler for zoom scale change
 * @param {string} [props.className=""] - Extra Tailwind classes
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
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    if (onDownload) {
      onDownload(format);
    }
    setTimeout(() => setIsDownloading(false), 1200);
  };

  const isDocx = format === 'docx';

  return (
    <div
      className={`sticky top-16 z-40 bg-white/95 backdrop-blur-md border border-khaki/40 rounded-2xl p-3 sm:p-4 shadow-sm transition-all ${className}`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Status Badge & Document Meta */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Format Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-khaki-light text-olive-wood text-xs font-semibold border border-khaki/50">
            <span
              className={`w-2 h-2 rounded-full ${
                isDocx ? 'bg-blue-500' : 'bg-rose-500'
              }`}
            ></span>
            <span>{isDocx ? 'Microsoft Word (.docx)' : 'Adobe PDF (.pdf)'}</span>
          </div>

          {/* Last Updated Timestamp Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-sage/15 text-sage-hover text-xs font-medium border border-sage/30">
            <svg
              className="w-3.5 h-3.5 text-sage"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{lastUpdated}</span>
          </div>

          {/* US Letter Sheet Size Indicator */}
          <span className="hidden sm:inline-flex items-center text-[11px] text-olive-wood/60 px-2 py-1 bg-khaki-light/50 rounded-md">
            Letter 8.5" × 11"
          </span>
        </div>

        {/* Right Side: Action Controls (Format Toggle, Re-generate, Copy, Download) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Format Selector Toggle (.docx / .pdf) */}
          <div className="inline-flex items-center p-1 rounded-xl bg-khaki-light border border-khaki/50">
            <button
              type="button"
              onClick={() => onFormatChange && onFormatChange('docx')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                isDocx
                  ? 'bg-white text-olive-wood shadow-sm border border-khaki/40'
                  : 'text-olive-wood/70 hover:text-olive-wood'
              }`}
              title="Switch to .docx format"
            >
              <svg
                className="w-3.5 h-3.5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
              </svg>
              .docx
            </button>
            <button
              type="button"
              onClick={() => onFormatChange && onFormatChange('pdf')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                !isDocx
                  ? 'bg-white text-olive-wood shadow-sm border border-khaki/40'
                  : 'text-olive-wood/70 hover:text-olive-wood'
              }`}
              title="Switch to .pdf format"
            >
              <svg
                className="w-3.5 h-3.5 text-rose-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
              </svg>
              .pdf
            </button>
          </div>

          {/* Zoom / Scale Controls (Optional helpful utility) */}
          {onScaleChange && (
            <div className="hidden md:inline-flex items-center gap-1 p-1 rounded-xl bg-khaki-light/70 border border-khaki/40 text-xs text-olive-wood">
              <button
                type="button"
                onClick={() => onScaleChange(Math.max(50, scale - 15))}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-white transition-colors"
                title="Zoom Out"
              >
                -
              </button>
              <span className="px-1 text-[11px] font-medium min-w-[38px] text-center">
                {scale}%
              </span>
              <button
                type="button"
                onClick={() => onScaleChange(Math.min(150, scale + 15))}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-white transition-colors"
                title="Zoom In"
              >
                +
              </button>
            </div>
          )}

          {/* Re-generate Trigger Button */}
          <button
            type="button"
            onClick={onRegenerate}
            disabled={isGenerating}
            className="px-3 py-2 rounded-xl bg-khaki-light text-olive-wood hover:bg-khaki/30 text-xs font-semibold border border-khaki/50 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            title="Re-generate resume with fresh GitHub commits"
          >
            <svg
              className={`w-3.5 h-3.5 text-olive-wood ${
                isGenerating ? 'animate-spin text-sage' : ''
              }`}
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
              {isGenerating ? 'Regenerating...' : 'Re-generate'}
            </span>
          </button>

          {/* Copy Shareable Link Button */}
          <button
            type="button"
            onClick={handleCopy}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              copied
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-khaki-light text-olive-wood hover:bg-khaki/30 border-khaki/50'
            }`}
            title="Copy shareable resume link"
          >
            {copied ? (
              <>
                <svg
                  className="w-3.5 h-3.5 text-emerald-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5 text-olive-wood"
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
              </>
            )}
          </button>

          {/* Primary Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="px-4 py-2 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75 disabled:cursor-wait"
            title={`Download generated resume as ${isDocx ? '.docx' : '.pdf'}`}
          >
            {isDownloading ? (
              <svg
                className="w-4 h-4 animate-spin text-white"
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
                className="w-4 h-4 text-white"
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
                ? 'Preparing...'
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
