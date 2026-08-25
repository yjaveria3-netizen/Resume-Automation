import React, { useState } from 'react';

/**
 * AtsFeedbackList - Categorized ATS Insights and Actionable Suggestions List
 * 
 * Props:
 * @param {Array} items - List of feedback items:
 *    [{ id, status: 'pass'|'warn'|'fail', category: string, message: string, suggestion: string }]
 * @param {string} filterCategory - Optional category filter ('All' or specific category name)
 * @param {string} filterStatus - Optional status filter ('all' | 'pass' | 'warn' | 'fail')
 * @param {string} className - Additional CSS classes
 */
export default function AtsFeedbackList({
  items = [],
  filterCategory = 'All',
  filterStatus = 'all',
  className = '',
}) {
  const [expandedIds, setExpandedIds] = useState({});

  const toggleExpand = (id) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter items based on active filters
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      filterCategory === 'All' ||
      item.category.toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus =
      filterStatus === 'all' || item.status === filterStatus;
    return matchesCategory && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pass':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
            </svg>
          ),
          containerClass: 'bg-emerald-50/80 border-emerald-200/80 hover:border-emerald-300',
          iconWrapClass: 'bg-emerald-500 text-white shadow-emerald-200',
          tagClass: 'bg-emerald-100/70 text-emerald-800 border-emerald-200',
          titleClass: 'text-emerald-950 font-semibold',
          statusLabel: 'Passed',
        };
      case 'warn':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          containerClass: 'bg-amber-50/80 border-amber-200/80 hover:border-amber-300',
          iconWrapClass: 'bg-amber-500 text-white shadow-amber-200',
          tagClass: 'bg-amber-100/70 text-amber-800 border-amber-200',
          titleClass: 'text-amber-950 font-semibold',
          statusLabel: 'Improvement Needed',
        };
      case 'fail':
      default:
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          containerClass: 'bg-rose-50/80 border-rose-200/80 hover:border-rose-300',
          iconWrapClass: 'bg-rose-500 text-white shadow-rose-200',
          tagClass: 'bg-rose-100/70 text-rose-800 border-rose-200',
          titleClass: 'text-rose-950 font-semibold',
          statusLabel: 'Missing Requirement',
        };
    }
  };

  if (!filteredItems.length) {
    return (
      <div className={`p-8 text-center bg-khaki-light/40 border border-dashed border-khaki/60 rounded-2xl ${className}`}>
        <div className="w-10 h-10 mx-auto rounded-full bg-khaki/30 text-olive-wood/60 flex items-center justify-center mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-olive-wood">No feedback items match this filter</p>
        <p className="text-xs text-olive-wood/60 mt-0.5">Try selecting "All" categories to view all ATS recommendations.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {filteredItems.map((item, index) => {
        const config = getStatusBadge(item.status);
        const itemId = item.id || `feedback-${index}`;
        const isExpanded = expandedIds[itemId] ?? true; // Default open for immediate value

        return (
          <div
            key={itemId}
            className={`border rounded-2xl p-4 transition-all duration-200 shadow-sm ${config.containerClass}`}
          >
            <div className="flex items-start gap-3.5">
              {/* Status Icon */}
              <div
                className={`w-7 h-7 rounded-xl flex-shrink-0 flex items-center justify-center shadow-sm mt-0.5 ${config.iconWrapClass}`}
                title={config.statusLabel}
              >
                {config.icon}
              </div>

              {/* Content Area */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-wide border uppercase ${config.tagClass}`}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs font-semibold text-olive-wood/60">
                      • {config.statusLabel}
                    </span>
                  </div>

                  {item.suggestion && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(itemId)}
                      className="text-xs font-medium text-olive-wood/70 hover:text-olive-wood underline decoration-khaki underline-offset-2 transition-colors cursor-pointer"
                    >
                      {isExpanded ? 'Hide Advice' : 'View Actionable Advice'}
                    </button>
                  )}
                </div>

                {/* Primary Message */}
                <p className={`text-sm mt-1.5 leading-relaxed ${config.titleClass}`}>
                  {item.message}
                </p>

                {/* Actionable Suggestion Box */}
                {item.suggestion && isExpanded && (
                  <div className="mt-3 p-3 rounded-xl bg-white/90 border border-khaki/30 text-xs text-olive-wood shadow-2xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-sage-hover">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Recommended Action:</span>
                    </div>
                    <p className="text-olive-wood/85 leading-relaxed pl-5">
                      {item.suggestion}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
