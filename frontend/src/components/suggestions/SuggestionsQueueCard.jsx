import React, { useState } from 'react';

/**
 * SuggestionsQueueCard Component (Day 11 Review Queue)
 *
 * Renders pending AI bullet suggestions triggered by GitHub commits.
 * Allows users to review, edit inline, accept, or dismiss recommendations.
 *
 * @param {Array} suggestions - List of pending suggestion objects
 * @param {Function} onAccept - (id, editedBullet) => void
 * @param {Function} onDismiss - (id) => void
 * @param {Function} onEdit - (id, text) => void
 */
export default function SuggestionsQueueCard({
  suggestions = [],
  onAccept,
  onDismiss,
  onEdit,
}) {
  // Store per-item edit state: { [id]: { isEditing: boolean, text: string } }
  const [itemStates, setItemStates] = useState({});
  const [dismissingIds, setDismissingIds] = useState(new Set());
  const [processingIds, setProcessingIds] = useState(new Set());

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

  const handleAcceptClick = async (suggestion) => {
    const finalText = getItemText(suggestion);
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
    }, 300); // 300ms matches the Tailwind transition duration
  };

  const formatSha = (sha) => {
    if (!sha) return 'latest';
    return sha.slice(0, 7);
  };

  return (
    <div className="w-full bg-white rounded-3xl border border-khaki/40 shadow-sm overflow-hidden transition-all duration-300">
      {/* Light amber to blue gradient header banner */}
      <div className="bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border-b border-khaki/30 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-olive-wood">
              ■ New GitHub Activity Detected
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold border border-amber-300">
              {suggestions.length} pending
            </span>
          </div>
        </div>
        <p className="text-xs text-olive-wood/70 font-medium">
          Human-in-the-Loop review: Approve, refine, or dismiss before your resume updates
        </p>
      </div>

      {/* Suggestion Items List */}
      <div className="divide-y divide-khaki/20">
        {suggestions.map((suggestion) => {
          const isDismissing = dismissingIds.has(suggestion.id);
          const isProcessing = processingIds.has(suggestion.id);
          const editing = isItemEditing(suggestion.id);
          const text = getItemText(suggestion);

          return (
            <div
              key={suggestion.id}
              className={`p-5 sm:p-6 transition-all duration-300 ease-in-out ${
                isDismissing
                  ? 'opacity-0 -translate-x-6 max-h-0 py-0 overflow-hidden'
                  : 'opacity-100 translate-x-0'
              } hover:bg-khaki-light/20`}
            >
              {/* Header: Repo Name, Commit SHA, Commit message */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Repo with GitHub Icon */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-2xs">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    <span>{suggestion.repo_name}</span>
                  </span>

                  {/* SHA Badge */}
                  <span className="inline-flex items-center font-mono text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-khaki/25 text-olive-wood border border-khaki/40">
                    sha: {formatSha(suggestion.commit_sha)}
                  </span>
                </div>

                {/* Commit Summary */}
                {suggestion.commit_message && (
                  <span className="text-xs text-olive-wood/65 italic font-medium truncate max-w-sm">
                    "{suggestion.commit_message}"
                  </span>
                )}
              </div>

              {/* Proposed AI Bullet / Textarea */}
              <div className="relative mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-olive-wood/75 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sage"></span>
                    Proposed AI Bullet Point
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleEdit(suggestion)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sage hover:text-sage-hover transition-colors cursor-pointer"
                    title={editing ? 'Lock changes' : 'Edit bullet text'}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    <span>{editing ? 'Done Editing' : 'Edit'}</span>
                  </button>
                </div>

                {editing ? (
                  <div className="space-y-1.5">
                    <textarea
                      value={text}
                      onChange={(e) => handleTextChange(suggestion.id, e.target.value)}
                      rows={3}
                      className="w-full text-xs sm:text-sm text-olive-wood bg-khaki-light/40 border-2 border-sage/60 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all shadow-inner leading-relaxed resize-y font-sans"
                      placeholder="Fine-tune your bullet point here before inserting..."
                    />
                    <p className="text-[11px] text-olive-wood/60 italic">
                      Tip: Keep strong action verbs and quantifiable metrics.
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => toggleEdit(suggestion)}
                    className="p-3.5 rounded-2xl bg-khaki-light/35 border border-khaki/30 text-xs sm:text-sm text-olive-wood leading-relaxed font-medium cursor-pointer hover:border-sage/40 transition-all group flex items-start justify-between gap-3"
                  >
                    <p className="flex-1">{text}</p>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-sage text-xs font-bold whitespace-nowrap self-center">
                      Click to edit ✎
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Responsive stacking on small screens */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
                {/* Dismiss button */}
                <button
                  type="button"
                  onClick={() => handleDismissClick(suggestion.id)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-khaki/50 bg-white hover:bg-rose-50 hover:border-rose-200 text-olive-wood/70 hover:text-rose-700 text-xs font-bold transition-all shadow-2xs cursor-pointer text-center disabled:opacity-50"
                >
                  Dismiss
                </button>

                {/* Edit Toggle button */}
                <button
                  type="button"
                  onClick={() => toggleEdit(suggestion)}
                  disabled={isProcessing}
                  className="px-4 py-2.5 rounded-xl border border-khaki/40 bg-white hover:bg-khaki-light text-olive-wood text-xs font-bold transition-all shadow-2xs cursor-pointer text-center flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>{editing ? 'Lock Text' : 'Edit Bullet'}</span>
                </button>

                {/* Primary Green CTA: Accept & Insert */}
                <button
                  type="button"
                  onClick={() => handleAcceptClick(suggestion)}
                  disabled={isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-extrabold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                      <svg className="w-4 h-4 text-emerald-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Accept & Insert into Resume</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
