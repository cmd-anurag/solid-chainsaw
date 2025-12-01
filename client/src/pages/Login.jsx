import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const roleRedirect = {
  student: '/student',
  teacher: '/teacher',
  admin: '/admin',
};

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuthContext();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      const user = await login(form);
      navigate(roleRedirect[user.role] || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-2">
        <div className="bg-gradient-to-br from-primary to-secondary p-10 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.2em]">CD-STAR</p>
          <h2 className="mt-10 text-3xl font-bold">Centralized Student Activity Records</h2>
          <p className="mt-4 text-sm text-white/80">
            Upload achievements, track verifications, and manage institutional excellence with one
            simple workspace.
          </p>
        </div>
        <form className="p-10" onSubmit={handleSubmit}>
          <h3 className="text-2xl font-bold text-slate-900">Welcome back 👋</h3>
          <p className="mt-2 text-sm text-slate-500">Sign in to continue to your dashboard.</p>
          <div className="mt-8 space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-600">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="you@institution.edu"
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error && <p className="mt-4 text-sm font-semibold text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/40 transition hover:translate-y-0.5 disabled:cursor-not-allowed disabled:bg-primary/50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

