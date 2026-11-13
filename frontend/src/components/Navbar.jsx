import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser, logout } from '../api/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [user, setUser] = useState(getUser());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleAuthChange = () => {
      setAuthenticated(isAuthenticated());
      setUser(getUser());
    };

    window.addEventListener('auth_change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth_change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Update on route change & close menus
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setUser(getUser());
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  // Click outside listener for user menu dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide standalone top navbar on routes rendered within ExecutiveLayout
  const isExecutiveRoute = [
    '/dashboard',
    '/upload',
    '/demo',
    '/qa',
    '/preview-test',
    '/preview',
    '/ats-test',
    '/ats',
  ].includes(location.pathname);

  if (isExecutiveRoute) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    setUserMenuOpen(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-[8px] text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'text-[#ECEEF2] bg-white/[0.06]'
        : 'text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04]'
    }`;

  const userInitial = user?.name
    ? user.name.charAt(0).toUpperCase()
    : user?.email
    ? user.email.charAt(0).toUpperCase()
    : 'U';

  const userDisplayName = user?.name || (user?.email ? user.email.split('@')[0] : 'Engineer');

  return (
    <header className="h-16 bg-[#0B0D12] border-b border-white/[0.06] sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-8 h-8 rounded-[8px] bg-[#171B24] border border-white/[0.08] flex items-center justify-center text-[#ECEEF2] font-semibold text-sm transition-colors group-hover:border-white/[0.16]">
            <span>R</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] ml-0.5"></span>
          </div>
          <span className="font-semibold text-sm text-[#ECEEF2] tracking-tight">
            Resume Auto-Updater
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1.5">
          <NavLink to="/demo" className={navLinkClass}>
            Live Showcase
          </NavLink>

          {authenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" className={navLinkClass}>
                Upload Resume
              </NavLink>

              {/* User Dropdown Menu */}
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-[10px] bg-[#12151C] hover:bg-[#171B24] border border-white/[0.08] text-sm font-medium transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#171B24] border border-white/[0.12] text-[#ECEEF2] flex items-center justify-center font-medium text-xs">
                    {userInitial}
                  </div>
                  <span className="text-sm font-medium text-[#ECEEF2] max-w-[140px] truncate">
                    {userDisplayName}
                  </span>
                  <svg
                    className={`w-3.5 h-3.5 text-[#9AA1AE] transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-[12px] bg-[#12151C] border border-white/[0.08] shadow-xl py-1.5 z-50 animate-scale-in">
                    <div className="px-3.5 py-2 border-b border-white/[0.06]">
                      <p className="text-xs text-[#9AA1AE]">Signed in as</p>
                      <p className="text-sm font-medium text-[#ECEEF2] truncate mt-0.5">
                        {user?.email || userDisplayName}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-3.5 py-2 text-sm text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04] transition-colors"
                      >
                        Dashboard Overview
                      </Link>
                      <Link
                        to="/upload"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-3.5 py-2 text-sm text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04] transition-colors"
                      >
                        Upload Master (.docx)
                      </Link>
                    </div>
                    <div className="pt-1 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2 text-sm text-[#F87171] hover:bg-white/[0.04] transition-colors flex items-center justify-between"
                      >
                        <span>Sign Out</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2 pl-2">
              <NavLink to="/login" className="px-3 py-1.5 text-sm font-medium text-[#9AA1AE] hover:text-[#ECEEF2] transition-colors">
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="btn-primary h-9 text-xs font-medium"
              >
                Get Started
              </NavLink>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-[8px] text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0D12] border-b border-white/[0.06] px-4 py-3 space-y-1.5 animate-fade-in">
          <NavLink to="/demo" className="block px-3 py-2 rounded-[8px] text-sm font-medium text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04]">
            Live Showcase
          </NavLink>

          {authenticated ? (
            <>
              <NavLink to="/dashboard" className="block px-3 py-2 rounded-[8px] text-sm font-medium text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04]">
                Dashboard
              </NavLink>
              <NavLink to="/upload" className="block px-3 py-2 rounded-[8px] text-sm font-medium text-[#9AA1AE] hover:text-[#ECEEF2] hover:bg-white/[0.04]">
                Upload Resume
              </NavLink>
              <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between px-3 py-2">
                <span className="text-sm font-medium text-[#ECEEF2]">{userDisplayName}</span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs text-[#F87171] hover:underline cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 space-y-2">
              <NavLink to="/login" className="block px-3 py-2 text-sm text-[#9AA1AE] hover:text-[#ECEEF2]">
                Sign In
              </NavLink>
              <NavLink to="/signup" className="btn-primary w-full text-xs">
                Get Started
              </NavLink>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
