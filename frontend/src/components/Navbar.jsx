import { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, getUser, logout } from '../api/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [user, setUser] = useState(getUser());

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

  // Update on route change as well
  useEffect(() => {
    setAuthenticated(isAuthenticated());
    setUser(getUser());
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setUser(null);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-sage text-white shadow-2xs'
        : 'text-olive-wood/75 hover:bg-khaki-light hover:text-olive-wood'
    }`;

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-khaki/30 shadow-2xs sticky top-0 z-40">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-sage group-hover:bg-sage-hover flex items-center justify-center text-white font-extrabold text-base shadow-sm transition-all">
            R
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base text-olive-wood tracking-tight leading-tight">
              Resume Auto-Updater
            </span>
            <span className="text-[10px] font-semibold text-olive-wood/50 tracking-wider uppercase">
              AI Continuous Sync
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="flex items-center space-x-2">
          {/* Public Product Demo Link */}
          <NavLink
            to="/demo"
            className={({ isActive }) =>
              `px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-sage text-white border-sage shadow-2xs'
                  : 'bg-khaki-light/50 text-olive-wood/80 border-khaki/40 hover:bg-khaki-light hover:text-olive-wood'
              }`
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Showcase</span>
          </NavLink>

          {authenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" className={navLinkClass}>
                Upload Resume
              </NavLink>
              {user?.email && (
                <div
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-khaki-light text-olive-wood/80 border border-khaki/40 truncate max-w-[170px]"
                  title={user.email}
                >
                  <span className="w-2 h-2 rounded-full bg-sage shrink-0" />
                  <span className="truncate">{user.name || user.email.split('@')[0]}</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-olive-wood/70 hover:bg-rose-50 hover:text-rose-600 transition-all cursor-pointer border border-transparent hover:border-rose-200"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className="px-4 py-2 rounded-xl bg-sage hover:bg-sage-hover text-white text-xs font-extrabold shadow-sm hover:shadow transition-all"
              >
                Get Started Free
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
