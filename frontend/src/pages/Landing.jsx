import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';

export default function Landing() {
  const authed = isAuthenticated();

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#ECEEF2] selection:bg-[#F97316] selection:text-white">
      {/* ================= HERO SECTION ================= */}
      <section className="relative overflow-hidden pt-16 pb-24 sm:pt-24 sm:pb-32 hero-radial-glow">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 relative z-10 text-center space-y-8">
          {/* Quiet Neutral Announcement Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs text-[#9AA1AE]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            <span>Continuous GitHub Sync & ATS Scoring</span>
          </div>

          {/* Clean 2-Line Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold text-[#ECEEF2] tracking-[-0.02em] leading-[1.1] max-w-3xl mx-auto [text-wrap:balance]">
            Your resume, <span className="text-[#F97316]">always up to date</span>.
          </h1>

          {/* Calmer Subtext */}
          <p className="text-base sm:text-lg text-[#9AA1AE] max-w-[560px] mx-auto leading-relaxed">
            Turn your GitHub commits into quantified, ATS-optimized bullet points — inserted straight into your Word resume, still on one page.
          </p>

          {/* Single Primary CTA + Quiet Ghost Link */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            {authed ? (
              <Link to="/dashboard" className="btn-primary w-full sm:w-auto">
                <span>Go to Dashboard</span>
                <span>→</span>
              </Link>
            ) : (
              <Link to="/signup" className="btn-primary w-full sm:w-auto">
                <span>Get started free</span>
                <span>→</span>
              </Link>
            )}

            <Link to="/demo" className="btn-ghost w-full sm:w-auto">
              <span>Explore Interactive Demo</span>
            </Link>
          </div>

          {/* 4 Feature Items — Quiet, evenly spaced text-muted row */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              OpenXML DOCX Engine
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Gemini AI Synthesis
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              1-Page Line Budgeting
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#34D399]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              ATS Keyword Scoring
            </span>
          </div>

          {/* Product Preview Card */}
          <div className="pt-8 max-w-4xl mx-auto relative">
            {/* Soft subtle glow behind preview card (≤8% opacity) */}
            <div className="absolute inset-0 bg-[#F97316]/[0.05] rounded-[24px] blur-2xl pointer-events-none transform -translate-y-2" />

            <div className="relative bg-[#12151C] rounded-[16px] border border-white/[0.06] p-5 sm:p-7 shadow-2xl text-left">
              {/* Window Bar with Neutral Gray Dots */}
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.06] text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.2]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.2]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-white/[0.2]" />
                  <span className="ml-2 font-mono text-xs text-[#6B7280]">resume-auto-updater.app</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-[11px]">
                  Live Preview
                </span>
              </div>

              {/* Sample Product Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 text-left items-start">
                {/* Left Mini-Widget: Commit Activity */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-4 rounded-[12px] bg-[#171B24] border border-white/[0.06] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-[#ECEEF2] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                        GitHub commit detected
                      </span>
                      <span className="text-[11px] font-mono text-[#6B7280]">
                        8f3a91c
                      </span>
                    </div>
                    <p className="text-xs text-[#ECEEF2] font-normal">
                      "feat: add distributed caching and ATS keyword analysis"
                    </p>
                    <div className="p-3 rounded-[8px] bg-[#12151C] border border-white/[0.06] text-xs text-[#9AA1AE] leading-relaxed">
                      <span className="text-[#F97316] font-medium">Proposed Bullet: </span>
                      "Engineered distributed caching layer in Go and Redis, reducing P99 API latency by 45% across 20k daily requests."
                    </div>
                    <div className="flex items-center justify-end pt-1">
                      <span className="px-3 py-1 rounded-[8px] bg-white/[0.06] hover:bg-white/[0.10] text-[#ECEEF2] text-xs font-medium border border-white/[0.08] transition-colors">
                        Insert into resume
                      </span>
                    </div>
                  </div>

                  {/* 1-Page Line Budget Widget */}
                  <div className="p-4 rounded-[12px] bg-[#171B24] border border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#34D399] font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]"></span>
                        Strict 1-page layout
                      </span>
                      <span className="text-[#6B7280] font-mono tabular-nums">38 / 42 lines</span>
                    </div>
                    <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#34D399] h-full rounded-full w-[85%]" />
                    </div>
                  </div>
                </div>

                {/* Right Mini-Widget: ATS Score & Keyword Match */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-4 rounded-[12px] bg-[#171B24] border border-white/[0.06] flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-[0.04em] text-[#6B7280]">
                        ATS Readiness Score
                      </span>
                      <div className="text-3xl font-semibold text-[#ECEEF2] mt-0.5 tabular-nums">94 / 100</div>
                      <p className="text-xs text-[#34D399] mt-0.5">Strong match • 1-page budget preserved</p>
                    </div>
                    <div className="w-12 h-12 rounded-[12px] bg-white/[0.04] border border-white/[0.08] text-[#34D399] flex items-center justify-center font-semibold text-lg tabular-nums">
                      94%
                    </div>
                  </div>

                  <div className="p-4 rounded-[12px] bg-[#171B24] border border-white/[0.06] space-y-2">
                    <span className="text-xs text-[#ECEEF2] font-medium block">
                      Target Role Alignment
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">Python</span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">FastAPI</span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">PostgreSQL</span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-white/[0.04] text-[#9AA1AE] border border-white/[0.06] text-xs">Docker</span>
                      <span className="px-2 py-0.5 rounded-[6px] bg-[rgba(249,115,22,0.10)] text-[#FB9233] border border-[#F97316]/20 text-xs">+ Kubernetes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section className="py-24 border-t border-white/[0.06]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[#ECEEF2] tracking-tight">
              How the automation works
            </h2>
            <p className="text-sm text-[#9AA1AE] max-w-lg mx-auto">
              From code commit to recruiter-ready resume in four seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Connect GitHub',
                desc: 'Authorize with one click. Tracks commits securely without storing plaintext credentials.',
              },
              {
                step: '02',
                title: 'Ship code as usual',
                desc: 'Webhooks trigger automatically whenever you ship features, bug fixes, or infrastructure.',
              },
              {
                step: '03',
                title: 'AI drafts impact',
                desc: 'Gemini analyzes your commit diffs and synthesizes quantifiable accomplishment statements.',
              },
              {
                step: '04',
                title: 'One-click update',
                desc: 'Review and approve suggestions. Your Word document updates without overflowing 1 page.',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-[#12151C] rounded-[16px] p-6 border border-white/[0.06] space-y-4 hover:border-white/[0.12] transition-colors"
              >
                <span className="font-mono text-xs text-[#F97316]">
                  {card.step}
                </span>
                <h3 className="text-base font-semibold text-[#ECEEF2]">
                  {card.title}
                </h3>
                <p className="text-sm text-[#9AA1AE] leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CORE FEATURES GRID ================= */}
      <section className="py-24 border-t border-white/[0.06] max-w-[1200px] mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[#ECEEF2] tracking-tight">
            Engineered for developers
          </h2>
          <p className="text-sm text-[#9AA1AE] max-w-lg mx-auto">
            Everything you need to showcase real work to technical hiring managers and automated ATS screeners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#12151C] p-6 rounded-[16px] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition-colors">
            <h3 className="text-base font-semibold text-[#ECEEF2]">Strict 1-Page Layout Protector</h3>
            <p className="text-sm text-[#9AA1AE] leading-relaxed">
              Dynamically calculates line counts. If a new entry risks spilling onto page 2, Smart Swap prompts you to archive older entries while preserving original typography.
            </p>
          </div>

          <div className="bg-[#121824] p-6 rounded-[16px] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition-colors">
            <h3 className="text-base font-semibold text-[#ECEEF2]">Target Job Description Matcher</h3>
            <p className="text-sm text-[#9AA1AE] leading-relaxed">
              Paste any target job description to instantly see ATS keyword overlap, missing technical qualifications, and targeted phrasing recommendations.
            </p>
          </div>

          <div className="bg-[#121824] p-6 rounded-[16px] border border-white/[0.06] space-y-3 hover:border-white/[0.12] transition-colors">
            <h3 className="text-base font-semibold text-[#ECEEF2]">Editorial Review Queue</h3>
            <p className="text-sm text-[#9AA1AE] leading-relaxed">
              AI recommendations never touch your master resume unannounced. Edit text inline, accept suggestions, or dismiss entries with complete editorial autonomy.
            </p>
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION BANNER ================= */}
      <section className="py-24 bg-[#0B0D12] border-t border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#ECEEF2]">
            Keep your resume current with every commit.
          </h2>
          <p className="text-sm text-[#9AA1AE] leading-relaxed">
            Create an account to connect your GitHub repositories and start generating verified bullet points.
          </p>
          <div className="pt-2">
            <Link
              to={authed ? '/dashboard' : '/signup'}
              className="btn-primary"
            >
              <span>{authed ? 'Open Dashboard' : 'Get started free'}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-8 border-t border-white/[0.06] text-xs text-[#6B7280]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-[#ECEEF2]">Resume Auto-Updater</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/demo" className="text-[#9AA1AE] hover:text-[#ECEEF2] transition-colors">
              Live Showcase
            </Link>
            <Link to="/login" className="text-[#9AA1AE] hover:text-[#ECEEF2] transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="text-[#9AA1AE] hover:text-[#ECEEF2] transition-colors">
              Sign Up
            </Link>
          </div>
          <p className="text-[#6B7280]">
            © {new Date().getFullYear()} Resume Auto-Updater. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
