import { useEffect, useState } from "react";
import EmptyState from "../../components/EmptyState";
import LoadingSpinner from "../../components/LoadingSpinner";
import api from "../../services/api";

const defaultForm = {
  name: "",
  email: "",
  role: "student",
  department: "",
  batch: "",
  password: "",
};

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const refreshUsers = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setUsers([]);
    }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admin/user/add", form);
      setForm(defaultForm);
      await refreshUsers();
    } catch (err) {
      // ignore for now
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/user/delete/${id}`);
      await refreshUsers();
    } catch (err) {
      // ignore
    }
  };

  if (loading) return <LoadingSpinner label="Loading users..." />;

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Add new user
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Create student, teacher, or admin accounts for CD-STAR.
        </p>

        <form className="mt-6 text-black space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full name"
            required
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            required
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department"
              className="rounded-2xl border px-4 py-3 text-sm"
            />
            <input
              name="batch"
              value={form.batch}
              onChange={handleChange}
              placeholder="Batch"
              className="rounded-2xl border px-4 py-3 text-sm"
            />
          </div>
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Temporary password (optional)"
            type="password"
            className="w-full rounded-2xl border px-4 py-3 text-sm"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm text-white"
          >
            {submitting ? "Creating..." : "Create user"}
          </button>
        </form>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
          Existing users
        </p>
        {users.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              title="No users yet"
              description="Add your first user to begin."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold text-slate-800">{u.name}</p>
                  <p className="text-slate-500">{u.email}</p>
                  <p className="text-xs text-slate-400">{u.role}</p>
                </div>
                <div>
                  <button
                    onClick={() => handleDelete(u._id)}
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
