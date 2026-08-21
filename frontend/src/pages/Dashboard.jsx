import { Link } from 'react-router-dom';

export default function Dashboard() {
  // TODO (Day 3): Auth-gating check for logged-in user state

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-khaki-light p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Dashboard Header / Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-olive-wood">Dashboard</h1>
            <p className="text-olive-wood/70 text-sm mt-1">
              Overview of your automated resume updates and ATS performance score
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/preview-test"
              className="px-4 py-2.5 rounded-xl bg-khaki-light hover:bg-khaki/30 text-olive-wood font-medium border border-khaki/50 transition-all shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4 text-olive-wood" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Preview
            </Link>
            <Link
              to="/upload"
              className="px-5 py-2.5 rounded-xl bg-sage text-white font-medium shadow transition-all hover:bg-sage-hover flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload New Resume
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/ats-test"
            className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2 hover:border-sage/60 transition-all group cursor-pointer block"
          >
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">ATS Match Score</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Demo Ready
              </span>
            </div>
            <div className="text-3xl font-bold text-sage group-hover:text-sage-hover flex items-baseline gap-1">
              <span>94</span>
              <span className="text-xs font-normal text-olive-wood/50">/ 100</span>
            </div>
            <p className="text-xs text-olive-wood/60 flex items-center justify-between">
              <span>Strong Match • 5 criteria passed</span>
              <span className="text-sage font-semibold group-hover:translate-x-0.5 transition-transform">View Report &rarr;</span>
            </p>
          </Link>

          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">GitHub Status</span>
              <div className="text-lg font-semibold text-olive-wood">Not Connected</div>
              <p className="text-xs text-olive-wood/60">Sync your repositories for auto updates</p>
            </div>
            <button 
              type="button"
              className="w-full py-2 px-3 rounded-xl bg-khaki-light text-olive-wood text-xs font-medium hover:bg-khaki/30 border border-khaki/50 transition-all cursor-pointer"
            >
              Connect GitHub
            </button>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">Last Update</span>
            <div className="text-lg font-semibold text-olive-wood">Never</div>
            <p className="text-xs text-olive-wood/60">No automated update events triggered yet</p>
          </div>
        </div>

        {/* Designed Empty State Card */}
        <div className="bg-white rounded-2xl border border-khaki/40 p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto space-y-5">
            <div className="w-16 h-16 bg-sage/10 rounded-full flex items-center justify-center mx-auto text-sage">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-olive-wood">No Resume Uploaded Yet</h3>
              <p className="text-olive-wood/70 text-sm mt-1">
                Upload your master .docx or PDF resume to unlock automated GitHub syncing and ATS optimization.
              </p>
            </div>
            <Link
              to="/upload"
              className="inline-block px-6 py-2.5 rounded-xl bg-sage text-white font-medium shadow transition-all hover:bg-sage-hover cursor-pointer"
            >
              Upload Resume Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}