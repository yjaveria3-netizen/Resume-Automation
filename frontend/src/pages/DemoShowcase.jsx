import { useState } from 'react';
import ResumePreview from '../components/preview/ResumePreview';
import ResumeActionBar from '../components/preview/ResumeActionBar';
import AtsScoreCard from '../components/ats/AtsScoreCard';
import AtsScoreBadge from '../components/ats/AtsScoreBadge';
import RegenerationModal from '../components/dashboard/RegenerationModal';
import ResumeDiffViewer from '../components/dashboard/ResumeDiffViewer';
import VersionHistoryList from '../components/dashboard/VersionHistoryList';
import QATestRunner from '../components/dashboard/QATestRunner';

// Demo Presets for Evaluator Showcase
const DEMO_PRESETS = {
  fullstack: {
    id: 'fullstack',
    name: 'Alex Morgan',
    role: 'Senior Full Stack Engineer',
    score: 94,
    tier: 'Strong Match',
    breakdown: [
      { label: 'Action Verbs Used', score: 95, target: 80, desc: 'High frequency of strong technical action verbs' },
      { label: 'Quantifiable Metrics Found', score: 90, target: 70, desc: 'Specific latency reduction and revenue metrics detected' },
      { label: 'Keyword Alignment', score: 96, target: 85, desc: 'Matched 14/15 required ATS framework keywords' },
      { label: 'Formatting Cleanliness', score: 98, target: 90, desc: 'Strict standard section headings and standard typography' },
    ],
    resumeData: {
      candidateName: 'Alex Morgan',
      targetRole: 'Senior Full Stack Engineer',
      contact: {
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 382-9901',
        location: 'San Francisco, CA',
        github: 'github.com/alexmorgan-dev',
        linkedin: 'linkedin.com/in/alexmorgan',
      },
      summary: 'Impact-driven Full Stack Engineer with 5+ years of experience building resilient cloud architectures, high-throughput microservices, and modern responsive web applications. Specialized in FastAPI, React/Vite, PostgreSQL, and autonomous AI pipelines.',
      experience: [
        {
          title: 'Senior Full Stack Developer',
          company: 'HyperScale Cloud Solutions',
          period: '2023 – Present',
          location: 'San Francisco, CA',
          bullets: [
            'Architected asynchronous FastAPI backend and Vite/React dashboard reducing sync latency by 68%.',
            'Engineered n8n webhook automation with SHA-256 HMAC cryptographic signature verification.',
            'Integrated Google Gemini AI API to dynamically parse commit diffs and synthesize high-impact STAR-format bullet points.',
          ],
        },
        {
          title: 'Full Stack Engineer',
          company: 'DataFlow Systems',
          period: '2021 – 2023',
          location: 'San Jose, CA',
          bullets: [
            'Developed robust docx OpenXML manipulation engine supporting complex tables, headers, and zero-distortion layout retention.',
            'Optimized multipart streaming uploads and SQLite/PostgreSQL caching layer to handle 50MB+ file uploads with <120ms latency.',
          ],
        },
      ],
      projects: [
        {
          name: 'Resume Auto-Updater Autonomous Pipeline',
          tech: 'FastAPI, Python, React, Vite, Tailwind CSS, n8n, Gemini AI',
          bullets: [
            'Built an autonomous end-to-end continuous synchronization pipeline updating resume bullet points upon GitHub git push triggers.',
            'Implemented custom ATS scoring algorithm analyzing keyword density, action verb ratios, and measurable impact.',
          ],
        },
        {
          name: 'Distributed Cloud Document Parser',
          tech: 'Python, OpenXML, Docker, PostgreSQL, Redis',
          bullets: [
            'Constructed a fault-tolerant document analyzer capable of extracting and rebuilding .docx structures with 99.9% format fidelity.',
          ],
        },
      ],
      skills: {
        languages: 'Python, TypeScript, JavaScript, SQL, Bash',
        frameworks: 'FastAPI, React.js, Next.js, Node.js, Tailwind CSS',
        developerTools: 'Docker, PostgreSQL, SQLite, Git, GitHub Actions, n8n, Redis',
      },
    },
  },
  aiml: {
    id: 'aiml',
    name: 'Elena Rostova',
    role: 'AI / Machine Learning Engineer',
    score: 96,
    tier: 'Strong Match',
    breakdown: [
      { label: 'Action Verbs Used', score: 98, target: 80, desc: 'High frequency of strong technical action verbs' },
      { label: 'Quantifiable Metrics Found', score: 94, target: 70, desc: 'High precision and inference speed metrics identified' },
      { label: 'Keyword Alignment', score: 98, target: 85, desc: 'Matched 15/15 target AI/ML keywords' },
      { label: 'Formatting Cleanliness', score: 95, target: 90, desc: 'Flawless document hierarchy' },
    ],
    resumeData: {
      candidateName: 'Elena Rostova',
      targetRole: 'AI & Machine Learning Engineer',
      contact: {
        email: 'elena.rostova@example.com',
        phone: '+1 (555) 819-2044',
        location: 'Seattle, WA',
        github: 'github.com/erostova-ai',
        linkedin: 'linkedin.com/in/elena-rostova',
      },
      summary: 'AI Engineer specializing in Large Language Models, prompt engineering architectures, and scalable inference microservices. Proven track record deploying automated summarization and extraction pipelines.',
      experience: [
        {
          title: 'Lead AI Engineer',
          company: 'NeuralSync Technologies',
          period: '2023 – Present',
          location: 'Seattle, WA',
          bullets: [
            'Fine-tuned Gemini and open-source LLMs using LoRA, achieving a 42% reduction in hallucination rates across resume data parsing.',
            'Deployed low-latency streaming endpoints via FastAPI and vLLM, scaling to 15,000 requests/min with sub-180ms TTFT.',
          ],
        },
      ],
      projects: [
        {
          name: 'Semantic Resume ATS Evaluator',
          tech: 'Python, PyTorch, HuggingFace, Gemini 1.5, Vector DB',
          bullets: [
            'Engineered cosine similarity semantic search embedding space to score resume alignment against job descriptions with 96% accuracy.',
          ],
        },
      ],
      skills: {
        languages: 'Python, C++, SQL, Julia',
        frameworks: 'PyTorch, TensorFlow, HuggingFace, LangChain, FastAPI',
        developerTools: 'Docker, Kubernetes, MLflow, Weights & Biases, Git',
      },
    },
  },
};

