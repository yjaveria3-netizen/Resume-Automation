import { NavLink, Link } from 'react-router-dom';

export default function Navbar() {
  const navLinkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-sage text-white shadow'
        : 'text-olive-wood hover:bg-khaki-light/60 hover:text-olive-wood'
    }`;

  return (
    <header className="h-16 bg-white border-b border-khaki/40 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="w-8 h-8 rounded-lg bg-sage flex items-center justify-center text-white font-bold text-lg">
            R
          </span>
          <span className="font-bold text-lg text-olive-wood tracking-tight">
            Resume Auto-Updater
          </span>
        </Link>

        {/* Top Navigation Links */}
        <nav className="flex items-center space-x-2">
          <NavLink to="/dashboard" className={navLinkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/ats-test" className={navLinkClass}>
            ATS Score
          </NavLink>
          <NavLink to="/preview-test" className={navLinkClass}>
            Preview
          </NavLink>
          <NavLink to="/upload" className={navLinkClass}>
            Upload
          </NavLink>
          <NavLink to="/login" className={navLinkClass}>
            Login
          </NavLink>
          <NavLink to="/signup" className={navLinkClass}>
            Signup
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
