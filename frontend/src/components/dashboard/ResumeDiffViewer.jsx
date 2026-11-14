import { useState } from 'react';

/**
 * ResumeDiffViewer Component - Calm Executive Dark Theme
 * 
 * Provides an interactive comparison between baseline resume entries and
 * AI-generated STAR-format bullet points.
 */
export default function ResumeDiffViewer({
  originalBullets = [],
  aiUpdatedBullets = [],
  versionA = 'Original Upload',
  versionB = 'AI Optimized (Latest)',
  scoreA = 64,
  scoreB = 94,
  githubContext: _githubContext = null,
}) {
  const [viewMode, setViewMode] = useState('side-by-side');
  const scoreDelta = scoreB - scoreA;

  const defaultOriginal = [
    {
      project: 'Resume Auto-Updater & Webhook Pipeline',
      role: 'Full Stack Engineer',
      bullets: [
        'Built a resume updater application using Python and JavaScript.',
        'Worked with GitHub API to get commits and project data.',
        'Added some unit tests to ensure endpoints worked properly.',
      ],
    },
    {
      project: 'Cloud Storage & Document Parsing Service',
      role: 'Backend Developer',
      bullets: [
        'Implemented file upload endpoint for docx files.',
        'Extracted text from docx documents using standard python libraries.',
      ],
    },
  ];

  const defaultUpdated = [
    {
      project: 'Resume Auto-Updater & Autonomous Pipeline',
      role: 'Lead Full-Stack Engineer',
      tag: 'GitHub Sync: 48 Commits',
      bullets: [
        {
          text: 'Architected an asynchronous FastAPI backend and Vite/React frontend, reducing resume update latency by 68%.',
          isNew: true,
          type: 'added',
          impact: '+15% ATS Keywords',
        },
        {
          text: 'Engineered n8n webhook automation with SHA-256 HMAC cryptographic signature verification for instant CI/CD push triggers.',
          isNew: true,
          type: 'added',
          impact: '+22% Quantified Metrics',
        },
        {
          text: 'Integrated Google Gemini AI API to dynamically parse commit diffs and synthesize high-impact STAR-format bullet points.',
          isNew: true,
          type: 'revised',
          impact: 'Replaced Generic Bullet',
        },
      ],
    },
    {
      project: 'Cloud Storage & Document Parsing Engine',
      role: 'Lead Backend Developer',
      tag: 'GitHub Sync: 24 Commits',
      bullets: [
        {
          text: 'Developed robust docx OpenXML manipulation engine supporting complex tables, headers, and zero-distortion layout retention.',
          isNew: true,
          type: 'added',
          impact: '+18% Action Verbs',
        },
        {
          text: 'Optimized multipart streaming uploads and SQLite/PostgreSQL caching layer to handle 50MB+ file uploads with <120ms latency.',
          isNew: true,
          type: 'added',
          impact: '+12% Performance',
        },
      ],
    },
  ];

  const currentOriginal = originalBullets.length > 0 ? originalBullets : defaultOriginal;
  const currentUpdated = aiUpdatedBullets.length > 0 ? aiUpdatedBullets : defaultUpdated;

  return (
    <div className="w-full bg-[#12151C] rounded-xl border border-white/[0.06] shadow-sm p-4 sm:p-6 space-y-4 text-[#ECEEF2]">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <h3 className="font-semibold text-sm sm:text-base text-[#E0E0E0]">
              Resume Bullet Evolution & Commit Diff
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20 text-[11px] font-medium">
              +{scoreDelta} pts ATS Impact
            </span>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Side-by-side inspection showing how commit achievements replace passive baseline bullets
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="inline-flex rounded-lg bg-[#0B0D12] p-0.5 border border-white/[0.06]">
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'unified'
                  ? 'bg-[#171B24] text-[#ECEEF2] shadow-xs'
                  : 'text-[#9AA1AE] hover:text-[#ECEEF2]'
              }`}
            >
              Unified
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Summary Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0B0D12] p-2.5 rounded-lg border border-white/[0.06] text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-[#34D399] inline-block" />
          <span className="text-[#9AA1AE]">AI Synthesized Bullet</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-[#F97316] inline-block" />
          <span className="text-[#9AA1AE]">STAR Rephrased</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-[#F87171] inline-block" />
          <span className="text-[#9AA1AE]">Replaced Baseline</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-sm bg-[#171B24] border border-white/[0.06] inline-block" />
          <span className="text-[#9AA1AE]">Metrics Quantified</span>
        </div>
      </div>

      {/* Diff View Rendering */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT: Original Version */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#0B0D12] text-[#9AA1AE] text-xs font-medium border border-white/[0.06]">
                  {versionA}
                </span>
                <span className="text-xs text-[#6B7280]">Initial Baseline</span>
              </div>
              <span className="text-xs font-medium text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-md border border-[#F97316]/20">
                Score: {scoreA}%
              </span>
            </div>

            <div className="space-y-2.5">
              {currentOriginal.map((proj, pIdx) => (
                <div key={pIdx} className="p-3 rounded-lg bg-[#0B0D12] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#ECEEF2]">{proj.project}</h4>
                    <span className="text-[10px] text-[#6B7280]">{proj.role}</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#6B7280]">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 p-2 rounded-md bg-[#12151C] border border-white/[0.04] line-through text-[#6B7280]">
                        <span className="text-[#F87171] font-bold mt-0.5">-</span>
                        <span className="leading-relaxed">{typeof b === 'string' ? b : b.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: AI Optimized Version */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[#171B24] text-[#ECEEF2] border border-white/[0.06] text-xs font-medium">
                  {versionB}
                </span>
                <span className="text-xs text-[#34D399]">Gemini AI + GitHub Sync</span>
              </div>
              <span className="text-xs font-medium text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-md border border-[#34D399]/20">
                Score: {scoreB}%
              </span>
            </div>

            <div className="space-y-2.5">
              {currentUpdated.map((proj, pIdx) => (
                <div key={pIdx} className="p-3 rounded-lg bg-[#0B0D12] border border-white/[0.06] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-[#ECEEF2]">{proj.project}</h4>
                    {proj.tag && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399] border border-[#34D399]/20">
                        {proj.tag}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#ECEEF2]">
                    {proj.bullets.map((b, bIdx) => {
                      const text = typeof b === 'string' ? b : b.text;
                      const impact = typeof b === 'object' ? b.impact : '+Action Metric';
                      return (
                        <li key={bIdx} className="p-2.5 rounded-md bg-[#34D399]/5 border border-[#34D399]/20 space-y-1">
                          <div className="flex items-start gap-2">
                            <span className="text-[#34D399] font-bold mt-0.5">+</span>
                            <span className="leading-relaxed text-[#ECEEF2] font-normal">{text}</span>
                          </div>
                          {impact && (
                            <div className="flex justify-end">
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#171B24] text-[#34D399] border border-[#34D399]/20">
                                {impact}
                              </span>
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* UNIFIED DIFF VIEW */
        <div className="space-y-3">
          {currentUpdated.map((proj, pIdx) => {
            const origProj = currentOriginal[pIdx] || { bullets: [] };
            return (
              <div key={pIdx} className="bg-[#0B0D12] rounded-lg border border-white/[0.06] p-3.5 space-y-2.5">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-semibold text-[#ECEEF2]">{proj.project}</h4>
                    {proj.tag && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#34D399]/10 text-[#34D399]">
                        {proj.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-[#6B7280]">{proj.role || 'Full-Stack'}</span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  {origProj.bullets.map((b, bIdx) => (
                    <div key={`rem-${bIdx}`} className="p-2 rounded-md bg-[#F87171]/5 border border-[#F87171]/20 text-[#F87171] flex items-start gap-2">
                      <span className="font-bold select-none">-</span>
                      <span className="font-sans line-through opacity-75">{typeof b === 'string' ? b : b.text}</span>
                    </div>
                  ))}

                  {proj.bullets.map((b, bIdx) => {
                    const text = typeof b === 'string' ? b : b.text;
                    const impact = typeof b === 'object' ? b.impact : null;
                    return (
                      <div key={`add-${bIdx}`} className="p-2 rounded-md bg-[#34D399]/10 border border-[#34D399]/20 text-[#ECEEF2] flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-[#34D399] select-none">+</span>
                          <span className="font-sans font-normal">{text}</span>
                        </div>
                        {impact && (
                          <span className="shrink-0 text-[10px] font-sans font-medium px-2 py-0.5 rounded-md bg-[#171B24] text-[#34D399] border border-[#34D399]/20">
                            {impact}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
