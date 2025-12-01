import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-muted text-center">
    <p className="text-8xl font-black text-primary/20">404</p>
    <h1 className="mt-6 text-2xl font-bold text-slate-900">Page not found</h1>
    <p className="mt-2 max-w-md text-slate-500">
      The page you are looking for might have been removed, renamed, or is temporarily unavailable.
    </p>
    <Link
      to="/"
      className="mt-6 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/30"
    >
      Go back home
    </Link>
  </div>
);

export default NotFound;

