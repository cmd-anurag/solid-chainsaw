import { useEffect, useState } from 'react';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await api.get('/student/profile');
        setProfile(data);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading profile..." />;
  }

  if (!profile) {
    return <EmptyState title="Profile unavailable" description="Please try again later." />;
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
          Personal Details
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Name</p>
            <p className="text-base font-semibold text-slate-900">{profile.user?.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Email</p>
            <p className="text-base font-semibold text-slate-900">{profile.user?.email}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Department</p>
            <p className="text-base font-semibold text-slate-900">
              {profile.user?.department || 'Not set'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400">Batch</p>
            <p className="text-base font-semibold text-slate-900">
              {profile.user?.batch || 'Not set'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Academic Performance
          </p>
          {profile.academics?.length ? (
            <ul className="mt-4 space-y-3">
              {profile.academics.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-slate-700">{item.semester}</span>
                  <span className="text-lg font-bold text-primary">{item.cgpa}</span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No records" description="Ask your faculty to add academic data." />
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Attendance Snapshot
          </p>
          {profile.attendance?.length ? (
            <ul className="mt-4 space-y-3">
              {profile.attendance.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
                >
                  <span className="font-semibold text-slate-700">{item.month}</span>
                  <span className="text-lg font-bold text-secondary">
                    {item.present}/{item.total} days
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title="No records" description="Attendance yet to be published." />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

