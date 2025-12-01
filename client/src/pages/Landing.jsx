import { Link } from 'react-router-dom';

const Landing = () => (
  <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-secondary/10">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 py-20 text-center md:text-left">
      <p className="rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-primary shadow">
        CD-STAR · Centralized Activity Records
      </p>
      <div className="grid items-center gap-10 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 md:text-5xl">
            Showcase achievements. Streamline approvals. Empower students.
          </h1>
          <p className="mt-6 text-lg text-slate-600">
            Students upload accomplishments, teachers verify instantly, and admins oversee every
            record inside one unified workspace.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start">
            <Link
              to="/login"
              className="rounded-xl bg-primary px-6 py-3 text-white shadow-lg shadow-primary/30 transition hover:translate-y-0.5"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-white"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-xl">
          <ul className="space-y-4 text-left text-slate-700">
            <li className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-primary/10 text-center text-primary">1</span>
              Role-based dashboards for students, teachers, and admins.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-secondary/10 text-center text-secondary">
                2
              </span>
              Secure JWT authentication and protected routes.
            </li>
            <li className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-full bg-accent/10 text-center text-accent">3</span>
              Upload and verify certificates with one click.
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export default Landing;

