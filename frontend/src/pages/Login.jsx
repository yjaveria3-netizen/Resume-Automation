import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login, isAuthenticated } from '../api/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [clientErrors, setClientErrors] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
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
      await login(email, password);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-khaki-light">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-khaki/40">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-olive-wood">Welcome Back</h1>
          <p className="mt-2 text-sm text-olive-wood/70">
            Sign in to access your auto-updating resume dashboard
          </p>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <div>{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-medium text-olive-wood mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className={`w-full rounded-xl border ${
                clientErrors.email ? 'border-red-400 focus:ring-red-300' : 'border-khaki/60 focus:ring-sage'
              } bg-khaki-light/30 px-4 py-3 text-olive-wood placeholder-olive-wood/40 focus:outline-none focus:ring-2`}
            />
            {clientErrors.email && (
              <p className="mt-1 text-xs text-red-500">{clientErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-olive-wood mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full rounded-xl border ${
                clientErrors.password ? 'border-red-400 focus:ring-red-300' : 'border-khaki/60 focus:ring-sage'
              } bg-khaki-light/30 px-4 py-3 text-olive-wood placeholder-olive-wood/40 focus:outline-none focus:ring-2`}
            />
            {clientErrors.password && (
              <p className="mt-1 text-xs text-red-500">{clientErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-sage py-3 text-white font-semibold shadow-md transition-all duration-200 hover:bg-sage-hover cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && (
              <svg className="w-5 h-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-olive-wood/70">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-sage hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
