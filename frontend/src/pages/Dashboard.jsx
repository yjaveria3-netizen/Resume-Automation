import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectGitHubCard from '../components/github/ConnectGitHubCard';
import { getGitHubStatus, disconnectGitHub, getUser } from '../api/auth';

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
          <div className="flex gap-3">
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
            <div className="text-3xl font-bold text-sage">-- %</div>
            <p className="text-xs text-olive-wood/60">Upload a resume to analyze compatibility</p>
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
            <div className="text-lg font-semibold text-olive-wood">Never</div>
            <p className="text-xs text-olive-wood/60">No automated update events triggered yet</p>
          </div>
        </div>

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

        {/* Empty State Card */}
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
                Upload your master .docx resume to unlock automated GitHub syncing and ATS optimization.
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