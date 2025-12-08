import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

const ClassroomView = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxPoints: 100,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [classroomRes, assignmentsRes] = await Promise.all([
          api.get(`/classrooms/${classroomId}`),
          api.get(`/assignments/classroom/${classroomId}`),
        ]);
        setClassroom(classroomRes.data);
        setAssignments(assignmentsRes.data);
      } catch (error) {
        console.error('Error loading classroom:', error);
        alert('Failed to load classroom');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classroomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === 'maxPoints' ? parseInt(value) : value }));
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/assignments', {
        ...formData,
        classroomId,
      });
      alert('Assignment created successfully!');
      setFormData({ title: '', description: '', instructions: '', dueDate: '', maxPoints: 100 });
      setShowCreateAssignment(false);
      // Reload assignments
      const assignmentsRes = await api.get(`/assignments/classroom/${classroomId}`);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      alert('Error creating assignment: ' + error.response?.data?.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishAssignment = async (assignmentId) => {
    try {
      await api.put(`/assignments/${assignmentId}/publish`);
      alert('Assignment published successfully!');
      const assignmentsRes = await api.get(`/assignments/classroom/${classroomId}`);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      alert('Error publishing assignment: ' + error.response?.data?.error);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/assignments/${assignmentId}`);
      alert('Assignment deleted successfully!');
      const assignmentsRes = await api.get(`/assignments/classroom/${classroomId}`);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      alert('Error deleting assignment: ' + error.response?.data?.error);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading classroom..." />;
  }

  if (!classroom) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/teacher')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Classrooms
        </button>
        <EmptyState title="Classroom not found" description="The classroom you're looking for doesn't exist." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => navigate('/teacher')}
            className="text-blue-600 hover:text-blue-700 font-medium mb-3"
          >
            ← Back to Classrooms
          </button>
          <h1 className="text-3xl font-semibold text-slate-900">{classroom.name}</h1>
          <p className="text-slate-600 mt-1">{classroom.description}</p>
        </div>
      </div>

      {/* Classroom Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Classroom Code</p>
          <p className="text-2xl font-bold text-blue-600 mt-1 font-mono">{classroom.code}</p>
          <p className="text-xs text-slate-500 mt-2">Share with students to invite them</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Enrolled Students</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{classroom.students?.length || 0}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Assignments</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{assignments.length}</p>
        </div>
      </div>

      {/* Students List */}
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Enrolled Students ({classroom.students?.length || 0})</h2>
        {classroom.students?.length === 0 ? (
          <EmptyState title="No students yet" description="Students will appear here once they join using the classroom code." />
        ) : (
          <div className="grid gap-3">
            {classroom.students.map((student) => (
              <div key={student._id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                <p className="font-medium text-slate-900">{student.name}</p>
                <p className="text-sm text-slate-600">{student.email}</p>
                {student.rollNumber && <p className="text-sm text-slate-500">Roll: {student.rollNumber}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900">Assignments</h2>
          <button
            onClick={() => setShowCreateAssignment(!showCreateAssignment)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            {showCreateAssignment ? 'Cancel' : '+ New Assignment'}
          </button>
        </div>

        {showCreateAssignment && (
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Midterm Project"
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
                  placeholder="What should students do?"
                  rows="3"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Instructions</label>
                <textarea
                  name="instructions"
                  value={formData.instructions}
                  onChange={handleChange}
                  placeholder="Detailed instructions (optional)"
                  rows="2"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="datetime-local"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Points</label>
                  <input
                    type="number"
                    name="maxPoints"
                    value={formData.maxPoints}
                    onChange={handleChange}
                    min="1"
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
                {isSubmitting ? 'Creating...' : 'Create Assignment'}
              </button>
            </form>
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-12 shadow-xl shadow-slate-900/5">
            <EmptyState 
              title="No assignments yet" 
              description="Create your first assignment to get students started." 
            />
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div
                  key={assignment._id}
                  className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5 hover:shadow-2xl transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{assignment.title}</h3>
                      <p className="text-slate-600 mt-1">{assignment.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-slate-600">
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span className={daysUntilDue < 0 ? 'text-red-600 font-bold' : 'text-slate-600'}>
                          {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Overdue'}
                        </span>
                        <span>Points: {assignment.maxPoints}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          assignment.status === 'published' ? 'bg-green-100 text-green-800' :
                          assignment.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {assignment.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/teacher/assignment/${assignment._id}`)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap"
                      >
                        {assignment.status === 'published' ? 'View & Grade' : 'Edit'}
                      </button>
                      {assignment.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handlePublishAssignment(assignment._id)}
                            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                          >
                            Publish
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment._id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassroomView;
