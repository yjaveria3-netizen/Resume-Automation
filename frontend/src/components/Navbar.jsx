import { NavLink, Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, getUser, logout } from '../api/auth';

export default function Navbar() {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-xs font-bold transition-all ${
      isActive
        ? 'bg-sage text-white shadow-sm'
        : 'text-olive-wood/80 hover:bg-khaki-light hover:text-olive-wood'
    }`;

  return (
    <header className="h-16 bg-white border-b border-khaki/40 shadow-xs sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link to={authenticated ? '/dashboard' : '/login'} className="flex items-center space-x-2.5 group">
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

        {/* Top Navigation Bar */}
        <nav className="flex items-center space-x-2">
          {authenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" className={navLinkClass}>
                Upload Resume
              </NavLink>
              {user?.email && (
                <span className="hidden lg:inline-block px-3 py-1.5 text-xs font-semibold rounded-xl bg-khaki-light text-olive-wood/80 border border-khaki/40">
                  {user.email}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-olive-wood/70 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer border border-transparent hover:border-red-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Log In
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                Sign Up
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
