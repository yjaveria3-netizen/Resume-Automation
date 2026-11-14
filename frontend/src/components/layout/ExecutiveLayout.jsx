import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { getUser, logout } from '../../api/auth';

/**
 * ExecutiveLayout Component
 *
 * Implements a calm, premium, professional dark SaaS layout:
 * - 240px Left Sidebar with subtle active indicators (2px orange left bar + soft tint)
 * - 64px Top Header with Breadcrumbs, ⌘K search, neutral GitHub status chip, and primary action
 * - Base canvas #0B0D12 with soft #12151C cards
 */
export default function ExecutiveLayout({
  children,
  breadcrumbs = [{ label: 'Dashboard', path: '/dashboard' }, { label: 'Overview' }],
  actions = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut ⌘K / Ctrl+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Dispatch custom event and filter main page elements based on search query
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    window.dispatchEvent(new CustomEvent('executive_search', { detail: { query } }));
    applyDOMFilter(query);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('executive_search', { detail: { query: searchQuery } }));
    applyDOMFilter(searchQuery);
  };

  const applyDOMFilter = (rawQuery) => {
    const q = (rawQuery || '').trim().toLowerCase();
    const mainEl = document.querySelector('main');
    if (!mainEl) return;

    // Reset all previous search filtering
    const allFiltered = mainEl.querySelectorAll('[data-search-hidden]');
    allFiltered.forEach((el) => {
      el.removeAttribute('data-search-hidden');
      el.style.display = '';
    });

    if (!q) return;

    // Filter card containers or sections within main
    const filterableCards = mainEl.querySelectorAll('.rounded-\\[16px\\], .rounded-xl, .rounded-lg, section');
    filterableCards.forEach((card) => {
      // Don't filter out modals or small child buttons
      if (card.closest('.fixed') || card.closest('[role="dialog"]')) return;
      const text = card.textContent?.toLowerCase() || '';
      if (!text.includes(q)) {
        card.setAttribute('data-search-hidden', 'true');
        card.style.display = 'none';
      }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  const userDisplayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Engineer');

  const navLinkClasses = ({ isActive }) =>
    `group flex items-center justify-between px-3.5 py-2.5 text-sm transition-colors duration-150 border-l-2 ${
      isActive
        ? 'bg-[rgba(249,115,22,0.10)] border-[#F97316] text-[#ECEEF2] font-medium'
        : 'border-transparent text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04]'
    }`;

  const navIconClasses = (isActive) =>
    `w-4 h-4 transition-colors ${isActive ? 'text-[#F97316]' : 'text-[#6B7280] group-hover:text-[#9AA1AE]'}`;

  return (
    <div className="min-h-screen bg-[#0B0D12] text-[#ECEEF2] flex font-sans antialiased selection:bg-[#F97316] selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* ================= LEFT SIDEBAR (240px) ================= */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-[#0B0D12] border-r border-white/[0.06] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header (64px) */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/[0.06]">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-[8px] bg-[#171B24] border border-white/[0.08] flex items-center justify-center text-[#ECEEF2] font-semibold text-xs transition-colors group-hover:border-white/[0.16]">
              <span>R</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] ml-0.5"></span>
            </div>
            <span className="font-semibold text-sm tracking-tight text-[#ECEEF2]">
              Resume Auto-Updater
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-[#9AA1AE] hover:text-[#ECEEF2] p-1 rounded-[6px]"
          >
            ✕
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Main Menu */}
          <div>
            <div className="px-4 pb-2 text-[11px] font-medium uppercase tracking-[0.04em] text-[#6B7280]">
              Menu
            </div>
            <div className="space-y-0.5">
              <NavLink to="/dashboard" className={navLinkClasses}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <svg className={navIconClasses(isActive)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    <span>Dashboard</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/demo" className={navLinkClasses}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <svg className={navIconClasses(isActive)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Live Showcase</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/upload" className={navLinkClasses}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <svg className={navIconClasses(isActive)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Upload Master</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/ats-test" className={navLinkClasses}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <svg className={navIconClasses(isActive)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>ATS Scoring</span>
                  </div>
                )}
              </NavLink>

              <NavLink to="/preview-test" className={navLinkClasses}>
                {({ isActive }) => (
                  <div className="flex items-center gap-2.5">
                    <svg className={navIconClasses(isActive)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Document Preview</span>
                  </div>
                )}
              </NavLink>
            </div>
          </div>
        </div>

        {/* Quiet status line above user profile */}
        <div className="px-5 py-2 text-xs text-[#6B7280] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
          <span>Sync active</span>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-3.5 border-t border-white/[0.06] bg-[#0B0D12]">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#171B24] border border-white/[0.08] text-[#ECEEF2] flex items-center justify-center font-medium text-xs shrink-0">
                {userInitial}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium text-[#ECEEF2] truncate">{userDisplayName}</p>
                <p className="text-xs text-[#6B7280] truncate">{user?.email || 'Pro Member'}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 text-[#6B7280] hover:text-[#F87171] hover:bg-white/[0.04] rounded-[8px] transition-colors cursor-pointer"
              title="Sign Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MAIN WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        {/* ================= TOP HEADER BAR (64px) ================= */}
        <header className="h-16 sticky top-0 z-30 bg-[#0B0D12]/90 backdrop-blur-md border-b border-white/[0.06] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-[8px] text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Breadcrumb Path */}
            <nav className="flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span className="text-[#6B7280]">/</span>}
                  {b.path ? (
                    <Link to={b.path} className="text-[#9AA1AE] hover:text-[#ECEEF2] transition-colors">
                      {b.label}
                    </Link>
                  ) : (
                    <span className="text-[#ECEEF2] font-medium">{b.label}</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Center: Search input */}
          <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#6B7280]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-10 py-1.5 rounded-[8px] border border-white/[0.06] bg-[#12151C] text-sm text-[#ECEEF2] placeholder-[#6B7280] focus:outline-none focus:border-white/[0.16] transition-colors"
              />
              <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[#6B7280]">
                  ⌘K
                </kbd>
              </span>
            </form>
          </div>

          {/* Right: Actions & Live Status Chip */}
          <div className="flex items-center gap-3">
            {/* Small neutral GitHub status chip */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-xs text-[#9AA1AE]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              <span>GitHub connected</span>
            </div>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notificationRef}>
              <button
                type="button"
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={`p-2 rounded-[8px] transition-colors relative cursor-pointer ${
                  notificationOpen
                    ? 'text-[#ECEEF2] bg-white/[0.08]'
                    : 'text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04]'
                }`}
                title="Notifications"
                aria-expanded={notificationOpen}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {/* Notification indicator dot */}
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F97316] ring-2 ring-[#0B0D12]" />
              </button>

              {/* Notification Dropdown Panel */}
              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#12151C] border border-white/[0.08] shadow-2xl py-2 z-50 animate-scale-in text-[#ECEEF2]">
                  <div className="px-4 py-2 border-b border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs tracking-tight text-[#ECEEF2]">Notifications</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
                        3 New
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationOpen(false)}
                      className="text-xs text-[#6B7280] hover:text-[#ECEEF2] transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-white/[0.04]">
                    <div className="p-3 hover:bg-white/[0.02] transition-colors flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#34D399] shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#ECEEF2]">GitHub Commit Synced</p>
                        <p className="text-[11px] text-[#9AA1AE] mt-0.5 line-clamp-2">
                          New commits detected from your connected repository. 1 new bullet proposed.
                        </p>
                        <span className="text-[10px] text-[#6B7280] font-mono mt-1 block">5 minutes ago</span>
                      </div>
                    </div>

                    <div className="p-3 hover:bg-white/[0.02] transition-colors flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#ECEEF2]">Review Queue Pending</p>
                        <p className="text-[11px] text-[#9AA1AE] mt-0.5 line-clamp-2">
                          Review pending AI bullet suggestions in the Suggestions Queue before final export.
                        </p>
                        <span className="text-[10px] text-[#6B7280] font-mono mt-1 block">1 hour ago</span>
                      </div>
                    </div>

                    <div className="p-3 hover:bg-white/[0.02] transition-colors flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-white/[0.3] shrink-0 mt-1.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#ECEEF2]">1-Page Line Budget Safe</p>
                        <p className="text-[11px] text-[#9AA1AE] mt-0.5 line-clamp-2">
                          Resume layout strictly maintains single-page geometry with 0 overflow warnings.
                        </p>
                        <span className="text-[10px] text-[#6B7280] font-mono mt-1 block">Today</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-4 py-2 border-t border-white/[0.06] bg-[#0B0D12]/50 text-center">
                    <span className="text-[11px] text-[#9AA1AE] hover:text-[#ECEEF2] transition-colors cursor-pointer">
                      All systems synchronized
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Single Action Slot (e.g. Upload Master) */}
            {actions}
          </div>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        <main className="flex-1 p-6 lg:p-8 space-y-8 max-w-[1400px]">
          {children}
        </main>
      </div>
    </div>
  );
}
