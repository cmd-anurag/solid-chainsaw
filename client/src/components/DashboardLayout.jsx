import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

const menuConfig = {
  student: [
    { label: 'Overview', to: '/student' },
    { label: 'Upload Activity', to: '/student/upload' },
    { label: 'My Activities', to: '/student/activities' },
    { label: 'Profile', to: '/student/profile' },
  ],
  teacher: [
    { label: 'Overview', to: '/teacher' },
    { label: 'Pending Approvals', to: '/teacher/pending' },
  ],
  admin: [
    { label: 'Overview', to: '/admin' },
    { label: 'Manage Users', to: '/admin/users' },
  ],
};

const DashboardLayout = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const menu = menuConfig[user?.role] || [];

  return (
    <div className="min-h-screen bg-muted/60 flex">
      <aside className="hidden md:flex w-64 flex-col bg-white border-e border-slate-200">
        <div className="px-6 py-5 border-b border-slate-200">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            CD-STAR
          </p>
          <p className="text-lg font-semibold text-slate-900">Dashboard</p>
        </div>
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-1">
            {menu.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-primary text-white shadow'
                        : 'text-slate-600 hover:bg-muted'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Logged in as</p>
            <p className="text-lg font-semibold text-slate-900">
              {user?.name} · {user?.role?.toUpperCase()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="md:hidden">
              <select
                onChange={(event) => {
                  const path = event.target.value;
                  if (path) {
                    navigate(path);
                  }
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                defaultValue=""
              >
                <option value="" disabled>
                  Navigate
                </option>
                {menu.map((item) => (
                  <option key={item.to} value={item.to}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

