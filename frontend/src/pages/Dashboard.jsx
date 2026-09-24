import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectGitHubCard from '../components/github/ConnectGitHubCard';
import ResumePreview, { defaultResumeData } from '../components/preview/ResumePreview';
import ResumeActionBar from '../components/preview/ResumeActionBar';
import { AtsScoreCard, mockAtsData94 } from '../components/ats';
import RegenerationModal from '../components/dashboard/RegenerationModal';
import VersionHistoryList from '../components/dashboard/VersionHistoryList';
import { getGitHubStatus, disconnectGitHub, getUser } from '../api/auth';
import { getCurrentResume, regenerateResume, getResumeVersions } from '../api/resumes';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function Dashboard() {
  const location = useLocation();
  const user = getUser();

  // Active Tab state: 'preview' | 'ats' | 'history'
  const [activeTab, setActiveTab] = useState('preview');

  // GitHub integration state
  const [githubState, setGithubState] = useState({
    isConnected: false,
    githubUsername: null,
    avatarUrl: null,
    connectedAt: null,
  });
  const [loadingGithub, setLoadingGithub] = useState(false);

  // Resume metadata state
  const [currentResume, setCurrentResume] = useState(null);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // Resume Content & ATS State
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [atsScore, setAtsScore] = useState(94);
  const [atsData, setAtsData] = useState(mockAtsData94);

  // Regeneration Modal State
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [regenerationFinished, setRegenerationFinished] = useState(false);
  const [regenerationError, setRegenerationError] = useState(null);
  const [regenerationResult, setRegenerationResult] = useState(null);

  // Toast notification message
  const [toastMessage, setToastMessage] = useState(() => location.state?.toast || '');

  useEffect(() => {
    if (toastMessage) {
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setToastMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Fetch GitHub Status
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

  // Fetch Current Resume & Version History
  const loadResumeData = async () => {
    try {
      const resume = await getCurrentResume();
      setCurrentResume(resume);

      if (resume && resume.id) {
        const versions = await getResumeVersions(resume.id);
        setResumeVersions(versions);
        if (versions && versions.length > 0) {
          const latest = versions[0];
          setSelectedVersion(latest);
          if (latest.ats_score) {
            setAtsScore(latest.ats_score);
            setAtsData((prev) => ({
              ...prev,
              score: latest.ats_score,
              tier:
                latest.ats_score >= 80
                  ? 'Strong Match'
                  : latest.ats_score >= 60
                  ? 'Moderate'
                  : 'Needs Revision',
            }));
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch current resume metadata:', err);
    }
  };

  useEffect(() => {
    loadGithubStatus();
    loadResumeData();
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

  // Trigger Full AI Regeneration Pipeline
  const handleUpdateResume = async () => {
    setIsRegenerating(true);
    setRegenerationFinished(false);
    setRegenerationError(null);
    setRegenerationResult(null);

    try {
      const result = await regenerateResume();
      setRegenerationResult(result);

      if (result && result.bullets && result.bullets.length > 0) {
        setResumeData((prev) => ({
          ...prev,
          projects: [
            {
              name: 'GitHub Automated Projects & Skills Impact',
              tech: 'Python, FastAPI, Gemini AI, Docker',
              link: `github.com/${githubState.githubUsername || 'user'}`,
              highlights: result.bullets,
            },
            ...(prev.projects || []),
          ],
        }));
      }

      if (result && result.ats_score) {
        setAtsScore(result.ats_score);
        setAtsData((prev) => ({
          ...prev,
          score: result.ats_score,
          tier:
            result.ats_score >= 80
              ? 'Strong Match'
              : result.ats_score >= 60
              ? 'Moderate'
              : 'Needs Revision',
        }));
      }

      setRegenerationFinished(true);

      if (currentResume && currentResume.id) {
        const updatedVersions = await getResumeVersions(currentResume.id);
        setResumeVersions(updatedVersions);
      }
    } catch (err) {
      console.error('Regeneration error:', err);
      setRegenerationError(err.message || 'Pipeline execution failed. Make sure GitHub is connected.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-khaki-light p-4 sm:p-6 md:p-8">
      {/* Regeneration Progress Modal */}
      <RegenerationModal
        isOpen={isRegenerating}
        isFinished={regenerationFinished}
        resultData={regenerationResult}
        error={regenerationError}
        onClose={() => {
          setIsRegenerating(false);
          if (regenerationFinished) {
            setToastMessage('Resume successfully updated with latest GitHub bullets!');
          }
        }}
        onRetry={handleUpdateResume}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="p-4 rounded-2xl bg-sage/15 border border-sage/30 text-olive-wood text-xs font-semibold flex items-center justify-between shadow-xs animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-sage text-white flex items-center justify-center text-[10px] font-bold">
                ✓
              </span>
              <span>{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage('')}
              className="text-olive-wood/60 hover:text-olive-wood font-bold cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        {/* Dashboard Header Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-khaki/40 shadow-xs">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-olive-wood tracking-tight">
              User Control Center
            </h1>
            <p className="text-olive-wood/70 text-xs sm:text-sm mt-0.5 font-medium">
              Automated GitHub Resume Updater & ATS Screening Engine
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/upload"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-khaki-light text-olive-wood border border-khaki/50 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload New Resume
            </Link>
          </div>
        </div>

        {/* Desktop Split-Pane Layout (1/3 Sidebar, 2/3 Main Area) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ================= LEFT SIDEBAR (1/3 Width) ================= */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. User Welcome Card */}
            <div className="bg-white p-5 rounded-3xl border border-khaki/40 shadow-xs space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-sage/20 text-sage flex items-center justify-center font-extrabold text-lg border border-sage/30 shadow-xs">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-bold text-olive-wood">{user?.name || 'Welcome User'}</h3>
                  <p className="text-xs text-olive-wood/60 font-medium">{user?.email || 'user@example.com'}</p>
                </div>
              </div>
              <div className="pt-2.5 border-t border-khaki/20 flex items-center justify-between text-xs">
                <span className="text-olive-wood/60 font-medium">Account Status:</span>
                <span className="font-bold text-sage-hover bg-sage/15 px-2.5 py-0.5 rounded-full border border-sage/30 text-[11px]">
                  Active Member
                </span>
              </div>
            </div>

            {/* 2. Connected GitHub Status Card */}
            <ConnectGitHubCard
              isConnected={githubState.isConnected}
              githubUsername={githubState.githubUsername}
              avatarUrl={githubState.avatarUrl}
              onConnect={handleConnectGitHub}
              onDisconnect={handleDisconnectGitHub}
              onResync={loadGithubStatus}
              loading={loadingGithub}
            />

            {/* 3. Active Resume Metadata Card */}
            <div className="bg-white p-5 rounded-3xl border border-khaki/40 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-olive-wood/60">
                  Active Base Resume
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sage/15 text-sage border border-sage/30">
                  .DOCX Master
                </span>
              </div>

              {currentResume ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-khaki-light/50 rounded-2xl border border-khaki/30">
                    <div className="p-2.5 bg-sage/15 text-sage rounded-xl">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-olive-wood truncate">
                        {currentResume.original_filename || 'Uploaded_Resume.docx'}
                      </p>
                      <p className="text-[11px] text-olive-wood/60 font-medium">
                        Uploaded: {formatDate(currentResume.uploaded_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-khaki-light/50 rounded-2xl text-center space-y-1 border border-khaki/30">
                  <p className="text-xs font-bold text-olive-wood">No Resume File Uploaded Yet</p>
                  <p className="text-[11px] text-olive-wood/60">
                    Upload your .docx resume to enable AI bullet generation.
                  </p>
                  <Link
                    to="/upload"
                    className="inline-block mt-1 text-xs text-sage font-extrabold hover:underline"
                  >
                    Upload Now →
                  </Link>
                </div>
              )}
            </div>

            {/* 4. Large High-Emphasis 'Update Resume' Action Trigger Button */}
            <div className="bg-gradient-to-br from-sage/10 via-white to-khaki-light/40 p-5 rounded-3xl border-2 border-sage/40 shadow-sm space-y-3.5 relative overflow-hidden">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sage animate-ping" />
                <span className="text-xs font-bold uppercase tracking-wider text-sage-hover">
                  AI Continuous Sync
                </span>
              </div>
              <div>
                <h4 className="text-base font-extrabold text-olive-wood">
                  Trigger Resume Regeneration
                </h4>
                <p className="text-xs text-olive-wood/75 leading-relaxed mt-0.5">
                  Fetches your top GitHub commits, synthesizes bullet points with Gemini AI, and updates ATS compatibility score.
                </p>
              </div>

              <button
                type="button"
                onClick={handleUpdateResume}
                disabled={isRegenerating}
                className="w-full py-3.5 px-4 rounded-2xl bg-sage hover:bg-sage-hover active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-4 ring-sage/20 disabled:opacity-50"
              >
                <svg className="w-5 h-5 text-amber-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                </svg>
                <span>Update Resume Now</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT MAIN AREA (2/3 Width) ================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Header Tabs Navigation Bar */}
            <div className="bg-white p-2 rounded-3xl border border-khaki/40 shadow-xs flex items-center justify-between gap-2 overflow-x-auto">
              <div className="flex items-center gap-1.5 w-full">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`flex-1 min-w-[110px] py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'preview'
                      ? 'bg-olive-wood text-white shadow-xs'
                      : 'text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Live Preview</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ats')}
                  className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'ats'
                      ? 'bg-olive-wood text-white shadow-xs'
                      : 'text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>ATS Score Breakdown</span>
                  <span className="px-2 py-0.5 rounded-full bg-sage text-white text-[10px] font-extrabold">
                    {atsScore}%
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    activeTab === 'history'
                      ? 'bg-olive-wood text-white shadow-xs'
                      : 'text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Version History</span>
                  {resumeVersions.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-khaki text-olive-wood text-[10px] font-extrabold">
                      {resumeVersions.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* TAB CONTENT AREA */}
            {activeTab === 'preview' && (
              <div className="space-y-4">
                <ResumeActionBar
                  lastUpdated="Updated just now"
                  onRegenerate={handleUpdateResume}
                  isRegenerating={isRegenerating}
                />
                <ResumePreview data={resumeData} isEmpty={!currentResume && !resumeData} />
              </div>
            )}

            {activeTab === 'ats' && (
              <AtsScoreCard
                score={atsData.score}
                tier={atsData.tier}
                breakdown={atsData.breakdown}
                feedback={atsData.feedback}
                lastAnalyzed={atsData.lastAnalyzed}
                onRecalculate={handleUpdateResume}
                isAnalyzing={isRegenerating}
              />
            )}

            {activeTab === 'history' && (
              <VersionHistoryList
                versions={resumeVersions}
                selectedVersionId={selectedVersion?.id}
                onSelectVersion={(v) => {
                  setSelectedVersion(v);
                  if (v.ats_score) setAtsScore(v.ats_score);
                  setToastMessage(`Switched active preview to Version v${v.version_number}`);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}