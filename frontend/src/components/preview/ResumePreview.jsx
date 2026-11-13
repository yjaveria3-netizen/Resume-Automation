import React from 'react';

/**
 * Default mock resume data used for the preview panel
 */
export const defaultResumeData = {
  name: "Software Engineer",
  title: "Full-Stack Software Engineer & AI Integrator",
  contact: {
    email: "developer@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/developer",
    github: "github.com/developer",
    website: "portfolio.dev"
  },
  summary: "Results-driven Full-Stack Engineer with 5+ years of experience designing scalable distributed web architectures, high-performance APIs, and AI-assisted automation pipelines. Proven track record reducing cloud latency by 42% and optimizing ATS ranking for mission-critical career platforms.",
  experience: [
    {
      role: "Senior Software Engineer",
      company: "Apex Cloud Systems",
      location: "San Francisco, CA",
      period: "2023 – Present",
      highlights: [
        "Architected an automated resume ingestion pipeline utilizing microservices and vector embeddings, scaling to 150k+ daily transactions with 99.98% uptime.",
        "Refactored core REST and GraphQL endpoints in Node.js and FastAPI, decreasing P99 latency from 450ms to 95ms.",
        "Mentored a team of 6 engineers, spearheading weekly code reviews and implementing CI/CD pipelines reducing deployment failure rates by 35%."
      ]
    },
    {
      role: "Full-Stack Developer",
      company: "Synthetix Labs",
      location: "Austin, TX (Remote)",
      period: "2021 – 2023",
      highlights: [
        "Built responsive client portals with React, Tailwind CSS, and TypeScript, increasing user retention by 28% across 45,000 monthly active users.",
        "Integrated secure OAuth2 and multi-tenant authentication protocols with PostgreSQL and Redis caching layers.",
        "Automated end-to-end testing workflows using Playwright and Vitest, raising code coverage from 64% to 92%."
      ]
    }
  ],
  projects: [
    {
      name: "Resume Auto-Updater & ATS Optimizer",
      tech: "React, Tailwind CSS, FastAPI, PostgreSQL, Gemini AI",
      link: "github.com/developer/resume-auto-updater",
      highlights: [
        "Engineered continuous GitHub repository sync that automatically parses commits, generates verified skill impact bullets, and updates resume builds.",
        "Maintained strict 1-page line budget protection and ATS keyword matching score >90%."
      ]
    },
    {
      name: "Distributed Task Orchestrator",
      tech: "Go, Docker, Redis Streams, gRPC",
      link: "github.com/developer/task-mesh",
      highlights: [
        "Developed low-latency worker queue processing 20k background jobs per second with fault-tolerant dead-letter handling."
      ]
    }
  ],
  skills: {
    languages: ["JavaScript (ESNext)", "TypeScript", "Python", "Go", "SQL", "HTML5/CSS3"],
    frameworks: ["React", "Next.js", "FastAPI", "Express.js", "Tailwind CSS", "Node.js"],
    tools: ["PostgreSQL", "Redis", "Docker", "Git/GitHub Actions", "AWS", "Nginx", "Linux/Bash"]
  },
  education: [
    {
      degree: "B.S. in Computer Science",
      institution: "University of California, Berkeley",
      year: "2017 – 2021",
      honors: "Dean's Honor List, Magna Cum Laude"
    }
  ]
};

/**
 * Shimmer skeleton placeholder component for the loading state (Dark Theme)
 */
