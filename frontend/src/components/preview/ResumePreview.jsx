import React from 'react';

/**
 * Default mock resume data used for the preview panel
 */
export const defaultResumeData = {
  name: "Alex Morgan",
  title: "Senior Full-Stack Engineer & AI Integrator",
  contact: {
    email: "alex.morgan@example.com",
    phone: "+1 (555) 234-5678",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan-dev",
    website: "alexmorgan.io"
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
      tech: "React, Tailwind CSS, FastAPI, PostgreSQL, OpenAI API",
      link: "github.com/alexmorgan-dev/resume-auto-updater",
      highlights: [
        "Engineered continuous GitHub repository sync that automatically parses commits, generates verified skill impact bullets, and updates resume builds.",
        "Achieved ATS keyword matching scores >92% across top industry job descriptions."
      ]
    },
    {
      name: "Distributed Task Orchestrator",
      tech: "Go, Docker, Redis Streams, gRPC",
      link: "github.com/alexmorgan-dev/task-mesh",
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
 * Shimmer skeleton placeholder component for the loading state
 */
export function ResumePreviewSkeleton() {
  return (
    <div className="w-full bg-white rounded-lg border border-khaki/30 shadow-lg p-8 sm:p-12 space-y-6 animate-pulse select-none">
      {/* Header Skeleton */}
      <div className="border-b border-khaki/30 pb-6 space-y-3 text-center sm:text-left">
        <div className="h-8 bg-khaki/20 rounded-md w-3/5 mx-auto sm:mx-0"></div>
        <div className="h-4 bg-sage/20 rounded-md w-2/5 mx-auto sm:mx-0"></div>
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
          <div className="h-3.5 bg-khaki/20 rounded w-28"></div>
          <div className="h-3.5 bg-khaki/20 rounded w-24"></div>
          <div className="h-3.5 bg-khaki/20 rounded w-32"></div>
          <div className="h-3.5 bg-khaki/20 rounded w-24"></div>
        </div>
      </div>

      {/* Summary Skeleton */}
      <div className="space-y-2.5">
        <div className="h-4 bg-olive-wood/20 rounded w-24"></div>
        <div className="h-3 bg-khaki/20 rounded w-full"></div>
        <div className="h-3 bg-khaki/20 rounded w-11/12"></div>
        <div className="h-3 bg-khaki/20 rounded w-4/5"></div>
      </div>

      {/* Experience Skeleton */}
      <div className="space-y-4 pt-2">
        <div className="h-4 bg-olive-wood/20 rounded w-28"></div>
        
        {/* Item 1 */}
        <div className="space-y-2 pl-1">
          <div className="flex justify-between items-center">
            <div className="h-3.5 bg-khaki/30 rounded w-48"></div>
            <div className="h-3 bg-khaki/20 rounded w-24"></div>
          </div>
          <div className="h-3 bg-sage/20 rounded w-36"></div>
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 bg-khaki/20 rounded w-full"></div>
            <div className="h-2.5 bg-khaki/20 rounded w-11/12"></div>
            <div className="h-2.5 bg-khaki/20 rounded w-4/5"></div>
          </div>
        </div>

        {/* Item 2 */}
        <div className="space-y-2 pl-1 pt-2">
          <div className="flex justify-between items-center">
            <div className="h-3.5 bg-khaki/30 rounded w-44"></div>
            <div className="h-3 bg-khaki/20 rounded w-20"></div>
          </div>
          <div className="h-3 bg-sage/20 rounded w-32"></div>
          <div className="space-y-1.5 pt-1">
            <div className="h-2.5 bg-khaki/20 rounded w-full"></div>
            <div className="h-2.5 bg-khaki/20 rounded w-5/6"></div>
          </div>
        </div>
      </div>

      {/* Projects Skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-4 bg-olive-wood/20 rounded w-32"></div>
        <div className="space-y-2 pl-1">
          <div className="h-3.5 bg-khaki/30 rounded w-56"></div>
          <div className="h-2.5 bg-khaki/20 rounded w-full"></div>
          <div className="h-2.5 bg-khaki/20 rounded w-10/12"></div>
        </div>
      </div>

      {/* Skills Skeleton */}
      <div className="space-y-3 pt-2">
        <div className="h-4 bg-olive-wood/20 rounded w-20"></div>
        <div className="space-y-2 pl-1">
          <div className="h-3 bg-khaki/20 rounded w-11/12"></div>
          <div className="h-3 bg-khaki/20 rounded w-4/5"></div>
          <div className="h-3 bg-khaki/20 rounded w-3/4"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component shown when no resume has been uploaded yet
 */
export function ResumePreviewEmpty({ onUploadClick }) {
  return (
    <div className="w-full bg-white rounded-lg border-2 border-dashed border-khaki/60 p-8 sm:p-16 flex flex-col items-center justify-center text-center shadow-sm min-h-[500px]">
      <div className="w-16 h-16 rounded-2xl bg-sage/15 text-sage flex items-center justify-center mb-4 ring-8 ring-sage/5">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-olive-wood">No Resume Preview Available</h3>
      <p className="text-olive-wood/70 text-sm max-w-md mt-2 mb-6">
        Upload your master resume in <span className="font-semibold text-olive-wood">.docx</span> or <span className="font-semibold text-olive-wood">.pdf</span> format to preview auto-generated updates, tailored bullets, and ATS optimization.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        {onUploadClick ? (
          <button
            type="button"
            onClick={onUploadClick}
            className="px-6 py-2.5 rounded-xl bg-sage text-white font-medium shadow-md hover:bg-sage-hover transition-all flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Resume Now
          </button>
        ) : (
          <a
            href="/upload"
            className="px-6 py-2.5 rounded-xl bg-sage text-white font-medium shadow-md hover:bg-sage-hover transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload Resume Now
          </a>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-khaki/30 flex items-center gap-6 text-xs text-olive-wood/60">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> US Letter (8.5" x 11")
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> ATS Compatible
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> DOCX / PDF Export
        </span>
      </div>
    </div>
  );
}

/**
 * Reusable ResumePreview component styled with Tailwind
 *
 * @param {Object} props
 * @param {Object} [props.data] - Resume data object
 * @param {boolean} [props.isLoading=false] - When true, renders the shimmer skeleton
 * @param {boolean} [props.isEmpty=false] - When true, renders the empty state prompt
 * @param {Function} [props.onUploadClick] - Optional upload trigger callback
 * @param {string} [props.className=""] - Additional class names for container
 */
export default function ResumePreview({
  data = defaultResumeData,
  isLoading = false,
  isEmpty = false,
  onUploadClick,
  className = ""
}) {
  if (isLoading) {
    return (
      <div className={`w-full max-w-[850px] mx-auto ${className}`}>
        <ResumePreviewSkeleton />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={`w-full max-w-[850px] mx-auto ${className}`}>
        <ResumePreviewEmpty onUploadClick={onUploadClick} />
      </div>
    );
  }

  const resume = data || defaultResumeData;

  return (
    <div className={`w-full max-w-[850px] mx-auto transition-all ${className}`}>
      {/* 
        US Letter Aspect Ratio Container: 8.5 / 11 (~1:1.2941)
        Styled with crisp white background, subtle border, gentle shadow (shadow-lg), 
        and realistic resume margin padding
      */}
      <div 
        className="w-full bg-white text-olive-wood rounded-lg border border-khaki/40 shadow-lg shadow-black/5 p-6 sm:p-10 md:p-12 space-y-6 select-text overflow-hidden transition-shadow hover:shadow-xl"
        style={{ minHeight: '1000px' }}
      >
        {/* ================= HEADER SECTION ================= */}
        <header className="border-b-2 border-sage/40 pb-5 text-center sm:text-left space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-olive-wood">
              {resume.name || resume.candidateName || 'Candidate Name'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sage/15 text-sage border border-sage/30 self-center sm:self-auto">
              AI Optimized v2.4
            </span>
          </div>

          <p className="text-sm font-semibold text-sage-hover tracking-wide">
            {resume.title || resume.targetRole || resume.role || 'Software Engineer'}
          </p>

          {/* Contact Details */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-olive-wood/75 pt-1">
            {resume.contact?.email && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {resume.contact.email}
              </span>
            )}
            {resume.contact?.phone && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {resume.contact.phone}
              </span>
            )}
            {resume.contact?.location && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {resume.contact.location}
              </span>
            )}
            {resume.contact?.github && (
              <span className="flex items-center gap-1 text-olive-wood">
                <svg className="w-3.5 h-3.5 text-sage" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                {resume.contact.github}
              </span>
            )}
            {resume.contact?.linkedin && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-sage" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                {resume.contact.linkedin}
              </span>
            )}
          </div>
        </header>

        {/* ================= SUMMARY SECTION ================= */}
        {resume.summary && (
          <section className="space-y-1.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-olive-wood border-b border-khaki/30 pb-1">
              Professional Summary
            </h2>
            <p className="text-xs leading-relaxed text-olive-wood/85 text-justify">
              {resume.summary}
            </p>
          </section>
        )}

        {/* ================= EXPERIENCE SECTION ================= */}
        {resume.experience && resume.experience.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-olive-wood border-b border-khaki/30 pb-1">
              Work Experience
            </h2>
            
            <div className="space-y-3.5">
              {resume.experience.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <span className="font-bold text-olive-wood">
                      {exp.role || exp.title} {exp.company && <><span className="font-normal text-olive-wood/70">|</span> <span className="font-semibold text-sage-hover">{exp.company}</span></>}
                    </span>
                    <span className="text-[11px] text-olive-wood/60 font-medium">
                      {exp.period} • {exp.location}
                    </span>
                  </div>

                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-olive-wood/85 leading-relaxed marker:text-sage">
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
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-olive-wood border-b border-khaki/30 pb-1">
              Key Technical Projects
            </h2>

            <div className="space-y-3">
              {resume.projects.map((proj, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                    <span className="font-bold text-olive-wood">
                      {proj.name}
                      {proj.tech && (
                        <span className="font-normal text-olive-wood/60 text-[11px] ml-2">
                          ({proj.tech})
                        </span>
                      )}
                    </span>
                    {proj.link && (
                      <span className="text-[11px] text-sage font-medium hover:underline cursor-pointer">
                        {proj.link}
                      </span>
                    )}
                  </div>

                  <ul className="list-disc list-outside pl-4 space-y-0.5 text-xs text-olive-wood/85 leading-relaxed marker:text-sage">
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
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-olive-wood border-b border-khaki/30 pb-1">
              Core Technical Skills
            </h2>

            <div className="text-xs space-y-1 text-olive-wood/85">
              {(resume.skills.languages || resume.skills.language) && (
                <div>
                  <span className="font-bold text-olive-wood">Languages: </span>
                  <span>{Array.isArray(resume.skills.languages || resume.skills.language) ? (resume.skills.languages || resume.skills.language).join(", ") : String(resume.skills.languages || resume.skills.language)}</span>
                </div>
              )}
              {(resume.skills.frameworks || resume.skills.framework) && (
                <div>
                  <span className="font-bold text-olive-wood">Frameworks & Libraries: </span>
                  <span>{Array.isArray(resume.skills.frameworks || resume.skills.framework) ? (resume.skills.frameworks || resume.skills.framework).join(", ") : String(resume.skills.frameworks || resume.skills.framework)}</span>
                </div>
              )}
              {(resume.skills.tools || resume.skills.developerTools || resume.skills.devTools) && (
                <div>
                  <span className="font-bold text-olive-wood">Developer Tools & Platforms: </span>
                  <span>{Array.isArray(resume.skills.tools || resume.skills.developerTools || resume.skills.devTools) ? (resume.skills.tools || resume.skills.developerTools || resume.skills.devTools).join(", ") : String(resume.skills.tools || resume.skills.developerTools || resume.skills.devTools)}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ================= EDUCATION ================= */}
        {resume.education && resume.education.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-olive-wood border-b border-khaki/30 pb-1">
              Education
            </h2>

            <div className="space-y-1.5">
              {resume.education.map((edu, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-olive-wood">{edu.degree}</span>
                    <span className="text-olive-wood/70"> — {edu.institution}</span>
                    {edu.honors && (
                      <span className="text-[11px] text-sage font-medium ml-1.5">({edu.honors})</span>
                    )}
                  </div>
                  <span className="text-[11px] text-olive-wood/60 font-medium">{edu.year}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