export default function DemoShowcase() {
  const [currentPresetKey, setCurrentPresetKey] = useState('fullstack');
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'ats' | 'diff' | 'history' | 'qa'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFinished, setIsModalFinished] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const preset = DEMO_PRESETS[currentPresetKey];

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartRegeneration = (shouldFail = false) => {
    setIsModalOpen(true);
    setIsModalFinished(false);
    setModalError(null);

    if (shouldFail) {
      setTimeout(() => {
        setModalError('GitHub API Rate Limit exceeded (403 Forbidden). Please connect your personal OAuth access token.');
      }, 3000);
    } else {
      setTimeout(() => {
        setIsModalFinished(true);
        triggerToast('AI Regeneration Complete! Project bullets & ATS scores updated.');
      }, 7000);
    }
  };

  const mockVersions = [
    {
      id: 'v-3',
      version_number: 3,
      created_at: new Date().toISOString(),
      ats_score: preset.score,
      download_url: '#',
    },
    {
      id: 'v-2',
      version_number: 2,
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      ats_score: 82,
      download_url: '#',
    },
    {
      id: 'v-1',
      version_number: 1,
      created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
      ats_score: 64,
      download_url: '#',
    },
  ];

  return (
    <div className="min-h-screen bg-khaki-light pb-20 pt-6 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-olive-wood text-white px-5 py-3 rounded-2xl shadow-xl border border-sage/40 flex items-center gap-3 animate-fade-in text-xs font-bold">
          <span className="w-2.5 h-2.5 rounded-full bg-sage animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Multi-Step Regeneration Modal (Day 5 Feature) */}
      <RegenerationModal
        isOpen={isModalOpen}
        isFinished={isModalFinished}
        error={modalError}
        onClose={() => setIsModalOpen(false)}
        onRetry={() => handleStartRegeneration(false)}
      />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Hero Banner */}
        <div className="bg-white rounded-3xl border border-khaki/40 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-sage/20 text-sage-hover text-xs font-extrabold border border-sage/30">
                  Person B • QA, Showcase & Demo Hub
                </span>
                <span className="px-2.5 py-1 rounded-full bg-olive-wood text-white text-[10px] font-bold">
                  Days 1–7 Full Scope
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-olive-wood tracking-tight">
                Resume Auto-Updater Interactive Showcase
              </h1>
              <p className="text-xs sm:text-sm text-olive-wood/75 max-w-2xl leading-relaxed font-medium">
                Test and evaluate the entire autonomous pipeline: continuous GitHub commit sync, Gemini AI bullet synthesis, OpenXML .docx manipulation, ATS score feedback engine, and version history diffing.
              </p>
            </div>

            {/* Quick Preset Selector */}
            <div className="bg-khaki-light/60 p-3 rounded-2xl border border-khaki/50 flex flex-col sm:flex-row items-center gap-2">
              <span className="text-[11px] font-bold text-olive-wood/70 uppercase tracking-wider pl-1">
                Candidate Preset:
              </span>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPresetKey('fullstack');
                    triggerToast('Loaded Alex Morgan (Full Stack Preset)');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPresetKey === 'fullstack'
                      ? 'bg-olive-wood text-white shadow-xs'
                      : 'bg-white text-olive-wood border border-khaki/40 hover:bg-khaki-light'
                  }`}
                >
                  Full Stack
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPresetKey('aiml');
                    triggerToast('Loaded Elena Rostova (AI/ML Preset)');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPresetKey === 'aiml'
                      ? 'bg-olive-wood text-white shadow-xs'
                      : 'bg-white text-olive-wood border border-khaki/40 hover:bg-khaki-light'
                  }`}
                >
                  AI / ML
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Action Controls Toolbar */}
        <div className="bg-white p-3 rounded-2xl border border-khaki/40 shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-olive-wood text-white shadow-xs'
                  : 'text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Resume Preview (Day 3)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ats')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ats'
                  ? 'bg-olive-wood text-white shadow-xs'
                  : 'text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>ATS Score Engine (Day 4)</span>
              <span className="px-1.5 py-0.2 rounded-full bg-sage text-white text-[10px]">
                {preset.score}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diff')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'diff'
                  ? 'bg-olive-wood text-white shadow-xs'
                  : 'text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>AI Diff Inspector (Day 6)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-olive-wood text-white shadow-xs'
                  : 'text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Version History (Day 6)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qa'
                  ? 'bg-olive-wood text-white shadow-xs'
                  : 'text-olive-wood/70 hover:bg-khaki-light hover:text-olive-wood'
              }`}
            >
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>QA Test Suite (Day 7)</span>
            </button>
          </div>

          {/* Interactive Pipeline Trigger Buttons (Day 5 QA Controls) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStartRegeneration(false)}
              className="px-4 py-2 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-extrabold shadow-sm shadow-sage/30 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Test AI Pipeline (Day 5)</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartRegeneration(true)}
              className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all cursor-pointer"
              title="Test error fallback state in modal"
            >
              Test Error State
            </button>
          </div>
        </div>

        {/* Tab View Content */}
        {activeTab === 'preview' && (
          <div className="space-y-4">
            <ResumeActionBar
              lastUpdated="Updated 2m ago (AI Verified)"
              onRegenerate={() => handleStartRegeneration(false)}
            />
            <ResumePreview data={preset.resumeData} />
          </div>
        )}

        {activeTab === 'ats' && (
          <AtsScoreCard
            score={preset.score}
            tier={preset.tier}
            breakdown={preset.breakdown}
            onRecalculate={() => handleStartRegeneration(false)}
          />
        )}

        {activeTab === 'diff' && (
          <ResumeDiffViewer
            scoreA={64}
            scoreB={preset.score}
            versionA="Initial Baseline"
            versionB="Gemini AI + GitHub Continuous Sync"
          />
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <VersionHistoryList
              versions={mockVersions}
              selectedVersionId="v-3"
              onSelectVersion={(v) => triggerToast(`Switched active preview to Version ${v.version_number}`)}
            />
            <ResumeDiffViewer
              scoreA={82}
              scoreB={preset.score}
              versionA="Version v2 (Yesterday)"
              versionB="Version v3 (Latest Push)"
            />
          </div>
        )}

        {activeTab === 'qa' && (
          <QATestRunner onTriggerModalDemo={() => handleStartRegeneration(false)} />
        )}
      </div>
    </div>
  );
}
