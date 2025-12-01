import { useState } from 'react';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

const UploadActivity = () => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'event',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    if (file) {
      formData.append('file', file);
    }

    try {
      setLoading(true);
      await api.post('/student/activity/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStatus({ type: 'success', message: 'Activity submitted for review.' });
      setForm({ title: '', description: '', category: 'event' });
      setFile(null);
    } catch (err) {
      setStatus({
        type: 'error',
        message: err.response?.data?.message || 'Unable to upload activity',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Achievement</h1>
        <p className="text-sm text-slate-500">
          Fill in the details and attach proof for faster teacher validation.
        </p>
      </div>

      {status.message && (
        <EmptyState
          title={status.type === 'success' ? 'Success' : 'Heads up'}
          description={status.message}
        />
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm"
      >
        <div>
          <label className="text-sm font-semibold text-slate-600">Title</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="E.g. Winner - Hackathon 2025"
            required
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="event">Event</option>
            <option value="achievement">Achievement</option>
            <option value="skill">Skill</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className="mt-1 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="Add relevant details, collaborators, dates, etc."
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-slate-600">Certificate / Proof</label>
          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(event) => setFile(event.target.files[0])}
            className="mt-1 w-full rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm"
          />
          <p className="mt-1 text-xs text-slate-500">
            Accepted formats: PDF, PNG, JPG. Max size 5 MB.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
        >
          {loading ? 'Submitting...' : 'Submit for verification'}
        </button>
      </form>
    </div>
  );
};

export default UploadActivity;

