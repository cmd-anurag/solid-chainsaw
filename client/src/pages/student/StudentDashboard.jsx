import { useEffect, useState } from 'react';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const StudentDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [activityRes, profileRes] = await Promise.all([
          api.get('/student/activities'),
          api.get('/student/profile'),
        ]);
        setActivities(activityRes.data);
        setProfile(profileRes.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Fetching your dashboard..." />;
  }

  if (error) {
    return <EmptyState title="Something went wrong" description={error} />;
  }

  const stats = [
    {
      title: 'Total Activities',
      value: activities.length,
      change: '+ All time',
      accent: 'primary',
    },
    {
      title: 'Approved',
      value: activities.filter((item) => item.status === 'approved').length,
      change: 'Ready for transcript',
      accent: 'accent',
    },
    {
      title: 'Pending',
      value: activities.filter((item) => item.status === 'pending').length,
      change: 'Awaiting teacher review',
      accent: 'secondary',
    },
  ];

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Student overview</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Your activity command center</h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor submissions, approvals, academics, and attendance from a single, polished view.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {profile?.academics?.length > 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-slate-400">
              Academics
            </p>
            <p className="text-xs font-medium text-slate-400">
              Last synced · {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString() : 'recently'}
            </p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {profile.academics.map((record) => (
              <div
                key={record._id}
                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm shadow-inner"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{record.semester}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{record.cgpa}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">Recent Activities</p>
            <p className="text-sm text-slate-500">Latest submissions and their status.</p>
          </div>
        </div>
        {activities.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No activities yet"
              description="Upload your first achievement to get started."
            />
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {activities.slice(0, 4).map((activity) => (
              <ActivityCard key={activity._id} activity={activity} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;

