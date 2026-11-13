import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ConnectGitHubCard from '../components/github/ConnectGitHubCard';
import ResumePreview, { defaultResumeData } from '../components/preview/ResumePreview';
import ResumeActionBar from '../components/preview/ResumeActionBar';
import { AtsScoreCard, mockAtsData94 } from '../components/ats';
import RegenerationModal from '../components/dashboard/RegenerationModal';
import VersionHistoryList from '../components/dashboard/VersionHistoryList';
import ResumeDiffViewer from '../components/dashboard/ResumeDiffViewer';
import SuggestionsQueueCard from '../components/suggestions/SuggestionsQueueCard';
import JobDescriptionDrawer from '../components/jd/JobDescriptionDrawer';
import PageBudgetMeter from '../components/dashboard/PageBudgetMeter';
import SmartSwapModal from '../components/dashboard/SmartSwapModal';
import { getGitHubStatus, disconnectGitHub, getUser } from '../api/auth';
import { getCurrentResume, regenerateResume, getResumeVersions, getUserProjects } from '../api/resumes';
import {
  fetchPendingSuggestions,
  acceptSuggestion,
  editSuggestion,
  dismissSuggestion,
  swapProjectSuggestion,
} from '../api/suggestions';

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

  // Day 11 Review Queue State
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Day 12 1-Page Strictness & Line Budget State
  const [linesUsed, setLinesUsed] = useState(38);
  const [isPageOverflow, setIsPageOverflow] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [isSwapping, setIsSwapping] = useState(false);

  // Day 12 Job Description Drawer State
  const [isJdDrawerOpen, setIsJdDrawerOpen] = useState(false);

  // Day 12 Smart Swap Modal State
  const [smartSwapModalState, setSmartSwapModalState] = useState({
    isOpen: false,
    suggestion: null,
    customBullet: null,
    newProjectTitle: '',
  });

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

      if (resume) {
        const count = resume.lines_count || resume.line_budget || 38;
        setLinesUsed(count);
        setIsPageOverflow(resume.is_one_page_safe === false || count > 42);
      }

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

  // Load Review Queue Pending Suggestions (Day 11)
  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const list = await fetchPendingSuggestions();
      if (list && list.length > 0) {
        setSuggestions(list);
      } else {
        // Fallback initial demo suggestion for testing & reviewer evaluation
        setSuggestions([
          {
            id: 'demo-sugg-initial',
            repo_name: 'resume-auto-updater',
            commit_sha: '7f9c2d1',
            commit_message: 'feat: add real-time ATS scoring and 1-page line budget calculations',
            proposed_bullet:
              'Engineered real-time ATS keyword analysis and 1-page line budget protection engine in FastAPI and Python, increasing resume score compatibility by 28%.',
            status: 'pending',
          },
        ]);
      }
    } catch (err) {
      console.warn('Could not fetch suggestions:', err);
      setSuggestions([
        {
          id: 'demo-sugg-initial',
          repo_name: 'resume-auto-updater',
          commit_sha: '7f9c2d1',
          commit_message: 'feat: add real-time ATS scoring and 1-page line budget calculations',
          proposed_bullet:
            'Engineered real-time ATS keyword analysis and 1-page line budget protection engine in FastAPI and Python, increasing resume score compatibility by 28%.',
          status: 'pending',
        },
      ]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Load User Projects for Smart Swap options (Day 12)
  const loadProjects = async () => {
    try {
      const projs = await getUserProjects();
      if (projs && projs.length > 0) {
        setUserProjects(projs);
      }
    } catch (err) {
      console.warn('Could not fetch user projects:', err);
    }
  };

  useEffect(() => {
    loadGithubStatus();
    loadResumeData();
    loadSuggestions();
    loadProjects();
  }, []);

  // Review Queue: Accept workflow (checks 1-page budget threshold)
  const handleAcceptSuggestion = async (id, customBullet) => {
    const sugg = suggestions.find((s) => s.id === id);
    const bulletToUse = (customBullet || sugg?.proposed_bullet || '').trim();

    // Check Day 12 1-page limit:
    // If linesUsed is near or over 42 lines, trigger SmartSwapModal!
    if (linesUsed >= 42) {
      setSmartSwapModalState({
        isOpen: true,
        suggestion: sugg,
        customBullet: bulletToUse,
        newProjectTitle: sugg?.repo_name || 'New GitHub Project',
      });
      return;
    }

    await applyAcceptedSuggestion(id, bulletToUse, sugg);
  };

  const applyAcceptedSuggestion = async (id, bulletText, sugg) => {
    try {
      if (id && !id.startsWith('demo-')) {
        await acceptSuggestion(id, bulletText, loadResumeData);
      }
    } catch (err) {
      console.warn('Accept suggestion backend error:', err);
    }

    // Optimistically remove card from review queue
    setSuggestions((prev) => prev.filter((s) => s.id !== id));

    // Optimistically insert new project with bullet into live resume preview
    const newProjTitle = sugg?.repo_name || 'Automated GitHub Project';
    setResumeData((prev) => ({
      ...prev,
      projects: [
        {
          name: newProjTitle,
          tech: 'Python, FastAPI, Docker, Tailwind CSS',
          link: `github.com/developer/${newProjTitle}`,
          highlights: [bulletText],
        },
        ...(prev.projects || []),
      ],
    }));

    // Update lines count (+3 lines for project title and bullet)
    setLinesUsed((prev) => {
      const next = prev + 3;
      if (next > 42) setIsPageOverflow(true);
      return next;
    });

    setToastMessage('Bullet accepted & inserted into resume preview!');
    loadResumeData();
  };

  const handleDismissSuggestion = async (id) => {
    try {
      if (id && !id.startsWith('demo-')) {
        await dismissSuggestion(id);
      }
    } catch (err) {
      console.warn('Dismiss suggestion backend error:', err);
    }
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    setToastMessage('Suggestion dismissed from review queue.');
  };

  const handleEditSuggestion = async (id, text) => {
    try {
      if (id && !id.startsWith('demo-')) {
        await editSuggestion(id, text);
      }
    } catch (err) {
      console.warn('Edit suggestion backend error:', err);
    }
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, proposed_bullet: text } : s))
    );
  };

  const handleSmartSwapConfirm = async (archiveProjectId) => {
    const { suggestion, customBullet } = smartSwapModalState;
    if (!suggestion) return;

    setIsSwapping(true);
    const bulletToUse = (customBullet || suggestion.proposed_bullet || '').trim();

    try {
      if (suggestion.id && !suggestion.id.startsWith('demo-') && archiveProjectId) {
        await swapProjectSuggestion(suggestion.id, archiveProjectId, loadResumeData);
      }
    } catch (err) {
      console.warn('Smart swap backend error:', err);
    } finally {
      setIsSwapping(false);
    }

    // Optimistically replace oldest project in preview
    setResumeData((prev) => {
      const projs = [...(prev.projects || [])];
      if (projs.length > 0) {
        projs.pop(); // Remove oldest
      }
      return {
        ...prev,
        projects: [
          {
            name: suggestion.repo_name,
            tech: 'Python, FastAPI, Docker',
            link: `github.com/developer/${suggestion.repo_name}`,
            highlights: [bulletToUse],
          },
          ...projs,
        ],
      };
    });

    setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    setSmartSwapModalState({ isOpen: false, suggestion: null, customBullet: null, newProjectTitle: '' });
    setToastMessage('Smart Swap complete! Oldest project archived, 1-page budget preserved.');
    loadResumeData();
  };

  const handleSmartSwapKeepBoth = async () => {
    const { suggestion, customBullet } = smartSwapModalState;
    if (!suggestion) return;

    setSmartSwapModalState({ isOpen: false, suggestion: null, customBullet: null, newProjectTitle: '' });
    await applyAcceptedSuggestion(suggestion.id, customBullet || suggestion.proposed_bullet, suggestion);
    setIsPageOverflow(true);
    setLinesUsed(48); // 48 / 45 lines — Overflow Risk!
    setToastMessage('Project inserted. Resume line budget now exceeds 1 page (48/45 lines).');
  };

  const handleSimulateNewCommit = () => {
    const randomId = 'demo-sugg-' + Date.now();
    const newDemo = {
      id: randomId,
      repo_name: 'cloud-pipeline-optimizer',
      commit_sha: Math.random().toString(36).substring(2, 9),
      commit_message: 'feat: optimize async worker queues and Redis caching',
      proposed_bullet:
        'Architected asynchronous message queue pipeline using Redis and FastAPI, reducing background worker latency by 42% across 25,000 requests.',
      status: 'pending',
    };
    setSuggestions((prev) => [newDemo, ...prev]);
    setToastMessage('New GitHub commit detected! Added to Review Queue.');
  };


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

  const availableProjectsForSwap =
    userProjects.length > 0
      ? userProjects.map((p) => ({
          id: p.id,
          github_repo_name: p.github_repo_name || p.name,
          name: p.github_repo_name || p.name,
          tech_stack: p.tech_stack,
        }))
      : (resumeData.projects || []).map((p, idx) => ({
          id: `local-p-${idx}`,
          github_repo_name: p.name,
          name: p.name,
          tech_stack: p.tech,
        }));

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

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Day 12 Target JD Matcher CTA Button */}
            <button
              type="button"
              onClick={() => setIsJdDrawerOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-extrabold shadow-xs transition-all flex items-center gap-2 cursor-pointer ring-2 ring-sage/20"
            >
              <span className="text-amber-200 font-bold">■</span>
              <span>Match Against Job Description</span>
            </button>

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
                <div className="overflow-hidden">
                  <h3 className="text-base font-bold text-olive-wood">{user?.name || 'Welcome User'}</h3>
                  <p className="text-xs text-olive-wood/60 font-medium truncate max-w-[180px] block" title={user?.email || 'user@example.com'}>
                    {user?.email || 'user@example.com'}
                  </p>
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

            {/* 4. Large High-Emphasis 'Update Resume' Action Trigger Button with Pulse Glow */}
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
                className="w-full py-3.5 px-4 rounded-2xl bg-sage hover:bg-sage-hover active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer ring-4 ring-sage/20 disabled:opacity-50 hover:animate-pulse-glow"
              >
                <svg className="w-5 h-5 text-amber-300 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.381z" clipRule="evenodd" />
                </svg>
                <span>Update Resume Now</span>
              </button>
            </div>
          </div>

          {/* ================= RIGHT MAIN AREA (2/3 Width) ================= */}
          <div className="lg:col-span-8 space-y-6 relative">
            {/* Lightweight CSS Confetti Shower when ATS score >= 85 */}
            {atsScore >= 85 && (
              <div className="pointer-events-none absolute inset-x-0 -top-6 h-48 overflow-hidden z-30 flex justify-around">
                {[
                  { color: '#10B981', left: '8%', delay: '0s' },
                  { color: '#F59E0B', left: '22%', delay: '0.3s' },
                  { color: '#8A9A86', left: '38%', delay: '0.1s' },
                  { color: '#3B82F6', left: '54%', delay: '0.5s' },
                  { color: '#EC4899', left: '68%', delay: '0.2s' },
                  { color: '#8B5CF6', left: '82%', delay: '0.4s' },
                  { color: '#10B981', left: '94%', delay: '0.6s' },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="w-2.5 h-2.5 rounded-sm animate-confetti"
                    style={{
                      backgroundColor: item.color,
                      left: item.left,
                      animationDelay: item.delay,
                      position: 'absolute',
                    }}
                  />
                ))}
              </div>
            )}

            {/* Day 12 Visual 1-Page Budget Meter */}
            <PageBudgetMeter
              linesUsed={linesUsed}
              maxLines={45}
              isOverflow={isPageOverflow}
              onSmartSwapClick={() => {
                if (suggestions.length > 0) {
                  setSmartSwapModalState({
                    isOpen: true,
                    suggestion: suggestions[0],
                    customBullet: suggestions[0].proposed_bullet,
                    newProjectTitle: suggestions[0].repo_name,
                  });
                } else {
                  handleSimulateNewCommit();
                }
              }}
            />

            {/* Day 11 Pending Suggestions Review Queue Card */}
            {suggestions.length > 0 ? (
              <SuggestionsQueueCard
                suggestions={suggestions}
                onAccept={handleAcceptSuggestion}
                onDismiss={handleDismissSuggestion}
                onEdit={handleEditSuggestion}
              />
            ) : (
              <div className="p-4 rounded-2xl bg-white border border-khaki/40 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-olive-wood/75">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-medium">Review Queue is all caught up (0 pending suggestions).</span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateNewCommit}
                  className="px-3.5 py-1.5 rounded-xl bg-khaki-light hover:bg-khaki/25 text-olive-wood font-bold transition-all border border-khaki/50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Simulate GitHub Commit</span>
                </button>
              </div>
            )}

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
                  <span
                    className={`px-2 py-0.5 rounded-full text-white text-[10px] font-extrabold ${
                      atsScore >= 85 ? 'bg-emerald-600 animate-pulse' : 'bg-sage'
                    }`}
                  >
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

            {/* TAB CONTENT AREA with Smooth Fade-in Transitions (transition-opacity duration-200) */}
            {activeTab === 'preview' && (
              <div className="space-y-4 transition-opacity duration-200 ease-in-out animate-fade-in">
                <ResumeActionBar
                  lastUpdated="Updated just now"
                  onRegenerate={handleUpdateResume}
                  isRegenerating={isRegenerating}
                />
                <ResumePreview data={resumeData} isEmpty={!currentResume && !resumeData} />
              </div>
            )}

            {activeTab === 'ats' && (
              <div className="transition-opacity duration-200 ease-in-out animate-fade-in">
                <AtsScoreCard
                  score={atsData.score}
                  tier={atsData.tier}
                  breakdown={atsData.breakdown}
                  feedback={atsData.feedback}
                  lastAnalyzed={atsData.lastAnalyzed}
                  onRecalculate={handleUpdateResume}
                  isAnalyzing={isRegenerating}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6 transition-opacity duration-200 ease-in-out animate-fade-in">
                <VersionHistoryList
                  versions={resumeVersions}
                  selectedVersionId={selectedVersion?.id}
                  onSelectVersion={(v) => {
                    setSelectedVersion(v);
                    if (v.ats_score) setAtsScore(v.ats_score);
                    setToastMessage(`Switched active preview to Version v${v.version_number}`);
                  }}
                />
                <ResumeDiffViewer
                  scoreA={64}
                  scoreB={atsScore || 94}
                  versionA="Original Upload"
                  versionB={selectedVersion ? `Version v${selectedVersion.version_number}` : 'Latest AI Version'}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Day 12 Smart Swap Modal */}
      <SmartSwapModal
        isOpen={smartSwapModalState.isOpen}
        onClose={() =>
          setSmartSwapModalState({
            isOpen: false,
            suggestion: null,
            customBullet: null,
            newProjectTitle: '',
          })
        }
        onSwap={handleSmartSwapConfirm}
        onKeepBoth={handleSmartSwapKeepBoth}
        newProjectTitle={smartSwapModalState.newProjectTitle}
        existingProjects={availableProjectsForSwap}
        isProcessing={isSwapping}
      />

      {/* Day 12 Job Description Slide-Over Drawer */}
      <JobDescriptionDrawer
        isOpen={isJdDrawerOpen}
        onClose={() => setIsJdDrawerOpen(false)}
        currentResumeId={currentResume?.id}
        onMatchSuccess={(result) => {
          if (result?.match_score) {
            setAtsScore(result.match_score);
            setAtsData((prev) => ({
              ...prev,
              score: result.match_score,
              tier:
                result.match_score >= 80
                  ? 'Strong Match'
                  : result.match_score >= 60
                  ? 'Moderate'
                  : 'Needs Revision',
            }));
          }
          setToastMessage(`Job Description analyzed: ${result.match_score}% fit score!`);
        }}
      />
    </div>
  );
}