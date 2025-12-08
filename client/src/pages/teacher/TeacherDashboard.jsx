import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ActivityCard from '../../components/ActivityCard';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatCard from '../../components/StatCard';
import api from '../../services/api';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [pending, setPending] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showCreateClassroom, setShowCreateClassroom] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [activitiesRes, classroomsRes] = await Promise.all([
          api.get('/teacher/activities/pending'),
          api.get('/classrooms/teacher/all'),
        ]);
        setPending(activitiesRes.data);
        setClassrooms(classroomsRes.data);
      } catch (error) {
        console.error('Error loading teacher dashboard:', error);
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
      title: 'My Classrooms',
      value: classrooms.length,
      change: 'Active classrooms',
      accent: 'primary',
    },
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
      accent: 'accent',
    },
  ];

  return (
    <div className="space-y-10">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <p className="text-xs uppercase tracking-[0.5em] text-slate-400">Teacher overview</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Welcome back, instructor</h1>
        <p className="mt-2 text-sm text-slate-500">
          Manage your classrooms, create assignments, and grade student submissions all in one place.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'overview'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('classrooms')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'classrooms'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Classrooms
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'activities'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Activities
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Classrooms */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold text-slate-900">Recent Classrooms</p>
                <button
                  onClick={() => setActiveTab('classrooms')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {classrooms.length === 0 ? (
                <EmptyState 
                  title="No classrooms yet" 
                  description="Create your first classroom to get started." 
                />
              ) : (
                <div className="space-y-3">
                  {classrooms.slice(0, 3).map((classroom) => (
                    <div
                      key={classroom._id}
                      onClick={() => navigate(`/teacher/classroom/${classroom._id}`)}
                      className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer transition"
                    >
                      <p className="font-semibold text-slate-900">{classroom.name}</p>
                      <p className="text-sm text-slate-600">{classroom.students?.length || 0} students • {classroom.section}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Activities */}
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
              <div className="flex justify-between items-center mb-4">
                <p className="text-lg font-semibold text-slate-900">Pending Reviews</p>
                <button
                  onClick={() => setActiveTab('activities')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {pending.length === 0 ? (
                <EmptyState 
                  title="All caught up!" 
                  description="No pending submissions right now." 
                />
              ) : (
                <div className="space-y-3">
                  {pending.slice(0, 3).map((activity) => (
                    <div key={activity._id} className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                      <p className="font-semibold text-slate-900 text-sm">{activity.title}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {activity.category} • {activity.student?.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Classrooms Tab */}
      {activeTab === 'classrooms' && (
        <ClassroomsSection 
          classrooms={classrooms} 
          onRefresh={() => window.location.reload()}
          navigate={navigate}
        />
      )}

      {/* Activities Tab */}
      {activeTab === 'activities' && (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-lg font-semibold text-slate-900 mb-4">Pending Submissions</p>
          {pending.length === 0 ? (
            <div className="mt-6">
              <EmptyState title="All caught up!" description="No pending applications right now." />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {pending.map((activity) => (
                <ActivityCard key={activity._id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Classrooms Section Component
 */
const ClassroomsSection = ({ classrooms, onRefresh, navigate }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    section: '',
    department: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateClassroom = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post('/classrooms', formData);
      alert('Classroom created successfully!');
      setFormData({ name: '', description: '', section: '', department: '' });
      setShowCreateForm(false);
      onRefresh();
    } catch (error) {
      alert('Error creating classroom: ' + error.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900">My Classrooms</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          {showCreateForm ? 'Cancel' : '+ New Classroom'}
        </button>
      </div>

      {showCreateForm && (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <form onSubmit={handleCreateClassroom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Classroom Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., CS101 - Programming Basics"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="What is this classroom about?"
                rows="3"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="e.g., A, B, Section 1"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="e.g., Computer Science"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
            >
              {isSubmitting ? 'Creating...' : 'Create Classroom'}
            </button>
          </form>
        </div>
      )}

      {classrooms.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-12 shadow-xl shadow-slate-900/5">
          <EmptyState 
            title="No classrooms yet" 
            description="Create your first classroom to start managing assignments and students." 
          />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classrooms.map((classroom) => (
            <div
              key={classroom._id}
              className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5 hover:shadow-2xl transition cursor-pointer"
              onClick={() => navigate(`/teacher/classroom/${classroom._id}`)}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900">{classroom.name}</h3>
                <p className="text-sm text-slate-600 mt-1">{classroom.description}</p>
              </div>
              <div className="space-y-2 text-sm text-slate-600 mb-4 pb-4 border-b border-slate-200">
                <p><strong>Section:</strong> {classroom.section}</p>
                <p><strong>Department:</strong> {classroom.department}</p>
                <p><strong>Students:</strong> {classroom.students?.length || 0}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg mb-4">
                <p className="text-xs text-slate-600">Classroom Code:</p>
                <p className="font-mono font-bold text-blue-600">{classroom.code}</p>
                <p className="text-xs text-slate-500 mt-1">Share this with students to invite them</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/teacher/classroom/${classroom._id}`);
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Open Classroom
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

