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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-16">
      <div className="hero-spark" />
      <div className="glass-panel grid w-full max-w-5xl grid-cols-1 overflow-hidden border border-white/10 md:grid-cols-[1.05fr,0.95fr]">
        <div className="relative bg-gradient-to-br from-indigo-600/90 via-indigo-500 to-violet-500 px-10 py-12 text-white">
          <p className="text-xs uppercase tracking-[0.5em] text-white/70">CD-STAR</p>
          <h2 className="mt-6 text-3xl font-semibold leading-tight text-white">
            Centralized Student Activity Records
          </h2>
          <p className="mt-3 text-sm text-white/80">
            Upload achievements, monitor approvals, and publish transcripts from one immersive
            canvas.
          </p>
          <div className="mt-10 space-y-4">
            {['Realtime validation', 'Role-aware dashboards', 'Progressive audit trails'].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="status-dot bg-emerald-300" />
                  {item}
                </div>
              )
            )}
          </div>
        </div>
        <form className="bg-white/95 px-10 py-12 text-slate-900" onSubmit={handleSubmit}>
          <div>
            <p className="accent-pill bg-slate-100 text-indigo-500">Authenticate</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-900">Welcome back</h3>
            <p className="text-sm text-slate-500">Enter your institutional credentials.</p>
          </div>
          <div className="mt-8 space-y-5">
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="you@institution.edu"
                required
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.3em] text-slate-500">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error && <p className="mt-4 text-sm font-semibold text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-indigo-400"
          >
            {loading ? 'Signing in...' : 'Access dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