export function ResumePreviewSkeleton() {
  return (
    <div className="w-full bg-[#12151C] rounded-xl border border-white/[0.06] shadow-sm p-8 sm:p-12 space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="border-b border-white/[0.06] pb-6 space-y-3 text-center sm:text-left">
        <div className="h-7 bg-white/[0.05] rounded-md w-3/5 mx-auto sm:mx-0"></div>
        <div className="h-4 bg-white/[0.03] rounded-md w-2/5 mx-auto sm:mx-0"></div>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
          <div className="h-3.5 bg-white/[0.04] rounded w-28"></div>
          <div className="h-3.5 bg-white/[0.04] rounded w-24"></div>
          <div className="h-3.5 bg-white/[0.04] rounded w-32"></div>
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="space-y-2.5">
        <div className="h-4 bg-white/[0.05] rounded w-28"></div>
        <div className="h-3 bg-white/[0.03] rounded w-full"></div>
        <div className="h-3 bg-white/[0.03] rounded w-11/12"></div>
      </div>

      {/* Experience Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="h-4 bg-white/[0.05] rounded w-32"></div>
        <div className="space-y-2 pl-1">
          <div className="flex justify-between items-center">
            <div className="h-3.5 bg-white/[0.04] rounded w-48"></div>
            <div className="h-3 bg-white/[0.04] rounded w-24"></div>
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 bg-white/[0.03] rounded w-full"></div>
            <div className="h-2.5 bg-white/[0.03] rounded w-11/12"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component shown when no resume has been uploaded yet (Calm Dark Theme)
 */
export function ResumePreviewEmpty({ onUploadClick: _onUploadClick, onLoadSampleClick }) {
  return (
    <div className="w-full bg-[#12151C] rounded-xl border border-dashed border-white/[0.08] p-8 sm:p-12 flex flex-col items-center justify-center text-center shadow-sm min-h-[460px]">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] text-[#ECEEF2] flex items-center justify-center mb-4 border border-white/[0.06]">
        <svg className="w-6 h-6 text-[#9AA1AE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-[#ECEEF2]">No Resume File Uploaded Yet</h3>
      <p className="text-[#9AA1AE] text-xs sm:text-sm max-w-md mt-1.5 mb-6 leading-relaxed">
        Upload your Microsoft Word (<span className="text-[#ECEEF2] font-medium">.docx</span>) resume to enable automatic GitHub commit bullet insertion and ATS score optimization.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-2.5">
        <a
          href="/upload"
          className="px-4 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-medium shadow-xs transition-colors flex items-center gap-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Upload Base Resume (.docx)</span>
        </a>

        {onLoadSampleClick && (
          <button
            type="button"
            onClick={onLoadSampleClick}
            className="px-3.5 py-2 rounded-lg bg-[#171B24] hover:bg-[#202531] text-[#ECEEF2] text-xs font-medium border border-white/[0.06] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <span>Preview Sample Template</span>
          </button>
        )}
      </div>

      <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-wrap justify-center items-center gap-5 text-xs text-[#6B7280]">
        <span className="flex items-center gap-1.5 font-normal">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span> Strict 1-Page Layout
        </span>
        <span className="flex items-center gap-1.5 font-normal">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span> ATS Screened
        </span>
        <span className="flex items-center gap-1.5 font-normal">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span> Word OpenXML Engine
        </span>
      </div>
    </div>
  );
}

/**
 * Reusable ResumePreview component styled with Calm Dark SaaS design:
 * - Outer surrounding container: dark slate panel with subtle border
 * - Printable Document Sheet: authentic white paper (#FFFFFF) with crisp high-contrast professional typography (#111827)
 */
function ResumePreview({
  data = defaultResumeData,
  isLoading = false,
  isEmpty = false,
  onUploadClick,
  onLoadSampleClick,
  className = ""
}) {
  if (isLoading) {
    return (
      <div className={`w-full max-w-[880px] mx-auto ${className}`}>
        <ResumePreviewSkeleton />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`w-full max-w-[880px] mx-auto ${className}`}>
        <ResumePreviewEmpty onUploadClick={onUploadClick} onLoadSampleClick={onLoadSampleClick} />
      </div>
    );
  }

  const resume = data || defaultResumeData;

  return (
    <div className={`w-full max-w-[880px] mx-auto transition-all ${className}`}>
      {/* 
        Surrounding Dark Surface Container with subtle border
      */}
      <div className="bg-[#12151C] p-3 sm:p-6 md:p-8 rounded-xl border border-white/[0.06] shadow-md">
        <div className="flex items-center justify-between pb-3 px-1 text-xs text-[#9AA1AE]">
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
            <span>Printable Word Document Canvas (US Letter)</span>
          </span>
          <span className="font-mono text-[11px] text-[#6B7280]">OpenXML .docx Engine</span>
        </div>

        {/* 
          Actual Printable Document:
          Authentic white surface, crisp soft shadow, realistic document styling
        */}
        <div 
          className="w-full bg-white text-[#111827] rounded-lg shadow-xl border border-black/10 p-6 sm:p-10 md:p-12 space-y-5 select-text overflow-hidden"
          style={{ minHeight: '940px' }}
        >
          {/* ================= HEADER SECTION ================= */}
          <header className="border-b-2 border-[#111827] pb-4 text-center sm:text-left space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#111827]">
                {resume.name || resume.candidateName || 'Candidate Name'}
              </h1>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#111827] text-white self-center sm:self-auto">
                AI Continuous Sync v2.4
              </span>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-[#374151] tracking-wide">
              {resume.title || resume.targetRole || resume.role || 'Software Engineer'}
            </p>

            {/* Contact Details */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-[#4B5563] pt-0.5">
              {resume.contact?.email && (
                <span className="flex items-center gap-1 font-normal">
                  <span className="text-[#6B7280]">✉</span>
                  {resume.contact.email}
                </span>
              )}
              {resume.contact?.phone && (
                <span className="flex items-center gap-1 font-normal">
                  <span className="text-[#6B7280]">☎</span>
                  {resume.contact.phone}
                </span>
              )}
              {resume.contact?.location && (
                <span className="flex items-center gap-1 font-normal">
                  <span className="text-[#6B7280]">📍</span>
                  {resume.contact.location}
                </span>
              )}
              {resume.contact?.github && (
                <span className="flex items-center gap-1 font-normal text-[#111827]">
                  <span className="text-[#6B7280]">⌥</span>
                  {resume.contact.github}
                </span>
              )}
              {resume.contact?.linkedin && (
                <span className="flex items-center gap-1 font-normal">
                  <span className="text-[#6B7280]">in</span>
                  {resume.contact.linkedin}
                </span>
              )}
            </div>
          </header>

          {/* ================= SUMMARY SECTION ================= */}
          {resume.summary && (
            <section className="space-y-1">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#111827] border-b border-black/10 pb-0.5">
                Professional Summary
              </h2>
              <p className="text-xs leading-relaxed text-[#374151] text-justify font-normal">
                {resume.summary}
              </p>
            </section>
          )}

          {/* ================= EXPERIENCE SECTION ================= */}
          {resume.experience && resume.experience.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#111827] border-b border-black/10 pb-0.5">
                Work Experience
              </h2>
              
              <div className="space-y-3">
                {resume.experience.map((exp, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">
                        {exp.role || exp.title} {exp.company && <><span className="font-normal text-[#9CA3AF]">|</span> <span className="font-semibold text-[#374151]">{exp.company}</span></>}
                      </span>
                      <span className="text-[11px] text-[#6B7280] font-normal">
                        {exp.period} • {exp.location}
                      </span>
                    </div>

                    <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-[#374151] leading-relaxed marker:text-[#F97316]">
                      {(exp.highlights || exp.bullets || []).map((point, pIdx) => (
                        <li key={pIdx}>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= PROJECTS SECTION ================= */}
          {resume.projects && resume.projects.length > 0 && (
            <section className="space-y-2.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#111827] border-b border-black/10 pb-0.5">
                Key Technical Projects
              </h2>

              <div className="space-y-2.5">
                {resume.projects.map((proj, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                      <span className="font-bold text-[#111827]">
                        {proj.name}
                        {proj.tech && (
                          <span className="font-normal text-[#6B7280] text-[11px] ml-1.5">
                            ({proj.tech})
                          </span>
                        )}
                      </span>
                      {proj.link && (
                        <span className="text-[11px] text-[#374151] font-normal hover:underline cursor-pointer">
                          {proj.link}
                        </span>
                      )}
                    </div>

                    <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-[#374151] leading-relaxed marker:text-[#F97316]">
                      {(proj.highlights || proj.bullets || []).map((point, pIdx) => (
                        <li key={pIdx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ================= TECHNICAL SKILLS ================= */}
          {resume.skills && (
            <section className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#111827] border-b border-black/10 pb-0.5">
                Core Technical Skills
              </h2>

              <div className="text-xs space-y-0.5 text-[#374151]">
                {(resume.skills.languages || resume.skills.language) && (
                  <div>
                    <span className="font-semibold text-[#111827]">Languages: </span>
                    <span>{Array.isArray(resume.skills.languages || resume.skills.language) ? (resume.skills.languages || resume.skills.language).join(", ") : String(resume.skills.languages || resume.skills.language)}</span>
                  </div>
                )}
                {(resume.skills.frameworks || resume.skills.framework) && (
                  <div>
                    <span className="font-semibold text-[#111827]">Frameworks & Libraries: </span>
                    <span>{Array.isArray(resume.skills.frameworks || resume.skills.framework) ? (resume.skills.frameworks || resume.skills.framework).join(", ") : String(resume.skills.frameworks || resume.skills.framework)}</span>
                  </div>
                )}
                {(resume.skills.tools || resume.skills.developerTools || resume.skills.devTools) && (
                  <div>
                    <span className="font-semibold text-[#111827]">Developer Tools & Platforms: </span>
                    <span>{Array.isArray(resume.skills.tools || resume.skills.developerTools || resume.skills.devTools) ? (resume.skills.tools || resume.skills.developerTools || resume.skills.devTools).join(", ") : String(resume.skills.tools || resume.skills.developerTools || resume.skills.devTools)}</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ================= EDUCATION ================= */}
          {resume.education && resume.education.length > 0 && (
            <section className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#111827] border-b border-black/10 pb-0.5">
                Education
              </h2>

              <div className="space-y-1">
                {resume.education.map((edu, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-[#111827]">{edu.degree}</span>
                      <span className="text-[#6B7280]"> — {edu.institution}</span>
                      {edu.honors && (
                        <span className="text-[11px] text-[#059669] font-medium ml-1">({edu.honors})</span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#6B7280] font-normal">{edu.year}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default React.memo(ResumePreview);
