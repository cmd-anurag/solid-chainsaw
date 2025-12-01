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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Overview</h1>
        <p className="text-sm text-slate-500">
          Monitor submissions, approval status, academics, and attendance.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {profile?.academics?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Academics</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {profile.academics.map((record) => (
              <div
                key={record._id}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm"
              >
                <p className="font-semibold text-slate-700">{record.semester}</p>
                <p className="text-2xl font-bold text-slate-900">{record.cgpa}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-slate-900">Recent Activities</p>
            <p className="text-sm text-slate-500">Latest submissions and their status.</p>
          </div>
        </div>
        {activities.length === 0 ? (
          <EmptyState
            title="No activities yet"
            description="Upload your first achievement to get started."
          />
        ) : (
          <div className="space-y-4">
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

