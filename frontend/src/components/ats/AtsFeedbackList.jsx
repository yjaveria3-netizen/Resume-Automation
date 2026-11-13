import React, { useState } from 'react';

/**
 * AtsFeedbackList - Categorized ATS Insights and Actionable Suggestions List
 * Calm Executive Dark Theme
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
            <svg className="w-4 h-4 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          ),
          containerClass: 'bg-[#12151C] border-white/[0.06] hover:border-white/[0.12]',
          iconWrapClass: 'bg-[#34D399]/10 border border-[#34D399]/20',
          tagClass: 'bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20',
          titleClass: 'text-[#ECEEF2] font-medium',
          statusLabel: 'Passed',
        };
      case 'warn':
        return {
          icon: (
            <svg className="w-4 h-4 text-[#F97316]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          ),
          containerClass: 'bg-[#12151C] border-white/[0.06] hover:border-[#F97316]/30',
          iconWrapClass: 'bg-[#F97316]/10 border border-[#F97316]/20',
          tagClass: 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20',
          titleClass: 'text-[#ECEEF2] font-medium',
          statusLabel: 'Improvement Needed',
        };
      case 'fail':
      default:
        return {
          icon: (
            <svg className="w-4 h-4 text-[#F87171]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          containerClass: 'bg-[#12151C] border-white/[0.06] hover:border-[#F87171]/30',
          iconWrapClass: 'bg-[#F87171]/10 border border-[#F87171]/20',
          tagClass: 'bg-[#F87171]/10 text-[#F87171] border border-[#F87171]/20',
          titleClass: 'text-[#ECEEF2] font-medium',
          statusLabel: 'Missing Requirement',
        };
    }
  };

  if (!filteredItems.length) {
    return (
      <div className={`p-8 text-center bg-[#0B0D12] border border-dashed border-white/[0.08] rounded-xl text-[#9AA1AE] ${className}`}>
        <p className="text-sm font-semibold text-[#ECEEF2]">No feedback items match this filter</p>
        <p className="text-xs text-[#6B7280] mt-0.5">Try selecting "Overview" to see all ATS recommendations.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {filteredItems.map((item, index) => {
        const config = getStatusBadge(item.status);
        const itemId = item.id || `feedback-${index}`;
        const isExpanded = expandedIds[itemId] ?? true;

        return (
          <div
            key={itemId}
            className={`border rounded-xl p-4 transition-all duration-150 shadow-xs ${config.containerClass}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5 ${config.iconWrapClass}`}
                title={config.statusLabel}
              >
                {config.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase ${config.tagClass}`}
                    >
                      {item.category}
                    </span>
                    <span className="text-xs font-normal text-[#6B7280]">
                      • {config.statusLabel}
                    </span>
                  </div>

                  {item.suggestion && (
                    <button
                      type="button"
                      onClick={() => toggleExpand(itemId)}
                      className="text-xs font-medium text-[#9AA1AE] hover:text-[#ECEEF2] hover:underline transition-colors cursor-pointer"
                    >
                      {isExpanded ? 'Hide Advice' : 'View Actionable Advice'}
                    </button>
                  )}
                </div>

                <p className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${config.titleClass}`}>
                  {item.message}
                </p>

                {item.suggestion && isExpanded && (
                  <div className="mt-2.5 p-3 rounded-lg bg-[#0B0D12] border border-white/[0.06] text-xs text-[#9AA1AE] space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-[#ECEEF2]">
                      <span className="text-[#F97316]">⚡</span>
                      <span>Recommended Action:</span>
                    </div>
                    <p className="text-[#9AA1AE] leading-relaxed pl-5 font-normal">
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
