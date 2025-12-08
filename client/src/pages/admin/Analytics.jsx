// frontend/src/pages/admin/Analytics.jsx
import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/LoadingSpinner';
import AdvancedChart from '../../components/Analytics/AdvancedChart';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const Analytics = () => {
  const [overview, setOverview] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [academicData, setAcademicData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [overviewRes, activityRes, academicRes, userRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/analytics/activities?period=30'),
          api.get('/analytics/academics'),
          api.get('/analytics/users'),
        ]);
        setOverview(overviewRes.data);
        setActivityData(activityRes.data);
        setAcademicData(academicRes.data);
        setUserData(userRes.data);
      } catch (error) {
        console.error('Error loading analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading analytics..." />;
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'activities', label: 'Activities' },
    { id: 'academics', label: 'Academics' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Advanced Analytics</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Data Intelligence Center</h1>
        <p className="mt-2 text-sm text-slate-500">
          Comprehensive insights and trends across all platform metrics.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium ${
                activeTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && overview && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-4">
            <StatCard
              title="Total Users"
              value={overview.users.total}
              change={`${overview.users.students} students, ${overview.users.teachers} teachers`}
              accent="primary"
            />
            <StatCard
              title="Activities"
              value={overview.activities.total}
              change={`${overview.activities.approved} approved`}
              accent="accent"
            />
            <StatCard
              title="Academic Records"
              value={overview.academics.totalRecords}
              change="All semesters"
              accent="secondary"
            />
            <StatCard
              title="Unread Notifications"
              value={overview.notifications.unread}
              change="Pending alerts"
              accent="primary"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Activity Status</p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Approved</span>
                  <span className="text-lg font-bold text-green-600">
                    {overview.activities.approved}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Pending</span>
                  <span className="text-lg font-bold text-yellow-600">
                    {overview.activities.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Rejected</span>
                  <span className="text-lg font-bold text-red-600">
                    {overview.activities.rejected}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">User Distribution</p>
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Students</span>
                  <span className="text-lg font-bold text-indigo-600">
                    {overview.users.students}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Teachers</span>
                  <span className="text-lg font-bold text-sky-600">{overview.users.teachers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Admins</span>
                  <span className="text-lg font-bold text-amber-600">
                    {overview.users.admins}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && activityData && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Activity Trends</p>
              <div className="mt-6">
                <AdvancedChart
                  type="line"
                  data={{
                    labels: activityData.trends.map((t) => t._id),
                    datasets: [
                      {
                        label: 'Total',
                        data: activityData.trends.map((t) => t.count),
                        borderColor: 'rgb(99, 102, 241)',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      },
                      {
                        label: 'Approved',
                        data: activityData.trends.map((t) => t.approved),
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">By Category</p>
              <div className="mt-6">
                <AdvancedChart
                  type="doughnut"
                  data={{
                    labels: activityData.byCategory.map((c) => c._id),
                    datasets: [
                      {
                        data: activityData.byCategory.map((c) => c.count),
                        backgroundColor: [
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Academics Tab */}
      {activeTab === 'academics' && academicData && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <StatCard
              title="Total Records"
              value={academicData.overall.totalRecords}
              accent="primary"
            />
            <StatCard
              title="Average SGPA"
              value={academicData.overall.avgSGPA.toFixed(2)}
              accent="accent"
            />
            <StatCard
              title="Excellent (9+)"
              value={academicData.overall.distribution.excellent}
              accent="secondary"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Performance by Semester
              </p>
              <div className="mt-6">
                <AdvancedChart
                  type="bar"
                  data={{
                    labels: academicData.bySemester.map((s) => `Semester ${s._id}`),
                    datasets: [
                      {
                        label: 'Average SGPA',
                        data: academicData.bySemester.map((s) => s.avgSGPA.toFixed(2)),
                        backgroundColor: 'rgba(99, 102, 241, 0.8)',
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                Grade Distribution
              </p>
              <div className="mt-6">
                <AdvancedChart
                  type="pie"
                  data={{
                    labels: ['Excellent (9+)', 'Good (8-9)', 'Average (7-8)', 'Below Average (<7)'],
                    datasets: [
                      {
                        data: [
                          academicData.overall.distribution.excellent,
                          academicData.overall.distribution.good,
                          academicData.overall.distribution.average,
                          academicData.overall.distribution.belowAverage,
                        ],
                        backgroundColor: [
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                          'rgba(239, 68, 68, 0.8)',
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && userData && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Users by Role</p>
              <div className="mt-6">
                <AdvancedChart
                  type="doughnut"
                  data={{
                    labels: userData.byRole.map((r) => r._id),
                    datasets: [
                      {
                        data: userData.byRole.map((r) => r.count),
                        backgroundColor: [
                          'rgba(99, 102, 241, 0.8)',
                          'rgba(34, 197, 94, 0.8)',
                          'rgba(251, 191, 36, 0.8)',
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">By Department</p>
              <div className="mt-6 max-h-96 overflow-y-auto">
                <div className="space-y-2">
                  {userData.byDepartment.map((dept) => (
                    <div key={dept._id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                      <span className="text-sm font-medium text-slate-700">{dept._id || 'Unassigned'}</span>
                      <span className="text-lg font-bold text-indigo-600">{dept.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

