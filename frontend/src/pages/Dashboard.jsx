import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectGitHubCard from '../components/github/ConnectGitHubCard';
import { getGitHubStatus, disconnectGitHub, getUser } from '../api/auth';
// 1. Import your Day 4 ATS components and mock data
import { AtsScoreCard, mockAtsData94 } from '../components/ats';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Dashboard() {
  const location = useLocation();
  const user = getUser();

  const [githubState, setGithubState] = useState({
    isConnected: false,
    githubUsername: null,
    avatarUrl: null,
    connectedAt: null,
  });
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [toastMessage, setToastMessage] = useState(() => location.state?.toast || '');

  useEffect(() => {
    if (toastMessage) {
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setToastMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const loadGithubStatus = async () => {
    setLoadingGithub(true);
    try {
      const data = await getGitHubStatus();
      if (data && data.is_connected) {
        setGithubState({
          isConnected: true,
          githubUsername: data.github_username,
          avatarUrl: data.avatar_url,
          connectedAt: data.connected_at,
        });
      } else {
        setGithubState({
          isConnected: false,
          githubUsername: null,
          avatarUrl: null,
          connectedAt: null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch GitHub status:', err);
    } finally {
      setLoadingGithub(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const fetchStatus = async () => {
      setLoadingGithub(true);
      try {
        const data = await getGitHubStatus();
        if (!ignore) {
          if (data && data.is_connected) {
            setGithubState({
              isConnected: true,
              githubUsername: data.github_username,
              avatarUrl: data.avatar_url,
              connectedAt: data.connected_at,
            });
          } else {
            setGithubState({
              isConnected: false,
              githubUsername: null,
              avatarUrl: null,
              connectedAt: null,
            });
          }
        }
      } catch (err) {
        console.error('Failed to fetch GitHub status:', err);
      } finally {
        if (!ignore) setLoadingGithub(false);
      }
    };

    fetchStatus();

    return () => {
      ignore = true;
    };
  }, []);

  const handleConnectGitHub = () => {
    const userId = user?.id || '';
    const connectUrl = `${API_BASE_URL}/auth/github/login?user_id=${userId}&redirect=true`;
    window.location.href = connectUrl;
  };

  const handleDisconnectGitHub = async () => {
    if (!window.confirm('Are you sure you want to disconnect your GitHub account?')) return;
    setLoadingGithub(true);
    try {
      await disconnectGitHub();
      setGithubState({
        isConnected: false,
        githubUsername: null,
        avatarUrl: null,
        connectedAt: null,
      });
      setToastMessage('GitHub account disconnected successfully.');
    } catch (err) {
      console.error('Failed to disconnect GitHub:', err);
      alert('Failed to disconnect GitHub account.');
    } finally {
      setLoadingGithub(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-khaki-light p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center justify-between shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage('')}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              ×
            </button>
          </div>
        )}

        {/* Dashboard Header / Banner */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold text-olive-wood">Dashboard</h1>
            <p className="text-olive-wood/70 text-sm mt-1">
              Overview of your automated resume updates and ATS performance score
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Quick link to Day 4 ATS Test Harness */}
            <Link
              to="/ats-test"
              className="px-4 py-2.5 rounded-xl bg-sage/10 hover:bg-sage/20 text-sage font-medium border border-sage/30 transition-all shadow-sm flex items-center gap-1.5 text-sm"
            >
              Day 4 ATS Test Harness
            </Link>
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
              className="px-5 py-2.5 rounded-xl bg-sage text-white font-medium shadow transition-all hover:bg-sage-hover flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload New Resume
            </Link>
          </div>
        </div>

        {/* Metric & Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">
              ATS Match Score
            </span>
            <div className="text-3xl font-bold text-sage">{mockAtsData94.score}%</div>
            <p className="text-xs text-emerald-600 font-medium">{mockAtsData94.tier}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">
              GitHub Status
            </span>
            <div className="text-lg font-semibold text-olive-wood">
              {githubState.isConnected ? `@${githubState.githubUsername}` : 'Not Connected'}
            </div>
            <p className="text-xs text-olive-wood/60">
              {githubState.isConnected ? 'OAuth Active' : 'Sync your repositories for auto updates'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-khaki/40 shadow-sm space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-olive-wood/60">
              Last Update
            </span>
            <div className="text-lg font-semibold text-olive-wood">Today</div>
            <p className="text-xs text-olive-wood/60">ATS analysis completed</p>
          </div>
        </div>

        {/* 2. RENDER THE DAY 4 ATS SCORE CARD HERE */}
        <AtsScoreCard
          score={mockAtsData94.score}
          tier={mockAtsData94.tier}
          breakdown={mockAtsData94.breakdown}
          feedback={mockAtsData94.feedback}
          lastAnalyzed={mockAtsData94.lastAnalyzed}
        />

        {/* GitHub Integration Card Component (Day 4 Feature) */}
        <ConnectGitHubCard
          isConnected={githubState.isConnected}
          githubUsername={githubState.githubUsername}
          avatarUrl={githubState.avatarUrl}
          onConnect={handleConnectGitHub}
          onDisconnect={handleDisconnectGitHub}
          onResync={loadGithubStatus}
          loading={loadingGithub}
        />
      </div>
    </div>
  );
}