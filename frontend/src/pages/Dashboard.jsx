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

        {/* Metric Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">ATS Match Score</span>
            <div className="text-3xl font-bold text-sage">-- %</div>
            <p className="text-xs text-olive-wood/60">Upload a resume to analyze compatibility</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">GitHub Status</span>
            <div className="text-lg font-semibold text-olive-wood">Not Connected</div>
            <p className="text-xs text-olive-wood/60">Sync your repositories for auto updates</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">Last Update</span>
            <div className="text-lg font-semibold text-olive-wood">Never</div>
            <p className="text-xs text-olive-wood/60">No automated update events triggered yet</p>
          </div>
        </div>

        {/* Empty Content Area Placeholder */}
        <div className="bg-white rounded-2xl border border-khaki/40 p-12 text-center shadow-sm">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-khaki-light rounded-full flex items-center justify-center mx-auto text-khaki">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-olive-wood">Main Dashboard Content Area</h3>
            <p className="text-olive-wood/70 text-sm">
              Visual mocks and interactive analytics widgets will be integrated here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
