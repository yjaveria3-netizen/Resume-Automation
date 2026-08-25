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
    `px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive
      ? 'bg-sage text-white shadow'
      : 'text-olive-wood hover:bg-khaki-light/60 hover:text-olive-wood'
    }`;

  return (
    <header className="h-16 bg-white border-b border-khaki/40 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to={authenticated ? '/dashboard' : '/login'} className="flex items-center space-x-2">
          <span className="w-8 h-8 rounded-lg bg-sage flex items-center justify-center text-white font-bold text-lg shadow-sm">
            R
          </span>
          <span className="font-bold text-lg text-olive-wood tracking-tight">
            Resume Auto-Updater
          </span>
        </Link>

        {/* Top Navigation Links */}
        <nav className="flex items-center space-x-2">
          {authenticated ? (
            <>
              <NavLink to="/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/upload" className={navLinkClass}>
                Upload
              </NavLink>
              {user?.email && (
                <span className="hidden md:inline-block px-3 py-1 text-xs font-semibold rounded-lg bg-khaki-light text-olive-wood border border-khaki/40">
                  {user.email}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
