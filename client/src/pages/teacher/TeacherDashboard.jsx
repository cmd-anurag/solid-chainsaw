import { useEffect, useState } from 'react';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const TeacherDashboard = () => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/teacher/activities/pending');
        setPending(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading teacher dashboard..." />;
  }

  const stats = [
    {
      title: 'Pending Reviews',
      value: pending.length,
      change: 'Awaiting your action',
      accent: 'secondary',
    },
    {
      title: 'Event Submissions',
      value: pending.filter((item) => item.category === 'event').length,
      change: 'Events to review',
      accent: 'primary',
    },
    {
      title: 'Achievements',
      value: pending.filter((item) => item.category === 'achievement').length,
      change: 'Achievements queued',
      accent: 'accent',
    },
  ];

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Teacher overview</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Keep approvals flowing</h1>
        <p className="mt-2 text-sm text-slate-500">
          Track pending submissions, take action instantly, and celebrate student milestones.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-lg font-semibold text-slate-900">Most recent uploads</p>
        <p className="text-sm text-slate-500">
          Quickly glance at the latest certificates awaiting validation.
        </p>
        {pending.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="All caught up!" description="No pending applications right now." />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {pending.slice(0, 3).map((activity) => (
              <ActivityCard key={activity._id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

