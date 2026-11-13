import React, { useState } from 'react';
import VisualDiffModal from './VisualDiffModal';

/**
 * SuggestionsQueueCard Component - Calm Executive Dark Theme
 *
 * Displays pending AI bullet suggestions derived from GitHub commits.
 * Matches the calm table aesthetics of Finanzo and Lux Panel.
 */
export default function SuggestionsQueueCard({
  suggestions = [],
  onAccept,
  onDismiss,
  onEdit,
}) {
  const [itemStates, setItemStates] = useState({});
  const [dismissingIds, setDismissingIds] = useState(new Set());
  const [processingIds, setProcessingIds] = useState(new Set());
  const [diffModalItem, setDiffModalItem] = useState(null);

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const getItemText = (suggestion) => {
    if (itemStates[suggestion.id]?.text !== undefined) {
      return itemStates[suggestion.id].text;
    }
    return suggestion.proposed_bullet || '';
  };

  const isItemEditing = (suggestionId) => {
    return Boolean(itemStates[suggestionId]?.isEditing);
  };

  const toggleEdit = (suggestion) => {
    const currentEditing = isItemEditing(suggestion.id);
    const currentText = getItemText(suggestion);

    setItemStates((prev) => ({
      ...prev,
      [suggestion.id]: {
        isEditing: !currentEditing,
        text: currentText,
      },
    }));

    if (currentEditing && onEdit) {
      onEdit(suggestion.id, currentText);
    }
  };

  const handleTextChange = (suggestionId, newText) => {
    setItemStates((prev) => ({
      ...prev,
      [suggestionId]: {
        isEditing: true,
        text: newText,
      },
    }));
  };

  const handleAcceptClick = async (suggestion, overrideText = null) => {
    const finalText = overrideText !== null ? overrideText : getItemText(suggestion);
    setProcessingIds((prev) => new Set(prev).add(suggestion.id));
    try {
      if (onAccept) {
        await onAccept(suggestion.id, finalText);
      }
    } finally {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(suggestion.id);
        return next;
      });
    }
  };

  const handleDismissClick = (suggestionId) => {
    setDismissingIds((prev) => new Set(prev).add(suggestionId));
    setTimeout(() => {
      if (onDismiss) {
        onDismiss(suggestionId);
      }
      setDismissingIds((prev) => {
        const next = new Set(prev);
        next.delete(suggestionId);
        return next;
      });
    }, 250);
  };

  const formatSha = (sha) => {
    if (!sha) return 'latest';
    return sha.slice(0, 7);
  };

  return (
    <div className="w-full bg-[#12151C] rounded-xl border border-white/[0.06] shadow-sm overflow-hidden transition-all">
      {/* Top Banner: Calm Surface with subtle indicator */}
      <div className="bg-[#171B24] text-[#ECEEF2] px-5 sm:px-6 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-[#ECEEF2]">
              GitHub Review Queue
            </span>
            <span className="px-2 py-0.5 rounded-md bg-[#F97316]/10 text-[#F97316] text-[11px] font-medium border border-[#F97316]/20">
              {suggestions.length} pending review
            </span>
          </div>
        </div>
        <p className="text-xs text-[#9AA1AE]">
          Review verified commits & apply quantified bullet points into your 1-page resume
        </p>
      </div>

      {/* Suggestion Items List */}
      <div className="divide-y divide-white/[0.04]">
        {suggestions.map((suggestion) => {
          const isDismissing = dismissingIds.has(suggestion.id);
          const isProcessing = processingIds.has(suggestion.id);
          const editing = isItemEditing(suggestion.id);
          const text = getItemText(suggestion);

          return (
            <div
              key={suggestion.id}
              className={`p-5 sm:p-6 transition-all duration-200 ease-out ${
                isDismissing
                  ? 'opacity-0 -translate-x-4 max-h-0 py-0 overflow-hidden'
                  : 'opacity-100 translate-x-0'
              } hover:bg-white/[0.02]`}
            >
              {/* Header: Repo Name, Commit SHA, Commit message */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#171B24] text-[#ECEEF2] text-xs font-medium border border-white/[0.06]">
                    <svg className="w-3.5 h-3.5 text-[#9AA1AE]" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>{suggestion.repo_name}</span>
                  </span>

                  <span className="font-mono text-[11px] font-normal px-2 py-0.5 rounded-md bg-[#0B0D12] text-[#9AA1AE] border border-white/[0.06]">
                    sha: {formatSha(suggestion.commit_sha)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
                    AI Quantified
                  </span>
                </div>
              </div>

              {/* Commit Message Pill */}
              <div className="mb-3 p-2.5 rounded-lg bg-[#0B0D12] border border-white/[0.06] text-xs text-[#9AA1AE] font-mono flex items-start gap-2">
                <span className="text-[#9AA1AE] font-medium shrink-0">Commit:</span>
                <span className="text-[#ECEEF2] truncate">{suggestion.commit_message || 'Automated code enhancement'}</span>
              </div>

              {/* Proposed Resume Bullet (Editable) */}
              <div className="mb-4">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] mb-1.5">
                  Generated Resume Bullet Point:
                </label>
                {editing ? (
                  <textarea
                    value={text}
                    onChange={(e) => handleTextChange(suggestion.id, e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-lg border border-[#F97316]/60 bg-[#0B0D12] text-xs text-[#ECEEF2] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#F97316]/40"
                  />
                ) : (
                  <div className="p-3.5 rounded-lg bg-[#171B24] border border-white/[0.06] text-xs sm:text-sm text-[#ECEEF2] leading-relaxed font-normal">
                    {text}
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleEdit(suggestion)}
                    className="px-3 py-1.5 rounded-lg bg-[#171B24] hover:bg-[#202531] text-[#9AA1AE] hover:text-[#ECEEF2] border border-white/[0.06] text-xs font-medium transition-colors cursor-pointer"
                  >
                    {editing ? 'Done Editing' : 'Edit Inline'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setDiffModalItem(suggestion)}
                    className="px-3 py-1.5 rounded-lg bg-[#171B24] hover:bg-[#202531] text-[#9AA1AE] hover:text-[#ECEEF2] border border-white/[0.06] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5 text-[#9AA1AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Diff</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDismissClick(suggestion.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#6B7280] hover:text-[#F87171] hover:bg-[#F87171]/10 border border-transparent transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAcceptClick(suggestion)}
                    disabled={isProcessing}
                    className="px-3.5 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.98] text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Applying...</span>
                      </>
                    ) : (
                      <>
                        <span>✓ Accept to Resume</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Visual Diff Modal */}
      {diffModalItem && (
        <VisualDiffModal
          isOpen={Boolean(diffModalItem)}
          onClose={() => setDiffModalItem(null)}
          suggestion={diffModalItem}
          onAccept={(id, text) => {
            handleAcceptClick(diffModalItem, text);
            setDiffModalItem(null);
          }}
          onDismiss={(id) => {
            handleDismissClick(id);
            setDiffModalItem(null);
          }}
        />
      )}
    </div>
  );
}
