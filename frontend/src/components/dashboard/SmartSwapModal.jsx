import React, { useState, useEffect } from 'react';

/**
 * SmartSwapModal Component (Day 12 1-Page Layout Protector)
 *
 * Triggered when inserting a new project would exceed the 1-page line limit.
 * Asks user whether to archive their oldest project to make room, or keep both on 2 pages.
 *
 * @param {boolean} isOpen
 * @param {Function} onClose
 * @param {Function} onSwap - (archiveProjectId) => void
 * @param {Function} onKeepBoth - () => void
 * @param {string} newProjectTitle
 * @param {Array} existingProjects - list of current projects [{ id, github_repo_name, name, description }]
 * @param {boolean} isProcessing
 */
export default function SmartSwapModal({
  isOpen,
  onClose,
  onSwap,
  onKeepBoth,
  newProjectTitle = 'New GitHub Project',
  existingProjects = [],
  isProcessing = false,
}) {
  const [selectedProjectId, setSelectedProjectId] = useState('');

  // Default to first/oldest project
  useEffect(() => {
    if (existingProjects && existingProjects.length > 0) {
      setSelectedProjectId(existingProjects[existingProjects.length - 1]?.id || existingProjects[0]?.id || '');
    }
  }, [existingProjects]);

  if (!isOpen) return null;

  const candidateOldProject =
    existingProjects.find((p) => String(p.id) === String(selectedProjectId)) ||
    existingProjects[existingProjects.length - 1] ||
    existingProjects[0] ||
    { github_repo_name: 'OldProject', name: 'OldProject' };

  const oldProjectName =
    candidateOldProject.github_repo_name || candidateOldProject.name || 'Oldest Project';

  const handleSwapClick = () => {
    if (onSwap) {
      onSwap(selectedProjectId || candidateOldProject.id);
    }
  };

  const handleKeepBothClick = () => {
    if (onKeepBoth) {
      onKeepBoth();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl border border-khaki/40 shadow-2xl p-6 sm:p-7 space-y-5 animate-scale-in">
        {/* Header with Warning Icon */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                1-Page Budget Protection
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-olive-wood mt-1">
              Smart Project Swap Recommendation
            </h3>
          </div>
        </div>

        {/* Informative Prompt Body */}
        <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-200 text-xs sm:text-sm text-olive-wood/90 leading-relaxed space-y-2">
          <p className="font-semibold text-amber-950">
            Your resume is optimized for 1 page.
          </p>
          <p>
            Would you like to archive your oldest project{' '}
            <span className="font-bold text-olive-wood bg-white px-2 py-0.5 rounded-lg border border-amber-300">
              [{oldProjectName}]
            </span>{' '}
            to make room for{' '}
            <span className="font-bold text-olive-wood bg-white px-2 py-0.5 rounded-lg border border-emerald-300">
              [{newProjectTitle}]
            </span>
            ?
          </p>
          <p className="text-[11px] text-olive-wood/70">
            Archived projects are safely stored in your database and can be restored at any time.
          </p>
        </div>

        {/* Optional Project Selector if multiple projects exist */}
        {existingProjects.length > 1 && (
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-olive-wood/80 block">
              Choose Project to Archive:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs text-olive-wood bg-white border border-khaki/50 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-sage"
            >
              {existingProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.github_repo_name || p.name} {p.tech_stack ? `(${Array.isArray(p.tech_stack) ? p.tech_stack.join(', ') : p.tech_stack})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
          {/* Keep Both Option */}
          <button
            type="button"
            onClick={handleKeepBothClick}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-khaki/50 bg-white hover:bg-khaki-light text-olive-wood text-xs font-bold transition-all shadow-2xs cursor-pointer text-center disabled:opacity-50"
          >
            Keep Both (2 Pages)
          </button>

          {/* Swap & Insert Primary Option */}
          <button
            type="button"
            onClick={handleSwapClick}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl bg-sage hover:bg-sage-hover active:scale-[0.98] text-white text-xs font-extrabold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Swapping Projects...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>Swap & Insert</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
