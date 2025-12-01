import { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const defaultForm = {
  name: '',
  email: '',
  role: 'student',
  department: '',
  batch: '',
  password: '',
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refreshUsers = async () => {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refreshUsers();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/user/add', form);
      setForm(defaultForm);
      await refreshUsers();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/admin/user/delete/${id}`);
    await refreshUsers();
  };

  if (loading) {
    return <LoadingSpinner label="Loading users..." />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Add new user</p>
        <p className="text-sm text-slate-500">
          Create student, teacher, or admin accounts for CD-STAR.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
            <input
              type="text"
              name="batch"
              value={form.batch}
              onChange={handleChange}
              placeholder="Batch (e.g. 2022)"
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Temporary password (optional)"
            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-primary/50"
          >
            {submitting ? 'Creating...' : 'Create user'}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Existing users</p>
        {users.length === 0 ? (
          <EmptyState title="No users yet" description="Add your first user to begin." />
        ) : (
          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <div
                key={user._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-800">{user.name}</p>
                  <p className="text-slate-500">{user.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {user.role}
                  </span>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="text-xs font-semibold text-rose-500"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;

