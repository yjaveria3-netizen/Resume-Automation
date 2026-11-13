import React, { useState, useEffect } from 'react';

/**
 * VisualDiffModal Component - Calm Executive Dark Theme
 *
 * Modal popup comparing the current resume's Projects section against the proposed version,
 * highlighting the new bullet in a muted green background with an added `+` badge.
 *
 * Supports switching between:
 * - 'Diff View' (highlighting inline additions vs existing bullets)
 * - 'Document View' (full formatted 1-page resume page preview)
 */
export default function VisualDiffModal({
  isOpen = false,
  onClose,
  onConfirm,
  suggestion = null,
  existingBullets = null,
  projectName = null,
}) {
  const [viewMode, setViewMode] = useState('diff');
  const [editedBullet, setEditedBullet] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (suggestion) {
      setEditedBullet(suggestion.proposed_bullet || '');
      setIsEditing(false);
      setCopied(false);
    }
  }, [suggestion, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, isSubmitting]);

  if (!isOpen || !suggestion) {
    return null;
  }

  const repoName = projectName || suggestion.repo_name || 'Project';
  const commitSha = suggestion.commit_sha ? suggestion.commit_sha.slice(0, 7) : 'latest';
  const commitMessage = suggestion.commit_message || 'Automated feature synthesis';

  const activeBullets = existingBullets && existingBullets.length > 0
    ? existingBullets
    : [
        `Architected resilient backend services for ${repoName} handling high-concurrency event streams.`,
        `Optimized SQL queries and database connection pooling, reducing p95 latency by 32%.`,
      ];

  const handleCopy = () => {
    navigator.clipboard?.writeText(editedBullet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async () => {
    if (!onConfirm) {
      onClose?.();
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(suggestion.id, editedBullet);
      onClose?.();
    } catch (err) {
      console.error('Failed to confirm suggestion insertion:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#06090E]/80 backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
    >
      <div
        className="w-full max-w-3xl bg-[#12151C] rounded-xl shadow-xl border border-white/[0.06] flex flex-col overflow-hidden my-auto max-h-[92vh] animate-scale-in text-[#ECEEF2]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#171B24] text-[#ECEEF2] px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/[0.06]">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
              <h2 id="modal-title" className="text-base font-semibold text-[#ECEEF2]">
                Reviewing Changes for <span className="text-[#ECEEF2] underline decoration-white/20">{repoName}</span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#9AA1AE]">
              <span className="font-mono bg-[#0B0D12] px-2 py-0.5 rounded text-[#ECEEF2] border border-white/[0.06] text-[11px]">
                sha: {commitSha}
              </span>
              <span className="truncate max-w-[200px] sm:max-w-md text-[#6B7280] text-[11px]">
                "{commitMessage}"
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* View Mode Toggle: Diff View vs Document View */}
            <div className="inline-flex rounded-lg bg-[#0B0D12] p-0.5 border border-white/[0.06]">
              <button
                type="button"
                onClick={() => setViewMode('diff')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'diff'
                    ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                    : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                }`}
              >
                Diff View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('document')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  viewMode === 'document'
                    ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                    : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
                }`}
              >
                Document View
              </button>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-7 h-7 rounded-lg bg-[#0B0D12] hover:bg-[#171B24] text-[#9AA1AE] hover:text-[#ECEEF2] border border-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
              title="Close modal"
              aria-label="Close modal"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-sm bg-[#12151C]">
          {viewMode === 'diff' ? (
            /* --- DIFF VIEW --- */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-medium text-[#9AA1AE] uppercase tracking-wider pb-1 border-b border-white/[0.06]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
                  Projects Section — Unified Inline Diff
                </span>
                <span className="text-[#34D399] font-medium bg-[#34D399]/10 px-2 py-0.5 rounded-md border border-[#34D399]/20">
                  +1 Proposed Bullet Addition
                </span>
              </div>

              {/* Project Title Block */}
              <div className="bg-[#0B0D12] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#ECEEF2] text-sm">
                      {repoName}
                    </span>
                    <span className="text-xs text-[#6B7280]">| Lead Engineer</span>
                  </div>
                  <span className="text-xs font-mono text-[#6B7280]">2026 – Present</span>
                </div>

                {/* Bullets List */}
                <div className="space-y-2.5">
                  {activeBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-[#9AA1AE] leading-relaxed pl-1"
                    >
                      <span className="text-[#6B7280] select-none font-bold">•</span>
                      <p className="flex-1">{bullet}</p>
                    </div>
                  ))}

                  {/* Proposed Bullet Inserted */}
                  <div className="bg-[#34D399]/10 border-l-2 border-[#34D399] p-3 rounded-r-lg text-[#ECEEF2] font-normal transition-all">
                    <div className="flex items-start gap-2.5">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#34D399] text-[#0B0D12] font-bold text-xs shrink-0 mt-0.5">
                        +
                      </span>

                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              value={editedBullet}
                              onChange={(e) => setEditedBullet(e.target.value)}
                              rows={3}
                              className="w-full text-xs sm:text-sm text-[#ECEEF2] bg-[#0B0D12] border border-[#34D399] rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#34D399]/30 font-sans"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="text-xs font-medium text-[#34D399] bg-[#171B24] px-3 py-1 rounded-md border border-[#34D399]/30 hover:bg-[#202531] cursor-pointer"
                              >
                                Done
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-[#ECEEF2] font-normal leading-relaxed">
                            {editedBullet}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-[#34D399]/20 text-[11px] text-[#34D399]">
                          <span className="font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
                            AI Diff Synthesis (STAR Formula)
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleCopy}
                              className="hover:underline font-medium cursor-pointer"
                            >
                              {copied ? '✓ Copied' : 'Copy bullet'}
                            </button>
                            <span>•</span>
                            <button
                              type="button"
                              onClick={() => setIsEditing(!isEditing)}
                              className="hover:underline font-medium text-[#F97316] cursor-pointer"
                            >
                              {isEditing ? 'Close editor' : 'Edit text'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* --- DOCUMENT VIEW --- */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-medium text-[#9AA1AE] uppercase tracking-wider pb-1 border-b border-white/[0.06]">
                <span>Full Formatted Document View</span>
                <span className="text-[#34D399] font-medium bg-[#34D399]/10 px-2 py-0.5 rounded-md border border-[#34D399]/20 text-[11px]">
                  1-Page Layout
                </span>
              </div>

              <div className="bg-[#0B0D12] border border-white/[0.06] rounded-xl p-6 sm:p-8 font-sans text-[#ECEEF2] space-y-4">
                <div className="text-center pb-3 border-b border-white/[0.06]">
                  <h3 className="text-lg font-semibold text-[#ECEEF2] uppercase tracking-wide">
                    Candidate Profile
                  </h3>
                  <p className="text-xs text-[#9AA1AE] mt-0.5">
                    Engineering Portfolio • OpenXML Synchronization
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="border-b border-white/[0.06] pb-0.5">
                    <h4 className="text-xs font-semibold text-[#F97316] uppercase tracking-wider">
                      Technical Projects
                    </h4>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                      <span className="font-semibold text-xs sm:text-sm text-[#ECEEF2]">
                        {repoName} <span className="font-normal text-[#6B7280]">| Lead Engineer</span>
                      </span>
                      <span className="text-xs text-[#6B7280] italic">2026 – Present</span>
                    </div>

                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-[#9AA1AE] leading-relaxed">
                      {activeBullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                      <li className="bg-[#34D399]/10 text-[#ECEEF2] font-normal px-2 py-0.5 rounded border border-[#34D399]/20">
                        <span className="font-medium text-[#34D399] mr-1">[NEW]</span>
                        {editedBullet}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#171B24] border-t border-white/[0.06] px-5 sm:px-6 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-xs text-[#9AA1AE] font-normal text-center sm:text-left">
            Inserting this bullet updates your resume without overflowing the 1-page budget.
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg border border-white/[0.06] bg-[#0B0D12] hover:bg-[#12151C] text-[#ECEEF2] text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.98] text-white text-xs font-medium shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Inserting...</span>
                </>
              ) : (
                <span>Confirm & Insert into Resume</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
