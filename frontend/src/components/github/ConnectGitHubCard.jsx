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
      <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm transition-all hover:shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={githubUsername || 'GitHub Avatar'}
                className="w-12 h-12 rounded-full border-2 border-sage/40 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-sage/20 flex items-center justify-center text-sage font-bold text-lg">
                {githubUsername ? githubUsername.charAt(0).toUpperCase() : 'GH'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-olive-wood text-base">
                  {githubUsername || 'Connected GitHub'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Connected
                </span>
              </div>
              <p className="text-xs text-olive-wood/60 mt-0.5">
                Repositories linked & synced for automated resume updating
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-khaki/20">
          <button
            type="button"
            onClick={onResync}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-sage text-white shadow-sm hover:bg-sage-hover transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`}
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
            Re-sync Projects
          </button>

          <button
            type="button"
            onClick={onDisconnect}
            className="text-xs font-medium text-olive-wood/60 hover:text-red-600 transition-colors cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm transition-all hover:shadow-md space-y-4">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-olive-wood text-white rounded-xl shadow">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-olive-wood text-lg">Connect GitHub Account</h3>
          <p className="text-sm text-olive-wood/70 mt-1">
            Link your GitHub account to automatically parse your repositories, recent commits, and top technical projects into your resume.
          </p>
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={onConnect}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-olive-wood hover:bg-black text-white font-semibold shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
          </svg>
          Connect with GitHub
        </button>
      </div>
    </div>
  );
}
