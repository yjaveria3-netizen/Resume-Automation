import React from 'react';
import { Link } from 'react-router-dom';
import { isAuthenticated } from '../api/auth';

export default function Landing() {
  const authed = isAuthenticated();

  return (
    <div className="min-h-screen bg-gradient-to-b from-khaki-light/50 via-white to-khaki-light/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sage/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center space-y-6 sm:space-y-8">
          {/* Top Pill Announcement */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-khaki/50 shadow-2xs text-xs font-bold text-olive-wood animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sage-hover">Enterprise Update:</span>
            <span className="text-olive-wood/80 font-medium">Human Review Queue & 1-Page Layout Strictness</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-olive-wood tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Keep your resume <span className="text-sage underline decoration-sage/40">always in sync</span> with what you ship.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg md:text-xl text-olive-wood/75 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop forgetting to update your resume. Automatically turn your GitHub commits into quantified, ATS-optimized bullet points directly inserted into your Word resume without breaking the 1-page layout.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            {authed ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sage hover:bg-sage-hover text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Go to Dashboard</span>
                <span>→</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-sage hover:bg-sage-hover text-white text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 ring-4 ring-sage/15"
                >
                  <span>Get Started Free</span>
                  <span>→</span>
                </Link>
                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-khaki-light/60 text-olive-wood border border-khaki/50 text-sm font-extrabold shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                </Link>
              </>
            )}

            <Link
              to="/demo"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-khaki-light/60 text-olive-wood/80 hover:text-olive-wood border border-khaki/40 text-sm font-bold shadow-2xs transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 text-sage" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Explore Interactive Demo</span>
            </Link>
          </div>

          {/* Social Proof & Trust Badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-olive-wood/70 font-semibold">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Real OpenXML DOCX Updating
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Google Gemini AI Synthesis
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Strict 1-Page Line Budgeting
            </span>
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Real-Time ATS Keyword Scoring
            </span>
          </div>

          {/* Product UI Mockup Card Preview */}
          <div className="pt-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border border-khaki/50 p-4 sm:p-6 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 border-b border-khaki/30 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 font-mono text-olive-wood/60">resume-auto-updater.app</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-sage/15 text-sage font-extrabold text-[11px]">
                  Live Synchronized Preview
                </span>
              </div>

              {/* Sample Product Showcase Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-5 text-left items-start">
                {/* Left Mini-Widget: New Activity Alert */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-olive-wood flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        ■ GitHub Commit Detected
                      </span>
                      <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded-md border border-amber-300">
                        sha: 8f3a91c
                      </span>
                    </div>
                    <p className="text-xs text-olive-wood/80 font-medium">
                      "feat: add distributed caching and ATS keyword analysis"
                    </p>
                    <div className="p-2.5 rounded-xl bg-white/90 border border-khaki/40 text-xs text-olive-wood leading-relaxed font-sans">
                      <span className="font-semibold text-sage-hover">AI Generated Bullet: </span>
                      "Engineered distributed caching layer in Go and Redis, reducing P99 API latency by 45% across 20k daily requests."
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <span className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold shadow-2xs">
                        ✓ Accept & Insert into Resume
                      </span>
                    </div>
                  </div>

                  {/* 1-Page Line Budget Widget */}
                  <div className="p-4 rounded-2xl bg-white border border-khaki/40 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-extrabold">
                      <span className="text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        ■ 1-Page Optimal
                      </span>
                      <span className="text-olive-wood">38 / 45 lines used (Safe)</span>
                    </div>
                    <div className="w-full bg-khaki/20 rounded-full h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[84%]" />
                    </div>
                  </div>
                </div>

                {/* Right Mini-Widget: ATS Score & Keyword Match */}
                <div className="md:col-span-6 space-y-4">
                  <div className="p-4 rounded-2xl bg-white border border-khaki/40 shadow-xs flex items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] uppercase tracking-wider font-bold text-olive-wood/60">
                        ATS Screening Strength
                      </span>
                      <h4 className="text-2xl font-black text-olive-wood mt-0.5">94 / 100</h4>
                      <p className="text-xs text-emerald-700 font-semibold mt-0.5">Strong Match Tier • 1-Page Guard Active</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                      94%
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-khaki-light/30 border border-khaki/40 space-y-2">
                    <span className="text-xs font-bold text-olive-wood/80 uppercase tracking-wider block">
                      Target Job Matcher
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">✓ Python</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">✓ FastAPI</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">✓ PostgreSQL</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">✓ Docker</span>
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">✓ Redis</span>
                      <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold">+ Kubernetes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white border-y border-khaki/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sage-hover bg-sage/15 px-3 py-1 rounded-full border border-sage/30">
              Effortless Automation Loop
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-olive-wood tracking-tight">
              How the Automation Works
            </h2>
            <p className="text-sm sm:text-base text-olive-wood/70 max-w-xl mx-auto">
              From code commit to recruiter-ready resume in four seamless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Connect GitHub',
                desc: 'Authorize with 1-click. The engine tracks your repositories and commits without storing plaintext credentials.',
                badge: 'OAuth2 Secure',
              },
              {
                step: '02',
                title: 'Push Code as Usual',
                desc: 'Webhooks trigger whenever you ship features, bug fixes, or infrastructure improvements to your branches.',
                badge: 'Instant Webhooks',
              },
              {
                step: '03',
                title: 'AI Synthesizes Impact',
                desc: 'Gemini analyzes your commit diffs and drafts STAR-method bullets highlighting quantifiable engineering achievements.',
                badge: 'Gemini AI',
              },
              {
                step: '04',
                title: 'Review & 1-Click Update',
                desc: 'Approve or refine recommendations in your Review Queue. Your Word resume updates automatically without overflowing 1 page.',
                badge: '1-Page Strictness',
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-khaki-light/30 rounded-3xl p-6 border border-khaki/40 space-y-4 hover:border-sage/50 hover:bg-khaki-light/50 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-2xl font-black text-sage">
                      {card.step}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-khaki/50 text-olive-wood/70">
                      {card.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-olive-wood">
                    {card.title}
                  </h3>
                  <p className="text-xs text-olive-wood/75 leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 space-y-12">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-sage-hover bg-sage/15 px-3 py-1 rounded-full border border-sage/30">
            Engineered For Engineers
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-olive-wood tracking-tight">
            Built for Developer Career Acceleration
          </h2>
          <p className="text-sm sm:text-base text-olive-wood/70 max-w-xl mx-auto">
            Everything you need to showcase real work to technical hiring managers and automated ATS screeners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-7 rounded-3xl border border-khaki/40 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xl border border-emerald-200">
              📄
            </div>
            <h3 className="text-base font-extrabold text-olive-wood">Strict 1-Page Layout Protector</h3>
            <p className="text-xs text-olive-wood/75 leading-relaxed">
              Calculates line budgets dynamically. If a new project threatens page 2, Smart Swap prompts you to archive older projects while preserving typography.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-khaki/40 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold text-xl border border-amber-200">
              🎯
            </div>
            <h3 className="text-base font-extrabold text-olive-wood">Target Job Description Matcher</h3>
            <p className="text-xs text-olive-wood/75 leading-relaxed">
              Paste any job posting to immediately receive match score percentages, keyword coverage breakdown, and targeted tips to optimize your screening rank.
            </p>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-khaki/40 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-xl border border-sky-200">
              🛡️
            </div>
            <h3 className="text-base font-extrabold text-olive-wood">Human-in-the-Loop Review Queue</h3>
            <p className="text-xs text-olive-wood/75 leading-relaxed">
              AI recommendations never touch your resume unannounced. Edit bullets inline, accept changes, or dismiss items with complete editorial autonomy.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-16 bg-gradient-to-r from-olive-wood via-olive-wood to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to automate your engineering resume?
          </h2>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-medium">
            Join engineers keeping their career portfolios effortlessly current. Create your free account in under 30 seconds.
          </p>
          <div className="pt-2">
            <Link
              to={authed ? '/dashboard' : '/signup'}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-sage hover:bg-sage-hover text-white text-sm font-extrabold shadow-lg transition-all active:scale-[0.99]"
            >
              <span>{authed ? 'Open Your Dashboard' : 'Create Free Account Now'}</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="py-10 bg-white border-t border-khaki/30 text-xs text-olive-wood/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-sage text-white flex items-center justify-center font-extrabold text-xs">
              R
            </div>
            <span className="font-extrabold text-sm text-olive-wood">Resume Auto-Updater</span>
            <span className="text-olive-wood/40">|</span>
            <span>AI Continuous Sync Engine</span>
          </div>
          <div className="flex items-center gap-5 font-medium">
            <Link to="/demo" className="hover:text-olive-wood transition-colors">
              Product Demo
            </Link>
            <Link to="/login" className="hover:text-olive-wood transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-olive-wood transition-colors">
              Sign Up
            </Link>
          </div>
          <p className="text-olive-wood/50">
            © {new Date().getFullYear()} Resume Auto-Updater. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
