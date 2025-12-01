import { useEffect, useState } from 'react';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const MyActivities = () => {
  const [activities, setActivities] = useState([]);
  const [filters, setFilters] = useState({ category: '', status: '' });
  const [loading, setLoading] = useState(true);

  const fetchActivities = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const suffix = query ? `?${query}` : '';
    const { data } = await api.get(`/student/activities${suffix}`);
    setActivities(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await fetchActivities(filters);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <LoadingSpinner label="Loading your activities..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Activities</h1>
          <p className="text-sm text-slate-500">
            Filter by category or status to find the right submission quickly.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
          >
            <option value="">All categories</option>
            <option value="event">Events</option>
            <option value="achievement">Achievements</option>
            <option value="skill">Skills</option>
          </select>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm"
          >
            <option value="">All status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="No activities match the filters"
          description="Try a different combination or upload a new achievement."
          action={
            <button
              onClick={() => setFilters({ category: '', status: '' })}
              className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary"
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyActivities;

