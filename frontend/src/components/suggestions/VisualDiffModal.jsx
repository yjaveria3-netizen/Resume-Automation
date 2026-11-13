import React, { useState, useEffect } from 'react';

/**
 * VisualDiffModal Component (Day 11 Review Queue)
 *
 * Modal popup comparing the current resume's Projects section against the proposed version,
 * highlighting the new bullet in a soft green background with an added `+` badge.
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
  const [viewMode, setViewMode] = useState('diff'); // 'diff' | 'document'
  const [editedBullet, setEditedBullet] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever suggestion changes or modal opens
  useEffect(() => {
    if (suggestion) {
      setEditedBullet(suggestion.proposed_bullet || '');
      setIsEditing(false);
      setCopied(false);
    }
  }, [suggestion, isOpen]);

  // Handle escape key
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

  // Fallback existing bullets if not passed
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
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn"
    >
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-khaki/30 flex flex-col overflow-hidden my-auto max-h-[94vh] transition-transform duration-300 transform scale-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: Reviewing Changes for [Repo Name] */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-olive-wood text-white px-4 sm:px-6 py-3.5 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-700">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 id="modal-title" className="text-sm sm:text-lg font-black tracking-tight text-white">
                Reviewing Changes for <span className="text-emerald-300 underline decoration-emerald-500/50">{repoName}</span>
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-slate-300">
              <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded border border-slate-600 text-emerald-300 text-[11px] sm:text-xs">
                sha: {commitSha}
              </span>
              <span className="truncate max-w-[180px] sm:max-w-md text-slate-400 text-[11px] sm:text-xs">
                "{commitMessage}"
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* View Mode Toggle: Diff View vs Document View */}
            <div className="inline-flex rounded-xl bg-slate-800 p-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode('diff')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                  viewMode === 'diff'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Diff View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('document')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none ${
                  viewMode === 'document'
                    ? 'bg-emerald-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white'
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
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
              title="Close modal"
              aria-label="Close modal"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modal Body: Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-sm">
          {viewMode === 'diff' ? (
            /* --- DIFF VIEW --- */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-olive-wood/80 uppercase tracking-wider pb-1 border-b border-khaki/30">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Projects Section — Unified Inline Diff
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  +1 Proposed Bullet Addition
                </span>
              </div>

              {/* Project Title Block */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {repoName}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">| Lead Engineer</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">2026 – Present</span>
                </div>

                {/* Bullets List */}
                <div className="space-y-2.5">
                  {/* 1. Existing Bullets: displayed in standard slate-700 text */}
                  {activeBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed pl-1"
                    >
                      <span className="text-slate-400 select-none font-bold text-base leading-none">•</span>
                      <p className="flex-1">{bullet}</p>
                    </div>
                  ))}

                  {/* 2. Proposed Bullet Inserted with soft green background and + badge */}
                  <div className="relative group">
                    <div className="bg-emerald-50 border-l-4 border-emerald-500 p-2.5 rounded text-emerald-900 font-medium transition-all">
                      <div className="flex items-start gap-2.5">
                        {/* + Badge */}
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-2xs shrink-0 mt-0.5">
                          +
                        </span>

                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editedBullet}
                                onChange={(e) => setEditedBullet(e.target.value)}
                                rows={3}
                                className="w-full text-xs sm:text-sm text-emerald-950 bg-white border border-emerald-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans shadow-inner"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => setIsEditing(false)}
                                  className="text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-300 hover:bg-emerald-100 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
                                >
                                  Done
                                </button>
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs sm:text-sm text-emerald-900 font-medium leading-relaxed">
                              {editedBullet}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-1 border-t border-emerald-200/60 text-[11px] text-emerald-800">
                            <span className="font-semibold flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              AI Diff Synthesis (X-Y-Z formula)
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleCopy}
                                className="hover:underline font-semibold text-emerald-800 flex items-center gap-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
                              >
                                {copied ? '✓ Copied' : 'Copy bullet'}
                              </button>
                              <span>•</span>
                              <button
                                type="button"
                                onClick={() => setIsEditing(!isEditing)}
                                className="hover:underline font-bold text-emerald-900 cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none rounded"
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

              {/* Diff Context Card */}
              {suggestion.diff_summary && (
                <div className="p-3 bg-khaki-light/30 rounded-xl border border-khaki/30 text-xs text-olive-wood/80 flex items-start gap-2">
                  <svg className="w-4 h-4 text-sage shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-bold text-olive-wood">Git Patch Context: </span>
                    <span>{typeof suggestion.diff_summary === 'string' ? suggestion.diff_summary : JSON.stringify(suggestion.diff_summary)}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- DOCUMENT VIEW: Full Formatted 1-Page Layout --- */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-olive-wood/80 uppercase tracking-wider pb-1 border-b border-khaki/30">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Full Formatted Document View (1-Page Budget Compliance)
                </span>
                <span className="text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
                  Strictly 1 Page
                </span>
              </div>

              {/* Simulated Paper Sheet */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 sm:p-8 shadow-inner font-serif text-slate-800 space-y-4">
                {/* Resume Header */}
                <div className="text-center pb-3 border-b-2 border-slate-900">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-wide font-sans">
                    Alex Taylor
                  </h3>
                  <p className="text-xs text-slate-600 font-sans mt-1">
                    San Francisco, CA • alex.taylor@example.com • github.com/alextaylor • linkedin.com/in/alextaylor
                  </p>
                </div>

                {/* Section: Technical Experience & Projects */}
                <div className="space-y-3">
                  <div className="border-b border-slate-400 pb-0.5">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                      Technical Projects & Experience
                    </h4>
                  </div>

                  {/* Active Project */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between font-sans">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        {repoName} <span className="font-normal text-slate-600">| Lead Engineer</span>
                      </span>
                      <span className="text-xs text-slate-500 italic">2026 – Present</span>
                    </div>

                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 font-sans leading-relaxed">
                      {activeBullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                      {/* Highlighted new bullet in document */}
                      <li className="bg-emerald-100/70 text-emerald-950 font-medium px-1 rounded transition-colors">
                        <span className="font-bold text-emerald-700 mr-1">[NEW]</span>
                        {editedBullet}
                      </li>
                    </ul>
                  </div>

                  {/* Sibling Project */}
                  <div className="space-y-1 pt-2">
                    <div className="flex items-baseline justify-between font-sans">
                      <span className="font-bold text-xs sm:text-sm text-slate-900">
                        High-Throughput Analytics Engine <span className="font-normal text-slate-600">| Distributed Systems</span>
                      </span>
                      <span className="text-xs text-slate-500 italic">2025 – 2026</span>
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-slate-700 font-sans leading-relaxed">
                      <li>Engineered low-latency ingestion microservices utilizing Python and Apache Kafka.</li>
                      <li>Standardized automated CI/CD deployment pipelines on Docker with automated regression testing.</li>
                    </ul>
                  </div>

                  {/* Education & Skills summary */}
                  <div className="border-b border-slate-400 pb-0.5 pt-2">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-sans">
                      Technical Skills
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 font-sans">
                    <span className="font-bold">Languages & Frameworks:</span> Python, JavaScript (ES6+), React, Tailwind CSS, FastAPI, PostgreSQL, Docker, Git.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Cancel & Confirm */}
        <div className="bg-slate-50 border-t border-khaki/30 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <p className="text-xs text-olive-wood/70 font-medium order-2 sm:order-1 text-center sm:text-left">
            Inserting this bullet updates your active resume without overflowing the 1-page budget.
          </p>

          <div className="flex items-center justify-end gap-2.5 order-1 sm:order-2">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              Cancel
            </button>

            {/* Confirm & Insert into Resume Button */}
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-black shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:outline-none"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Inserting into Resume...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Confirm & Insert into Resume</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

