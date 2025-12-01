import { useEffect, useState } from 'react';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const PendingActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const { data } = await api.get('/teacher/activities/pending');
    setActivities(data);
  };

  useEffect(() => {
    const load = async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDecision = async (id, action) => {
    const endpoint =
      action === 'approve'
        ? `/teacher/activity/approve/${id}`
        : `/teacher/activity/reject/${id}`;
    await api.put(endpoint);
    await refresh();
  };

  if (loading) {
    return <LoadingSpinner label="Fetching pending activities..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pending Approvals</h1>
        <p className="text-sm text-slate-500">
          Review each submission and take action. Students are notified instantly.
        </p>
      </div>

      {activities.length === 0 ? (
        <EmptyState title="Great work" description="No submissions require your attention." />
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <ActivityCard
              key={activity._id}
              activity={activity}
              actions={[
                <button
                  key="approve"
                  onClick={() => handleDecision(activity._id, 'approve')}
                  className="rounded-2xl bg-accent/10 px-4 py-2 text-sm font-semibold text-accent"
                >
                  Approve
                </button>,
                <button
                  key="reject"
                  onClick={() => handleDecision(activity._id, 'reject')}
                  className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                >
                  Reject
                </button>,
              ]}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingActivities;

