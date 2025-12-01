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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Teacher Overview</h1>
        <p className="text-sm text-slate-500">
          Track pending student submissions and approve/reject in seconds.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-lg font-semibold text-slate-900">Most recent uploads</p>
          <p className="text-sm text-slate-500">
            Quickly glance at the latest certificates awaiting validation.
          </p>
        </div>
        {pending.length === 0 ? (
          <EmptyState
            title="All caught up!"
            description="No pending applications right now."
          />
        ) : (
          pending.slice(0, 3).map((activity) => (
            <ActivityCard key={activity._id} activity={activity} />
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;

