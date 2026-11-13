import React, { useState, useEffect } from 'react';

/**
 * SmartSwapModal Component - Calm Executive Dark Theme
 *
 * Triggered when inserting a new project would exceed the 1-page line limit.
 * Asks user whether to archive their oldest project to make room, or keep both on 2 pages.
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

  useEffect(() => {
    if (existingProjects && existingProjects.length > 0) {
      setSelectedProjectId(existingProjects[existingProjects.length - 1]?.id || existingProjects[0]?.id || '');
    }
  }, [existingProjects]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isProcessing) {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, isProcessing]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#06090E]/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#12151C] w-full max-w-lg rounded-xl border border-white/[0.06] shadow-xl p-6 sm:p-7 space-y-4 animate-scale-in text-[#ECEEF2]">
        {/* Header with Warning Icon */}
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-[#171B24] border border-white/[0.06] text-[#F97316] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
              1-Page Budget Protection
            </span>
            <h3 className="text-base font-semibold text-[#ECEEF2] mt-1">
              Smart Project Swap Recommendation
            </h3>
          </div>
        </div>

        {/* Informative Prompt Body */}
        <div className="bg-[#0B0D12] p-3.5 rounded-lg border border-white/[0.06] text-xs sm:text-sm text-[#ECEEF2] leading-relaxed space-y-2">
          <p className="font-medium text-[#ECEEF2]">
            Your resume is strictly formatted for 1 page.
          </p>
          <p className="text-[#9AA1AE]">
            Would you like to archive your oldest project{' '}
            <span className="text-[#ECEEF2] font-medium bg-[#171B24] px-1.5 py-0.5 rounded border border-white/[0.06]">
              [{oldProjectName}]
            </span>{' '}
            to preserve the 1-page layout for{' '}
            <span className="text-[#34D399] font-medium bg-[#34D399]/10 px-1.5 py-0.5 rounded border border-[#34D399]/20">
              [{newProjectTitle}]
            </span>
            ?
          </p>
          <p className="text-[11px] text-[#6B7280]">
            Archived projects remain safely stored in your database and can be restored at any time.
          </p>
        </div>

        {/* Project Selector if multiple projects exist */}
        {existingProjects.length > 1 && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-[#ECEEF2] block">
              Choose Project to Archive:
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full text-xs text-[#ECEEF2] bg-[#0B0D12] border border-white/[0.08] rounded-lg p-2.5 focus:outline-none focus:border-[#F97316] font-medium"
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={handleKeepBothClick}
            disabled={isProcessing}
            className="px-3.5 py-1.5 rounded-lg border border-white/[0.06] bg-[#171B24] hover:bg-[#202531] text-[#9AA1AE] hover:text-[#ECEEF2] text-xs font-medium transition-colors cursor-pointer text-center disabled:opacity-50"
          >
            Keep Both (2 Pages)
          </button>

          <button
            type="button"
            onClick={handleSwapClick}
            disabled={isProcessing}
            className="px-4 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-medium shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Swapping...</span>
              </>
            ) : (
              <span>Swap & Preserve 1-Page</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
