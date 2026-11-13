import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ExecutiveLayout from '../components/layout/ExecutiveLayout';
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
import { API_BASE_URL } from '../api/config';

export default function Dashboard() {
  const location = useLocation();
  const user = getUser();

  // Active Tab state: 'preview' | 'trend' | 'ats' | 'history'
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
  const [resumeData, setResumeData] = useState(null);
  const [isSamplePreview, setIsSamplePreview] = useState(false);
  const [atsScore, setAtsScore] = useState(94);
  const [atsData, setAtsData] = useState(mockAtsData94);

  // Review Queue State
  const [suggestions, setSuggestions] = useState([]);
  const [_loadingSuggestions, setLoadingSuggestions] = useState(false);

  // 1-Page Strictness & Line Budget State
  const [linesUsed, setLinesUsed] = useState(38);
  const [isPageOverflow, setIsPageOverflow] = useState(false);
  const [userProjects, setUserProjects] = useState([]);
  const [isSwapping, setIsSwapping] = useState(false);

  // Job Description Drawer State
  const [isJdDrawerOpen, setIsJdDrawerOpen] = useState(false);

  // Smart Swap Modal State
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
        setIsSamplePreview(false);
        const count = resume.lines_count || resume.line_budget || 38;
        setLinesUsed(count);
        setIsPageOverflow(resume.is_one_page_safe === false || count > 42);

        const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Engineer');
        const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

        setResumeData({
          name: formattedName,
          title: 'Full-Stack Software Engineer',
          contact: {
            email: user?.email || 'developer@example.com',
            phone: '+1 (555) 019-2834',
            location: 'Remote / US',
            github: githubState.githubUsername ? `github.com/${githubState.githubUsername}` : 'github.com/developer',
            website: 'portfolio.dev',
          },
          summary:
            'Impact-focused Full-Stack Engineer designing high-performance distributed web architectures, high-throughput APIs, and AI-assisted automation pipelines.',
          projects: [
            {
              name: 'Resume Auto-Updater & ATS Optimizer',
              tech: 'React, Tailwind CSS, FastAPI, PostgreSQL, Gemini AI',
              link: `github.com/${githubState.githubUsername || 'developer'}/resume-auto-updater`,
              highlights: [
                'Engineered continuous GitHub repository sync that automatically parses commits, generates verified skill impact bullets, and updates resume builds.',
                'Maintained strict 1-page line budget protection and ATS keyword matching score >90%.',
              ],
            },
          ],
          skills: {
            languages: ['Python', 'TypeScript', 'JavaScript (ESNext)', 'SQL', 'Go'],
            frameworks: ['FastAPI', 'React', 'Tailwind CSS', 'Docker', 'PostgreSQL'],
            tools: ['Git', 'GitHub Actions', 'Gemini AI', 'Redis', 'Nginx'],
          },
        });
      } else {
        setResumeData(null);
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

  const handleLoadSampleTemplate = () => {
    const displayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Engineer');
    const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
    setIsSamplePreview(true);
    setResumeData({
      name: formattedName,
      title: 'Senior Full-Stack Engineer & AI Integrator',
      contact: {
        email: user?.email || 'developer@example.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        github: githubState.githubUsername ? `github.com/${githubState.githubUsername}` : 'github.com/developer',
        website: 'portfolio.dev',
      },
      summary:
        'Results-driven Full-Stack Engineer with 5+ years of experience designing scalable distributed web architectures, high-performance APIs, and AI-assisted automation pipelines.',
      experience: [
        {
          role: 'Senior Software Engineer',
          company: 'Cloud Scale Systems',
          location: 'San Francisco, CA',
          period: '2023 – Present',
          highlights: [
            'Architected automated document ingestion pipelines scaling to 150k+ transactions with 99.98% uptime.',
            'Refactored core REST and GraphQL endpoints in Node.js and FastAPI, decreasing P99 latency from 450ms to 95ms.',
          ],
        },
      ],
      projects: [
        {
          name: 'Distributed Task Orchestrator',
          tech: 'Go, Docker, Redis Streams, gRPC',
          link: 'github.com/developer/task-mesh',
          highlights: [
            'Developed low-latency worker queue processing 20k background jobs per second with fault-tolerant dead-letter handling.',
          ],
        },
      ],
      skills: {
        languages: ['JavaScript (ESNext)', 'TypeScript', 'Python', 'Go', 'SQL'],
        frameworks: ['React', 'Next.js', 'FastAPI', 'Tailwind CSS'],
        tools: ['PostgreSQL', 'Redis', 'Docker', 'Git/GitHub Actions'],
      },
    });
    setToastMessage('Viewing sample template. Upload your own .docx resume to personalize!');
  };

  // Load Review Queue Pending Suggestions
  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const list = await fetchPendingSuggestions();
      if (list && list.length > 0) {
        setSuggestions(list);
      } else {
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

  // Load User Projects for Smart Swap options
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

  // Global Escape key listener to close drawer and modal
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isJdDrawerOpen) {
          setIsJdDrawerOpen(false);
        }
        if (smartSwapModalState.isOpen) {
          setSmartSwapModalState({
            isOpen: false,
            suggestion: null,
            customBullet: null,
            newProjectTitle: '',
          });
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isJdDrawerOpen, smartSwapModalState.isOpen]);

  // Connect GitHub Trigger
  const handleConnectGitHub = () => {
    const returnUrl = encodeURIComponent(window.location.origin + '/dashboard');
    window.location.href = `${API_BASE_URL}/auth/github?redirect_uri=${returnUrl}`;
  };

  // Disconnect GitHub
  const handleDisconnectGitHub = async () => {
    if (!window.confirm('Are you sure you want to disconnect GitHub? Auto-sync will be disabled.')) {
      return;
    }
    try {
      await disconnectGitHub();
      setGithubState({
        isConnected: false,
        githubUsername: null,
        avatarUrl: null,
        connectedAt: null,
      });
      setToastMessage('GitHub account disconnected.');
    } catch (err) {
      console.error('Failed to disconnect GitHub:', err);
      setToastMessage('Failed to disconnect GitHub account.');
    }
  };

  // Accept a Suggestion from Review Queue
  const handleAcceptSuggestion = async (suggestionId, modifiedBullet = null) => {
    const suggestion = suggestions.find((s) => s.id === suggestionId);
    const bulletToUse = modifiedBullet || suggestion?.proposed_bullet;

    if (isPageOverflow || linesUsed >= 42) {
      setSmartSwapModalState({
        isOpen: true,
        suggestion: suggestion,
        customBullet: bulletToUse,
        newProjectTitle: suggestion?.repo_name || 'New Repository Project',
      });
      return;
    }

    try {
      if (!suggestionId.startsWith('demo-')) {
        await acceptSuggestion(suggestionId, bulletToUse);
      }

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      setLinesUsed((prev) => Math.min(45, prev + 2));

      setResumeData((prev) => {
        if (!prev) return prev;
        const currentProjects = prev.projects || [];
        const updatedProjects = [
          {
            name: `${suggestion?.repo_name || 'Feature Sync'} (Recent GitHub Update)`,
            tech: 'Python, FastAPI, Docker, Gemini AI',
            link: `github.com/${githubState.githubUsername || 'developer'}/${suggestion?.repo_name || 'project'}`,
            highlights: [bulletToUse],
          },
          ...currentProjects,
        ];
        return {
          ...prev,
          projects: updatedProjects,
        };
      });

      setToastMessage('Accepted! Highlight added to your active resume preview.');
    } catch (err) {
      console.error('Failed to accept suggestion:', err);
      setToastMessage(err.message || 'Failed to accept suggestion.');
    }
  };

  // Smart Swap Confirm
  const handleSmartSwapConfirm = async (oldProjectId) => {
    setIsSwapping(true);
    const { suggestion, customBullet } = smartSwapModalState;

    try {
      if (suggestion && !suggestion.id.startsWith('demo-')) {
        await swapProjectSuggestion(suggestion.id, oldProjectId, customBullet);
      }

      setResumeData((prev) => {
        if (!prev) return prev;
        const filtered = (prev.projects || []).filter(
          (p) => p.name !== oldProjectId && p.id !== oldProjectId
        );
        return {
          ...prev,
          projects: [
            {
              name: `${suggestion?.repo_name || 'Updated Project'} (Smart Swapped)`,
              tech: 'Python, FastAPI, Gemini AI, Docker',
              link: `github.com/${githubState.githubUsername || 'developer'}/${suggestion?.repo_name || 'repo'}`,
              highlights: [customBullet || suggestion?.proposed_bullet],
            },
            ...filtered,
          ],
        };
      });

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      setSmartSwapModalState({
        isOpen: false,
        suggestion: null,
        customBullet: null,
        newProjectTitle: '',
      });
      setToastMessage('Smart Swap applied! 1-Page budget preserved.');
    } catch (err) {
      console.error('Failed smart swap:', err);
      setToastMessage(err.message || 'Failed to swap project.');
    } finally {
      setIsSwapping(false);
    }
  };

  // Smart Swap: Keep Both
  const handleSmartSwapKeepBoth = async () => {
    setIsSwapping(true);
    const { suggestion, customBullet } = smartSwapModalState;

    try {
      if (suggestion && !suggestion.id.startsWith('demo-')) {
        await acceptSuggestion(suggestion.id, customBullet);
      }

      setResumeData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          projects: [
            {
              name: `${suggestion?.repo_name || 'Feature'} (GitHub Sync)`,
              tech: 'Python, FastAPI, Gemini AI',
              highlights: [customBullet || suggestion?.proposed_bullet],
            },
            ...(prev.projects || []),
          ],
        };
      });

      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
      setLinesUsed((prev) => prev + 3);
      setIsPageOverflow(true);

      setSmartSwapModalState({
        isOpen: false,
        suggestion: null,
        customBullet: null,
        newProjectTitle: '',
      });
      setToastMessage('Accepted! Warning: Content now slightly exceeds strict 1-page budget.');
    } catch (err) {
      console.error('Failed accept:', err);
    } finally {
      setIsSwapping(false);
    }
  };

  // Dismiss a Suggestion
  const handleDismissSuggestion = async (suggestionId) => {
    try {
      if (!suggestionId.startsWith('demo-')) {
        await dismissSuggestion(suggestionId);
      }
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestionId));
      setToastMessage('Suggestion dismissed from queue.');
    } catch (err) {
      console.error('Failed to dismiss suggestion:', err);
    }
  };

  // Edit inline suggestion
  const handleEditSuggestion = async (suggestionId, newText) => {
    try {
      if (!suggestionId.startsWith('demo-')) {
        await editSuggestion(suggestionId, newText);
      }
      setSuggestions((prev) =>
        prev.map((s) => (s.id === suggestionId ? { ...s, proposed_bullet: newText } : s))
      );
    } catch (err) {
      console.error('Failed to update suggestion inline:', err);
    }
  };

  // Test commit simulation
  const handleSimulateNewCommit = () => {
    const sampleCommits = [
      {
        id: `mock-${Date.now()}`,
        repo_name: 'cloud-pipeline-optimizer',
        commit_sha: 'c3d9a1f',
        commit_message: 'perf: optimize async task batching reducing latency from 450ms to 95ms',
        proposed_bullet:
          'Refactored async queue dispatching in Python and FastAPI, reducing P99 latency by 78% under 20k req/min peak load.',
        status: 'pending',
      },
      {
        id: `mock-${Date.now() + 1}`,
        repo_name: 'vector-search-engine',
        commit_sha: 'e5b204a',
        commit_message: 'feat: implement in-memory HNSW index for sub-millisecond similarity lookups',
        proposed_bullet:
          'Built concurrent in-memory vector index in Go and gRPC, achieving sub-10ms nearest-neighbor similarity search across 500k high-dimensional embeddings.',
        status: 'pending',
      },
    ];

    const pick = sampleCommits[Math.floor(Math.random() * sampleCommits.length)];
    setSuggestions((prev) => [pick, ...prev]);
    setToastMessage(`Simulated new commit from ${pick.repo_name}! Review pending bullet.`);
  };

  // Trigger Resume Regeneration
  const handleUpdateResume = async () => {
    if (!currentResume && !isSamplePreview) {
      if (resumeData) {
        setIsRegenerating(true);
        setRegenerationFinished(false);
        setRegenerationError(null);
        setTimeout(() => {
          setIsRegenerating(false);
          const sampleBullets = [
            'Architected asynchronous background task dispatcher in FastAPI and Redis, handling 40,000 tasks/min with zero dropped packets.',
            'Integrated OpenTelemetry structured distributed tracing across microservices, decreasing root-cause MTTR by 46%.',
          ];
          setResumeData((prev) => ({
            ...prev,
            projects: [
              {
                name: 'Cloud-Scale Pipeline Optimizer (AI Sync)',
                tech: 'Python, FastAPI, Redis, Docker, Tailwind CSS',
                link: `github.com/${githubState.githubUsername || 'developer'}/cloud-pipeline`,
                highlights: sampleBullets,
              },
              ...(prev?.projects || []),
            ],
          }));
          setRegenerationResult({
            bullets: sampleBullets,
            ats_score: 96,
          });
          setAtsScore(96);
          setAtsData((prev) => ({
            ...prev,
            score: 96,
            tier: 'Strong Match',
          }));
          setRegenerationFinished(true);
          setToastMessage('Sample resume refreshed with simulated AI GitHub commits!');
        }, 2800);
        return;
      }

      setToastMessage('Please upload a .docx resume first before running AI continuous sync.');
      return;
    }

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
            ...(prev?.projects || []),
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

  const availableProjectsForSwap =
    userProjects.length > 0
      ? userProjects.map((p) => ({
          id: p.id,
          github_repo_name: p.github_repo_name || p.name,
          name: p.github_repo_name || p.name,
          tech_stack: p.tech_stack,
        }))
      : (resumeData?.projects || defaultResumeData?.projects || []).map((p, idx) => ({
          id: `local-p-${idx}`,
          github_repo_name: p.name,
          name: p.name,
          tech_stack: p.tech,
        }));

  const userGreetingName = user?.name || (user?.email ? user.email.split('@')[0] : 'Engineer');
  const formattedGreeting = userGreetingName.charAt(0).toUpperCase() + userGreetingName.slice(1);

  // Top header actions slot: ONE primary action only
  const headerActions = (
    <div className="flex items-center gap-2">
      <Link
        to="/upload"
        className="btn-primary h-9 text-xs"
      >
        <span>Upload Master</span>
      </Link>
    </div>
  );

  return (
    <ExecutiveLayout
      breadcrumbs={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Overview' }]}
      actions={headerActions}
    >
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

      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-3.5 rounded-[12px] bg-[#12151C] border border-white/[0.08] text-[#ECEEF2] text-xs font-medium flex items-center justify-between shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-4 h-4 rounded-full bg-[#34D399] text-[#0B0D12] flex items-center justify-center text-[10px] font-bold">
              ✓
            </span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-[#6B7280] hover:text-[#ECEEF2] font-semibold cursor-pointer text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-semibold tracking-tight text-[#ECEEF2]">
            Welcome back, <span className="text-[#F97316]">{formattedGreeting}</span>
          </h1>
          <p className="text-sm text-[#9AA1AE] mt-0.5">
            14 verified commits tracked. ATS compatibility at {atsScore}%.
          </p>
        </div>

        {/* Date Filter & Sync Commits as secondary actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="inline-flex items-center h-10 px-3 rounded-[10px] bg-transparent border border-white/[0.12] text-xs font-medium text-[#9AA1AE]">
            <span>Range: Last 30 Days</span>
          </div>

          <button
            type="button"
            onClick={handleUpdateResume}
            disabled={isRegenerating}
            className="btn-secondary text-xs h-10"
          >
            <span className={isRegenerating ? 'animate-spin' : ''}>⚡</span>
            <span>{isRegenerating ? 'Syncing...' : 'Sync Commits'}</span>
          </button>
        </div>
      </div>

      {/* ================= 4 CLEAN KPI CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: ATS Readiness Score */}
        <div className="bg-[#12151C] rounded-[16px] border border-white/[0.06] p-6 space-y-3.5 hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.04em] text-[#6B7280]">
              ATS Readiness
            </span>
            <span className="text-xs text-[#34D399] font-medium">+12.4% vs baseline</span>
          </div>
          <div className="text-[30px] font-semibold text-[#ECEEF2] tracking-tight tabular-nums">
            {atsScore} / 100
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
            <div
              className="bg-[#F97316] h-full rounded-full transition-all duration-500"
              style={{ width: `${atsScore}%` }}
            />
          </div>
        </div>

        {/* Card 2: Commits Analyzed */}
        <div className="bg-[#12151C] rounded-[16px] border border-white/[0.06] p-6 space-y-3.5 hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.04em] text-[#6B7280]">
              Commits Analyzed
            </span>
            <span className="text-xs text-[#34D399] font-medium">100% Synced</span>
          </div>
          <div className="text-[30px] font-semibold text-[#ECEEF2] tracking-tight tabular-nums">
            14 Commits
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
            <div className="bg-[#34D399] h-full rounded-full w-full" />
          </div>
        </div>

        {/* Card 3: Pending Suggestions */}
        <div className="bg-[#12151C] rounded-[16px] border border-white/[0.06] p-6 space-y-3.5 hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.04em] text-[#6B7280]">
              Pending Suggestions
            </span>
            <span className="text-xs text-[#9AA1AE] font-medium">
              {suggestions.length > 0 ? 'Requires review' : 'Up to date'}
            </span>
          </div>
          <div className="text-[30px] font-semibold text-[#ECEEF2] tracking-tight tabular-nums">
            {suggestions.length} In Queue
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full ${suggestions.length > 0 ? 'bg-[#F97316]' : 'bg-white/[0.12]'}`}
              style={{ width: suggestions.length > 0 ? '50%' : '100%' }}
            />
          </div>
        </div>

        {/* Card 4: Document Budget */}
        <div className="bg-[#12151C] rounded-[16px] border border-white/[0.06] p-6 space-y-3.5 hover:border-white/[0.12] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.04em] text-[#6B7280]">
              Document Budget
            </span>
            <span className="text-xs text-[#34D399] font-medium">Strictly 1 Page</span>
          </div>
          <div className="text-[30px] font-semibold text-[#ECEEF2] tracking-tight tabular-nums">
            {linesUsed} / 42 Lines
          </div>
          <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isPageOverflow ? 'bg-[#F87171]' : 'bg-[#34D399]'
              }`}
              style={{ width: `${Math.min(100, (linesUsed / 45) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================= MAIN SPLIT-PANE GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= LEFT 2/3 COLUMN ================= */}
        <div className="lg:col-span-8 space-y-8">
          {/* Main Interactive Workspace Card */}
          <div className="bg-[#12151C] rounded-[16px] border border-white/[0.06] overflow-hidden">
            {/* Underline Tabs Header */}
            <div className="px-6 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`py-3.5 transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'preview'
                      ? 'border-[#F97316] text-[#ECEEF2] font-medium'
                      : 'border-transparent text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  Live Document
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('trend')}
                  className={`py-3.5 transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'trend'
                      ? 'border-[#F97316] text-[#ECEEF2] font-medium'
                      : 'border-transparent text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  Analytics & Trend
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('history')}
                  className={`py-3.5 transition-colors border-b-2 cursor-pointer ${
                    activeTab === 'history'
                      ? 'border-[#F97316] text-[#ECEEF2] font-medium'
                      : 'border-transparent text-[#9AA1AE] hover:text-[#ECEEF2]'
                  }`}
                >
                  Version History
                </button>
              </div>
            </div>

            {/* TAB 1: Live Printable Document Workspace */}
            {activeTab === 'preview' && (
              <div className="p-6 space-y-4">
                {isSamplePreview && (
                  <div className="p-3 rounded-[10px] bg-white/[0.04] border border-white/[0.08] text-[#9AA1AE] text-xs flex items-center justify-between">
                    <span>Viewing sample candidate template. Upload your own .docx resume to activate continuous sync.</span>
                    <Link to="/upload" className="font-medium text-[#ECEEF2] hover:text-[#F97316] ml-2">
                      Upload .docx →
                    </Link>
                  </div>
                )}

                <ResumeActionBar
                  lastUpdated="Generated just now"
                  onRegenerate={handleUpdateResume}
                  isGenerating={isRegenerating}
                />

                <ResumePreview
                  data={resumeData}
                  isEmpty={!currentResume && !resumeData}
                  onLoadSampleClick={handleLoadSampleTemplate}
                />
              </div>
            )}

            {/* TAB 2: Analytics & Trend Curve */}
            {activeTab === 'trend' && (
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-[#ECEEF2]">
                      ATS Score Progression
                    </h3>
                    <p className="text-xs text-[#9AA1AE] mt-0.5">
                      30-day performance tracking against enterprise ATS benchmarks.
                    </p>
                  </div>
                  <span className="text-xs text-[#34D399] font-medium">
                    +18.7% this month
                  </span>
                </div>

                <div className="relative h-60 w-full bg-[#171B24] rounded-[12px] border border-white/[0.06] p-4 flex flex-col justify-between overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F97316" stopOpacity="0.10" />
                        <stop offset="100%" stopColor="#F97316" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                    <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

                    <polygon
                      fill="url(#curveGradient)"
                      points="0,170 80,150 160,135 240,140 320,110 400,95 480,75 560,45 600,40 600,200 0,200"
                    />

                    <polyline
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points="0,170 80,150 160,135 240,140 320,110 400,95 480,75 560,45 600,40"
                    />

                    <circle cx="560" cy="45" r="4" fill="#ECEEF2" stroke="#F97316" strokeWidth="2" />
                  </svg>

                  <div className="flex justify-between text-[11px] font-mono text-[#6B7280] pt-2 border-t border-white/[0.04]">
                    <span>Oct 15</span>
                    <span>Oct 22</span>
                    <span>Oct 29</span>
                    <span>Nov 05</span>
                    <span>Nov 12 ({atsScore}%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-[10px] bg-[#171B24] border border-white/[0.06]">
                    <span className="text-[11px] uppercase tracking-[0.04em] text-[#6B7280]">Action Verbs</span>
                    <p className="text-base font-semibold text-[#ECEEF2] mt-0.5">95%</p>
                    <span className="text-xs text-[#34D399]">18 power verbs</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#171B24] border border-white/[0.06]">
                    <span className="text-[11px] uppercase tracking-[0.04em] text-[#6B7280]">Quantified Data</span>
                    <p className="text-base font-semibold text-[#ECEEF2] mt-0.5">92%</p>
                    <span className="text-xs text-[#34D399]">12 metrics tracked</span>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#171B24] border border-white/[0.06]">
                    <span className="text-[11px] uppercase tracking-[0.04em] text-[#6B7280]">Keyword Overlap</span>
                    <p className="text-base font-semibold text-[#ECEEF2] mt-0.5">96%</p>
                    <span className="text-xs text-[#34D399]">24 of 25 matched</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: Version History */}
            {activeTab === 'history' && (
              <div className="p-6 space-y-6">
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

          {/* Recent Suggestions & Commits Queue Card */}
          <SuggestionsQueueCard
            suggestions={suggestions}
            onAccept={handleAcceptSuggestion}
            onDismiss={handleDismissSuggestion}
            onEdit={handleEditSuggestion}
          />
        </div>

        {/* ================= RIGHT 1/3 SIDEBAR ================= */}
        <div className="lg:col-span-4 space-y-6">
          {/* 1. ONE Target Role Card in neutral bg-surface (NOT solid orange!) */}
          <div className="bg-[#12151C] rounded-[16px] border border-white/[0.06] p-6 space-y-4 hover:border-white/[0.12] transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.04em] text-[#6B7280]">
                Target Role
              </span>
              <span className="text-xs font-medium text-[#F97316] tabular-nums">94% fit</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#ECEEF2]">
                Senior Full-Stack Engineer
              </h3>
              <p className="text-xs text-[#9AA1AE] leading-relaxed mt-1">
                4 high-priority technical keywords aligned with enterprise ATS benchmarks.
              </p>
            </div>

            {/* Thin linear 94% fit indicator */}
            <div className="w-full bg-white/[0.06] rounded-full h-1 overflow-hidden">
              <div className="bg-[#F97316] h-full rounded-full w-[94%]" />
            </div>

            {/* Keyword chips in neutral style */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">Python</span>
              <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">FastAPI</span>
              <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">PostgreSQL</span>
              <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">Docker</span>
              <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">Redis</span>
            </div>

            {/* Secondary button: Match Target Job Description */}
            <button
              type="button"
              onClick={() => setIsJdDrawerOpen(true)}
              className="btn-secondary w-full text-xs h-9 mt-2"
            >
              <span>Match Target Job Description</span>
            </button>
          </div>

          {/* 2. Connected GitHub Status Card — ONLY shown if NOT connected */}
          {!githubState.isConnected && (
            <ConnectGitHubCard
              isConnected={githubState.isConnected}
              githubUsername={githubState.githubUsername}
              avatarUrl={githubState.avatarUrl}
              onConnect={handleConnectGitHub}
              onDisconnect={handleDisconnectGitHub}
              onResync={loadGithubStatus}
              loading={loadingGithub}
            />
          )}

          {/* 3. Strict 1-Page Line Budget Protection Meter */}
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

          {/* 4. Active Master Resume Metadata Card */}
          <div className="bg-[#12151C] p-6 rounded-[16px] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.04em] text-[#6B7280]">
                Active Master Resume
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06]">
                .docx
              </span>
            </div>

            {currentResume ? (
              <div className="flex items-center gap-3 p-3 bg-[#171B24] rounded-[10px] border border-white/[0.06]">
                <div className="p-2 bg-white/[0.04] text-[#9AA1AE] rounded-[8px] border border-white/[0.06]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-medium text-[#ECEEF2] truncate">
                    {currentResume.original_filename || 'Uploaded_Resume.docx'}
                  </p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">
                    Ready for commit injection
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#171B24] rounded-[10px] text-center space-y-1.5 border border-white/[0.06]">
                <p className="text-xs font-medium text-[#ECEEF2]">No resume uploaded yet</p>
                <p className="text-xs text-[#9AA1AE]">
                  Upload your base Word document (.docx) to enable automatic bullet injection.
                </p>
                <Link
                  to="/upload"
                  className="inline-block mt-1 text-xs text-[#F97316] font-medium hover:underline"
                >
                  Upload now →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Smart Swap Modal */}
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

      {/* Job Description Slide-Over Drawer */}
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
    </ExecutiveLayout>
  );
}
