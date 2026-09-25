import { useState } from 'react';

/**
 * ResumeDiffViewer Component (Day 6 Feature)
 * 
 * Provides an interactive comparison between the original resume (or previous version)
 * and the latest AI-generated resume. Features:
 * - Side-by-side and Unified split modes
 * - Highlighted bullet point additions (green) and revisions (amber/rose)
 * - ATS Score Delta badge (+X pts increase)
 * - GitHub commits & synthesized keyword tags
 */
export default function ResumeDiffViewer({
  originalBullets = [],
  aiUpdatedBullets = [],
  versionA = 'Original Upload',
  versionB = 'AI Optimized (Latest)',
  scoreA = 64,
  scoreB = 94,
  githubContext = null,
}) {
  const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' | 'unified'
  const scoreDelta = scoreB - scoreA;

  // Fallback sample data if none provided
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
          type: 'revised',
          impact: 'Replaced Basic Upload',
        },
      ],
    },
  ];

  const currentOriginal = originalBullets.length > 0 ? originalBullets : defaultOriginal;
  const currentUpdated = aiUpdatedBullets.length > 0 ? aiUpdatedBullets : defaultUpdated;

  return (
    <div className="bg-white rounded-3xl border border-khaki/40 shadow-sm overflow-hidden space-y-5 p-6 sm:p-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-khaki/30 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-sage animate-pulse" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-sage">
              Day 6 • AI Diff & Impact Inspector
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-olive-wood">
            Resume Changes & Bullet Point Evolution
          </h3>
          <p className="text-xs text-olive-wood/70 mt-0.5">
            Compare original resume entries against AI-synthesized, ATS-optimized bullet points.
          </p>
        </div>

        {/* View Mode Toggle & Score Delta */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage/15 border border-sage/30 text-sage-hover font-extrabold text-xs">
            <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>ATS Score: +{scoreDelta > 0 ? scoreDelta : 30}% Improvement</span>
          </div>

          <div className="bg-khaki-light/80 p-1 rounded-xl border border-khaki/40 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'side-by-side'
                  ? 'bg-olive-wood text-white shadow-xs'
                  : 'text-olive-wood/70 hover:text-olive-wood'
              }`}
            >
              Side-by-Side
            </button>
            <button
              type="button"
              onClick={() => setViewMode('unified')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'unified'
                  ? 'bg-olive-wood text-white shadow-xs'
                  : 'text-olive-wood/70 hover:text-olive-wood'
              }`}
            >
              Unified Diff
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Summary Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-khaki-light/40 p-3.5 rounded-2xl border border-khaki/30 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-emerald-500/20 border border-emerald-500 inline-block" />
          <span className="font-semibold text-olive-wood">AI-Synthesized Bullet</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-amber-500/20 border border-amber-500 inline-block" />
          <span className="font-semibold text-olive-wood">STAR Rephrased</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-rose-500/20 border border-rose-500 inline-block" />
          <span className="font-semibold text-olive-wood">Replaced / Removed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-sage/20 border border-sage inline-block" />
          <span className="font-semibold text-olive-wood">Quantified Metric Added</span>
        </div>
      </div>

      {/* Diff View Rendering */}
      {viewMode === 'side-by-side' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Original Version */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-khaki/30">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-khaki/30 text-olive-wood text-xs font-bold">
                  {versionA}
                </span>
                <span className="text-xs text-olive-wood/60 font-medium">Initial Baseline</span>
              </div>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Score: {scoreA}%
              </span>
            </div>

            <div className="space-y-4">
              {currentOriginal.map((proj, pIdx) => (
                <div key={pIdx} className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-olive-wood">{proj.project}</h4>
                    <span className="text-[10px] text-olive-wood/60">{proj.role}</span>
                  </div>
                  <ul className="space-y-2 text-xs text-olive-wood/80">
                    {proj.bullets.map((b, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2 p-2 rounded-lg bg-white border border-stone-200/60 line-through text-stone-400">
                        <span className="text-rose-500 font-bold mt-0.5">-</span>
                        <span className="leading-relaxed">{typeof b === 'string' ? b : b.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: AI Optimized Version */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-khaki/30">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-sage text-white text-xs font-bold">
                  {versionB}
                </span>
                <span className="text-xs text-sage-hover font-semibold">Gemini AI + GitHub Sync</span>
              </div>
              <span className="text-xs font-bold text-sage-hover bg-sage/20 px-2 py-0.5 rounded-full border border-sage/40">
                Score: {scoreB}%
              </span>
            </div>

            <div className="space-y-4">
              {currentUpdated.map((proj, pIdx) => (
                <div key={pIdx} className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-olive-wood">{proj.project}</h4>
                    {proj.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-sage/20 text-sage-hover border border-sage/30">
                        {proj.tag}
                      </span>
                    )}
                  </div>
                  <ul className="space-y-2 text-xs text-olive-wood">
                    {proj.bullets.map((b, bIdx) => {
                      const text = typeof b === 'string' ? b : b.text;
                      const impact = typeof b === 'object' ? b.impact : '+Action Metric';
                      return (
                        <li key={bIdx} className="p-2.5 rounded-xl bg-white border border-emerald-300 shadow-2xs space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="text-emerald-600 font-bold mt-0.5">+</span>
                            <span className="leading-relaxed text-olive-wood font-medium">{text}</span>
                          </div>
                          {impact && (
                            <div className="flex justify-end">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sage/15 text-sage-hover border border-sage/20">
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
        <div className="space-y-4">
          {currentUpdated.map((proj, pIdx) => {
            const origProj = currentOriginal[pIdx] || { bullets: [] };
            return (
              <div key={pIdx} className="bg-stone-50 rounded-2xl border border-khaki/40 p-4.5 space-y-3">
                <div className="flex items-center justify-between border-b border-khaki/20 pb-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-extrabold text-olive-wood">{proj.project}</h4>
                    {proj.tag && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sage/20 text-sage-hover">
                        {proj.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-olive-wood/60">{proj.role || 'Full-Stack'}</span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  {/* Removed Bullets */}
                  {origProj.bullets.map((b, bIdx) => (
                    <div key={`rem-${bIdx}`} className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 text-rose-800 flex items-start gap-2.5">
                      <span className="font-bold text-rose-600 select-none">-</span>
                      <span className="font-sans line-through opacity-75">{typeof b === 'string' ? b : b.text}</span>
                    </div>
                  ))}

                  {/* Added Bullets */}
                  {proj.bullets.map((b, bIdx) => {
                    const text = typeof b === 'string' ? b : b.text;
                    const impact = typeof b === 'object' ? b.impact : null;
                    return (
                      <div key={`add-${bIdx}`} className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <span className="font-bold text-emerald-600 select-none">+</span>
                          <span className="font-sans font-medium">{text}</span>
                        </div>
                        {impact && (
                          <span className="flex-shrink-0 text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-white text-emerald-700 border border-emerald-300">
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
