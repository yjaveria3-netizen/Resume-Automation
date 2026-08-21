import { Link } from 'react-router-dom';

export default function Signup() {
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO (Day 3): Real signup API call to POST /auth/signup
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-khaki-light">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl border border-khaki/40">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-olive-wood">Create Account</h1>
          <p className="mt-2 text-sm text-olive-wood/70">
            Sign up to get started with automated resume updates
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-olive-wood mb-1">
              Email Address
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full rounded-xl border border-khaki/60 bg-khaki-light/30 px-4 py-3 text-olive-wood placeholder-olive-wood/40 focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-olive-wood mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Your password (min 8 characters)"
              className="w-full rounded-xl border border-khaki/60 bg-khaki-light/30 px-4 py-3 text-olive-wood placeholder-olive-wood/40 focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-sage py-3 text-white font-semibold shadow-md transition-all duration-200 hover:bg-sage-hover cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-olive-wood/70">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-sage hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
