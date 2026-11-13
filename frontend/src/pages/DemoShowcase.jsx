import React, { useState } from 'react';
import ExecutiveLayout from '../components/layout/ExecutiveLayout';
import { ResumePreview } from '../components/preview';
import ResumeActionBar from '../components/preview/ResumeActionBar';
import { AtsScoreCard } from '../components/ats';
import ResumeDiffViewer from '../components/dashboard/ResumeDiffViewer';
import VersionHistoryList from '../components/dashboard/VersionHistoryList';
import RegenerationModal from '../components/dashboard/RegenerationModal';
import QATestRunner from '../components/dashboard/QATestRunner';

export default function DemoShowcase() {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'ats' | 'diff' | 'history' | 'qa'
  const [currentPresetKey, setCurrentPresetKey] = useState('fullstack'); // 'fullstack' | 'aiml'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalFinished, setIsModalFinished] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Pre-configured candidate showcase personas
  const presets = {
    fullstack: {
      name: 'Alex Morgan',
      role: 'Staff Full-Stack & Cloud Systems Engineer',
      score: 94,
      tier: 'Strong Match',
      breakdown: {
        actionVerbs: { score: 95, label: 'Superb Action Verbs', count: 18, target: 15 },
        quantifiableMetrics: { score: 92, label: 'Data & Metrics Rich', count: 12, target: 10 },
        keywordAlignment: { score: 96, label: 'Top Tier Coverage', matched: 24, total: 25 },
        formattingCleanliness: { score: 100, label: 'Valid OpenXML Structure', status: 'Verified' },
      },
      resumeData: {
        name: 'Alex Morgan',
        title: 'Staff Full-Stack & Distributed Systems Architect',
        contact: {
          email: 'alex.morgan.cloud@gmail.com',
          phone: '+1 (555) 382-9102',
          location: 'San Francisco, CA (Open to Remote)',
          github: 'github.com/alexmorgan-dev',
          website: 'alexmorgan.cloud',
        },
        summary:
          'High-throughput systems architect and open-source contributor with 7+ years developing distributed backend microservices, resilient data pipelines, and developer tooling in Python, Go, TypeScript, and AWS. Proven track record eliminating latency bottlenecks and mentoring engineering teams.',
        experience: [
          {
            role: 'Staff Infrastructure Engineer',
            company: 'Veloce Data Systems',
            location: 'San Francisco, CA',
            period: '2022 - Present',
            bullets: [
              'Spearheaded enterprise migration to event-driven Go and Kafka microservices, sustaining 140,000 req/sec peak throughput with zero downtime.',
              'Engineered multi-region AWS DynamoDB and Redis cluster caching topology, reducing global p99 API read latency from 240ms to 28ms.',
              'Constructed automated canary deployment pipeline using Terraform and GitHub Actions, lowering mean time to recovery (MTTR) by 54%.',
            ],
          },
          {
            role: 'Senior Software Engineer',
            company: 'NextGen Cloud AI',
            location: 'Austin, TX (Remote)',
            period: '2019 - 2022',
            bullets: [
              'Designed REST and gRPC API gateways utilizing FastAPI and Envoy proxy, consolidating 18 legacy services into a unified developer portal.',
              'Refactored legacy PostgreSQL queries and partitioning strategies across 4TB datasets, optimizing query execution speed by 68%.',
              'Championed internal developer platform reducing service spin-up time from 3 days to 14 minutes across 80+ engineering teammates.',
            ],
          },
        ],
        projects: [
          {
            name: 'Cloud-Scale Pipeline Optimizer (Latest GitHub Sync)',
            tech: 'Python, FastAPI, Redis, Docker, Tailwind CSS',
            link: 'github.com/alexmorgan-dev/cloud-pipeline-optimizer',
            highlights: [
              'Automated background queue dispatching and priority scheduling, reducing task failure rates by 34% under heavy load bursts.',
              'Integrated OpenTelemetry metrics and structured JSON tracing, providing sub-millisecond visibility into async worker execution.',
            ],
          },
          {
            name: 'Distributed Task Orchestrator & Worker Mesh',
            tech: 'Go, gRPC, Docker, PostgreSQL',
            link: 'github.com/alexmorgan-dev/task-orchestrator',
            highlights: [
              'Implemented masterless Raft consensus cluster tolerating multiple node failures without job loss or data corruption.',
            ],
          },
        ],
        skills: {
          Languages: ['Go', 'Python (FastAPI, PyDantic)', 'TypeScript', 'SQL (PostgreSQL)', 'Rust', 'Bash'],
          'Frameworks & Libraries': ['React', 'Next.js', 'Tailwind CSS', 'Node.js', 'Express', 'gRPC'],
          'Cloud & Infrastructure': ['Docker', 'Kubernetes', 'AWS (ECS, DynamoDB, S3)', 'Redis', 'Kafka', 'Terraform', 'CI/CD'],
        },
        education: [
          {
            degree: 'B.S. in Computer Science & Engineering',
            institution: 'University of California, Berkeley',
            period: '2015 - 2019',
          },
        ],
      },
    },
    aiml: {
      name: 'Elena Rostova',
      role: 'Principal Machine Learning & AI Systems Engineer',
      score: 91,
      tier: 'Strong Match',
      breakdown: {
        actionVerbs: { score: 92, label: 'High Action Density', count: 16, target: 15 },
        quantifiableMetrics: { score: 88, label: 'Benchmarked Gains', count: 11, target: 10 },
        keywordAlignment: { score: 92, label: 'Deep ML Coverage', matched: 23, total: 25 },
        formattingCleanliness: { score: 100, label: 'Valid OpenXML Structure', status: 'Verified' },
      },
      resumeData: {
        name: 'Elena Rostova',
        title: 'Principal Machine Learning & Generative AI Systems Engineer',
        contact: {
          email: 'elena.rostova.ai@gmail.com',
          phone: '+1 (555) 604-9812',
          location: 'Seattle, WA',
          github: 'github.com/erostova-ai',
          website: 'erostova.ml',
        },
        summary:
          'Machine Learning Systems Engineer specializing in large language model fine-tuning, latency-optimized GPU inference, and automated document synthesis. Published author at NeurIPS workshops with 6+ years deploying ML architectures at scale.',
        experience: [
          {
            role: 'Lead ML Infrastructure Engineer',
            company: 'Cognitive Foundry Labs',
            location: 'Seattle, WA',
            period: '2021 - Present',
            bullets: [
              'Architected continuous fine-tuning pipeline for 70B parameter open-weights LLMs using vLLM and TensorRT-LLM, cutting inference cost by 58%.',
              'Developed distributed feature store and vector caching layers indexing 400M+ dense embeddings with sub-12ms cosine lookup latency.',
              'Mentored 8 applied research scientists on best practices for high-throughput PyTorch training on 64-GPU H100 clusters.',
            ],
          },
        ],
        projects: [
          {
            name: 'FastRAG: Sub-50ms Hybrid Vector Search Engine',
            tech: 'Python, Rust, PyTorch, FAISS, Docker',
            link: 'github.com/erostova-ai/fast-rag',
            highlights: [
              'Engineered custom BM25 + dense vector hybrid ranker delivering 18% improvement in recall@10 over pure dense search.',
            ],
          },
        ],
        skills: {
          'AI & ML Frameworks': ['PyTorch', 'Hugging Face Transformers', 'vLLM', 'LangChain', 'LlamaIndex', 'Triton Inference'],
          'Infrastructure & Tooling': ['Docker', 'NVIDIA CUDA', 'Ray Train', 'MLflow', 'Qdrant / Milvus', 'Kubernetes'],
          Languages: ['Python', 'C++', 'SQL', 'Bash'],
        },
        education: [
          {
            degree: 'M.S. in Machine Learning & Robotics',
            institution: 'Carnegie Mellon University',
            period: '2016 - 2018',
          },
        ],
      },
    },
  };

  const preset = presets[currentPresetKey];

  const handleStartRegeneration = (simulateFailure = false) => {
    setIsModalOpen(true);
    setIsModalFinished(false);
    setModalError(null);

    if (simulateFailure) {
      setTimeout(() => {
        setModalError('Gemini API quota exceeded or commit token invalid. Please verify connection credentials.');
      }, 1800);
    } else {
      setTimeout(() => {
        setIsModalFinished(true);
        triggerToast('AI Continuous Sync Complete: Resume updated with 2 new quantified bullets!');
      }, 2400);
    }
  };

  // Mock version list for timeline inspector
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

  const headerActions = (
    <div className="flex items-center gap-2">
      <div className="bg-[#0B0D12] p-0.5 rounded-lg border border-white/[0.06] flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            setCurrentPresetKey('fullstack');
            triggerToast('Loaded Alex Morgan (Full Stack Persona)');
          }}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            currentPresetKey === 'fullstack'
              ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
              : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
          }`}
        >
          Full Stack
        </button>
        <button
          type="button"
          onClick={() => {
            setCurrentPresetKey('aiml');
            triggerToast('Loaded Elena Rostova (AI/ML Persona)');
          }}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            currentPresetKey === 'aiml'
              ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
              : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
          }`}
        >
          AI / ML
        </button>
      </div>

      <button
        type="button"
        onClick={() => handleStartRegeneration(false)}
        className="px-3.5 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] active:scale-95 text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
      >
        <span>⚡ Test Pipeline</span>
      </button>
    </div>
  );

  return (
    <ExecutiveLayout
      breadcrumbs={[{ label: 'Showcase', path: '/demo' }, { label: preset.name }]}
      actions={headerActions}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12151C] text-[#ECEEF2] px-4 py-2.5 rounded-xl shadow-lg border border-white/[0.06] flex items-center gap-2.5 animate-fade-in text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[#34D399]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Multi-Step Regeneration Modal */}
      <RegenerationModal
        isOpen={isModalOpen}
        isFinished={isModalFinished}
        error={modalError}
        onClose={() => setIsModalOpen(false)}
        onRetry={() => handleStartRegeneration(false)}
      />

      <div className="space-y-5">
        {/* Top Hero Banner */}
        <div className="bg-[#12151C] rounded-xl border border-white/[0.06] shadow-xs p-5 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#F97316]/10 text-[#F97316] text-[11px] font-medium border border-[#F97316]/20">
                  Feature Showcase
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#171B24] text-[#9AA1AE] border border-white/[0.06] text-[10px] font-normal">
                  Interactive Lab
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#ECEEF2] tracking-tight">
                Resume Auto-Updater Showcase
              </h1>
              <p className="text-xs text-[#9AA1AE] max-w-2xl leading-relaxed">
                Test and evaluate the entire autonomous pipeline: continuous GitHub commit sync, Gemini AI bullet synthesis, OpenXML .docx manipulation, ATS score feedback engine, and version history diffing.
              </p>
            </div>

            {/* Quick Candidate Preset Card */}
            <div className="p-3 rounded-lg bg-[#0B0D12] border border-white/[0.06] flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] flex items-center justify-center font-medium text-xs">
                {currentPresetKey === 'fullstack' ? 'AM' : 'ER'}
              </div>
              <div>
                <p className="text-xs font-semibold text-[#ECEEF2]">{preset.name}</p>
                <p className="text-[11px] text-[#6B7280]">{preset.role}</p>
                <span className="inline-block mt-0.5 text-[10px] font-medium text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-md border border-[#34D399]/20">
                  ATS: {preset.score}/100
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Showcase Action Controls Toolbar */}
        <div className="bg-[#12151C] p-2 rounded-xl border border-white/[0.06] shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          {/* Main Navigation Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-[#9AA1AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>Resume Preview</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ats')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'ats'
                  ? 'bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>ATS Score Engine</span>
              <span className="px-1.5 py-0.2 rounded-full bg-[#34D399] text-[#0B0D12] text-[10px] font-bold">
                {preset.score}%
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'diff'
                  ? 'bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-[#9AA1AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>AI Diff Inspector</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-[#9AA1AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Version History</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qa'
                  ? 'bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-[#9AA1AE]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>QA Suite</span>
            </button>
          </div>

          {/* Interactive Pipeline Trigger Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleStartRegeneration(false)}
              className="px-3 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-medium shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Test AI Pipeline</span>
            </button>

            <button
              type="button"
              onClick={() => handleStartRegeneration(true)}
              className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-medium border border-rose-500/20 transition-colors cursor-pointer"
              title="Test error fallback state in modal"
            >
              Test Error State
            </button>
          </div>
        </div>

        {/* Tab View Content */}
        {activeTab === 'preview' && (
          <div className="space-y-4 animate-fade-in">
            <ResumeActionBar
              lastUpdated="Updated 2m ago (AI Verified)"
              onRegenerate={() => handleStartRegeneration(false)}
            />
            <ResumePreview data={preset.resumeData} />
          </div>
        )}

        {activeTab === 'ats' && (
          <div className="animate-fade-in">
            <AtsScoreCard
              score={preset.score}
              tier={preset.tier}
              breakdown={preset.breakdown}
              onRecalculate={() => handleStartRegeneration(false)}
            />
          </div>
        )}

        {activeTab === 'diff' && (
          <div className="animate-fade-in">
            <ResumeDiffViewer
              scoreA={64}
              scoreB={preset.score}
              versionA="Initial Baseline"
              versionB="Gemini AI + GitHub Continuous Sync"
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in">
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
          <div className="animate-fade-in">
            <QATestRunner onTriggerModalDemo={() => handleStartRegeneration(false)} />
          </div>
        )}
      </div>
    </ExecutiveLayout>
  );
}
