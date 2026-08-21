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
          <div className="flex gap-3">
            <Link
              to="/upload"
              className="px-5 py-2.5 rounded-xl bg-sage text-white font-medium shadow transition-all hover:bg-sage-hover"
            >
              Upload New Resume
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">ATS Match Score</span>
            <div className="text-3xl font-bold text-sage">-- %</div>
            <p className="text-xs text-olive-wood/60">Upload a resume to analyze compatibility</p>
          </div>

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