import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, isAuthenticated } from '../api/auth';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clientErrors, setClientErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validate()) return;

    setLoading(true);
    try {
      await signup(email.trim(), password);
      navigate('/dashboard', {
        replace: true,
        state: { toast: 'Welcome! Your account was created successfully.' },
      });
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Email may already be registered.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-gradient-to-b from-khaki-light/60 via-white to-khaki-light/40">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-khaki/30 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group mb-2">
            <div className="w-10 h-10 rounded-2xl bg-sage group-hover:bg-sage-hover text-white flex items-center justify-center font-extrabold text-lg shadow-sm transition-all">
              R
            </div>
            <span className="font-extrabold text-xl text-olive-wood tracking-tight">
              Resume Auto-Updater
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-olive-wood tracking-tight">
            Create Free Account
          </h1>
          <p className="text-xs sm:text-sm text-olive-wood/70 font-medium">
            Start continuously keeping your resume in sync with GitHub
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-3 animate-fade-in shadow-2xs">
            <svg className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-xs font-bold text-olive-wood/80 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-olive-wood/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (clientErrors.email) setClientErrors((p) => ({ ...p, email: null }));
                }}
                placeholder="developer@example.com"
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs sm:text-sm text-olive-wood bg-khaki-light/30 placeholder-olive-wood/40 focus:outline-none focus:ring-2 transition-all ${
                  clientErrors.email
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-khaki/50 focus:ring-sage focus:border-transparent'
                }`}
              />
            </div>
            {clientErrors.email && (
              <p className="mt-1.5 text-xs text-rose-600 font-semibold">{clientErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-olive-wood/80 uppercase tracking-wider mb-1.5">
              Password (Min. 8 characters)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-olive-wood/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (clientErrors.password) setClientErrors((p) => ({ ...p, password: null }));
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full pl-10 pr-11 py-3 rounded-2xl border text-xs sm:text-sm text-olive-wood bg-khaki-light/30 placeholder-olive-wood/40 focus:outline-none focus:ring-2 transition-all ${
                  clientErrors.password
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-khaki/50 focus:ring-sage focus:border-transparent'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-olive-wood/50 hover:text-olive-wood transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {clientErrors.password && (
              <p className="mt-1.5 text-xs text-rose-600 font-semibold">{clientErrors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-olive-wood/80 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-olive-wood/40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (clientErrors.confirmPassword) setClientErrors((p) => ({ ...p, confirmPassword: null }));
                }}
                placeholder="••••••••"
                autoComplete="new-password"
                className={`w-full pl-10 pr-4 py-3 rounded-2xl border text-xs sm:text-sm text-olive-wood bg-khaki-light/30 placeholder-olive-wood/40 focus:outline-none focus:ring-2 transition-all ${
                  clientErrors.confirmPassword
                    ? 'border-rose-400 focus:ring-rose-200'
                    : 'border-khaki/50 focus:ring-sage focus:border-transparent'
                }`}
              />
            </div>
            {clientErrors.confirmPassword && (
              <p className="mt-1.5 text-xs text-rose-600 font-semibold">{clientErrors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 rounded-2xl bg-sage hover:bg-sage-hover active:scale-[0.99] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ring-4 ring-sage/15"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account & Continue →</span>
            )}
          </button>
        </form>

        {/* Footer links */}
        <div className="pt-2 border-t border-khaki/20 text-center text-xs text-olive-wood/70 space-y-2 font-medium">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="font-extrabold text-sage hover:underline">
              Sign In
            </Link>
          </p>
          <p>
            <Link to="/" className="text-olive-wood/50 hover:text-olive-wood transition-colors">
              ← Back to Homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
