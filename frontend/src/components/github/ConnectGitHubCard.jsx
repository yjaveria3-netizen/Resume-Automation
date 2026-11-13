import React from 'react';

/**
 * ConnectGitHubCard - Calm Executive Dark Theme
 * 
 * Manages GitHub OAuth connection status, synchronization triggers,
 * and activity status indicator.
 */
export default function ConnectGitHubCard({
  isConnected,
  githubUsername,
  avatarUrl,
  onConnect,
  onDisconnect,
  onResync,
  loading = false,
}) {
  if (isConnected) {
    return (
      <div className="bg-[#12151C] p-5 rounded-xl border border-white/[0.06] shadow-xs space-y-4">
        {/* Header: User avatar + connected status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={githubUsername || 'GitHub Avatar'}
                className="w-10 h-10 rounded-lg border border-white/[0.06] object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] flex items-center justify-center font-medium text-sm">
                {githubUsername ? githubUsername.charAt(0).toUpperCase() : 'GH'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[#ECEEF2] text-sm">
                  {githubUsername || 'Connected Account'}
                </h3>
              </div>
              <p className="text-xs text-[#9AA1AE] mt-0.5">
                github.com/{githubUsername || 'user'}
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <span>Active Sync</span>
          </span>
        </div>

        {/* Sync indicators summary */}
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-[#0B0D12] border border-white/[0.06] text-xs">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <span className="text-[#ECEEF2] font-medium text-[11px]">Webhook Live</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <span className="text-[#ECEEF2] font-medium text-[11px]">Auto Commit Feed</span>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
          <button
            type="button"
            onClick={onResync}
            disabled={loading}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#171B24] hover:bg-[#202531] text-[#ECEEF2] border border-white/[0.06] shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 text-[#9AA1AE] ${loading ? 'animate-spin' : ''}`}
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
            <span>{loading ? 'Re-syncing...' : 'Re-sync Commits'}</span>
          </button>

          <button
            type="button"
            onClick={onDisconnect}
            className="text-xs font-normal text-[#6B7280] hover:text-[#F87171] transition-colors cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#12151C] p-5 rounded-xl border border-white/[0.06] shadow-xs space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] rounded-lg flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-[#ECEEF2] text-sm">Connect GitHub</h3>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#171B24] text-[#9AA1AE] border border-white/[0.06]">
              Automation
            </span>
          </div>
          <p className="text-xs text-[#9AA1AE] mt-1 leading-relaxed">
            Link your repositories to automatically extract commit achievements into ATS-tailored bullet points.
          </p>
        </div>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={onConnect}
          className="w-full py-2 px-3 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          <svg className="w-3.5 h-3.5 fill-current text-white" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          <span>Connect with GitHub</span>
        </button>
      </div>
    </div>
  );
}
