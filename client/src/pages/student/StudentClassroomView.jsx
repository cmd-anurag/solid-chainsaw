import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

const StudentClassroomView = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('assignments');

  useEffect(() => {
    const load = async () => {
      try {
        const [classroomRes, assignmentsRes, submissionsRes] = await Promise.all([
          api.get(`/classrooms/${classroomId}`),
          api.get(`/assignments/classroom/${classroomId}`),
          api.get(`/submissions/classroom/${classroomId}`),
        ]);
        setClassroom(classroomRes.data);
        setAssignments(assignmentsRes.data.filter(a => a.status === 'published'));
        // Only include actual submitted submissions, not drafts (includes 'submitted' and 'returned' status)
        setSubmissions(submissionsRes.data.filter(s => s.status === 'submitted' || s.status === 'returned'));
        console.log('Loaded submissions:', submissionsRes.data.filter(s => s.status === 'submitted' || s.status === 'returned'));
        console.log('Loaded assignments:', assignmentsRes.data);
      } catch (error) {
        console.error('Error loading classroom:', error);
        alert('Failed to load classroom');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [classroomId]);

  if (loading) {
    return <LoadingSpinner label="Loading classroom..." />;
  }

  if (!classroom) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/student')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Dashboard
        </button>
        <EmptyState title="Classroom not found" description="The classroom you're looking for doesn't exist." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/student')}
          className="text-blue-600 hover:text-blue-700 font-medium mb-3"
        >
          ← Back to Classrooms
        </button>
        <h1 className="text-3xl font-semibold text-slate-900">{classroom.name}</h1>
        <p className="text-slate-600 mt-1">{classroom.description}</p>
      </div>

      {/* Classroom Info */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Section</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{classroom.section}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Department</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{classroom.department}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'assignments'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          Assignments
        </button>
        <button
          onClick={() => setActiveTab('my-submissions')}
          className={`px-4 py-3 font-medium border-b-2 transition ${
            activeTab === 'my-submissions'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          My Submissions
        </button>
      </div>

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-12 shadow-xl shadow-slate-900/5">
              <EmptyState 
                title="No assignments yet" 
                description="Check back later for assignments from your instructor." 
              />
            </div>
          ) : (
            assignments.map((assignment) => {
              const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const submission = submissions.find((s) => {
                const submissionAssignmentId = s.assignment?._id || s.assignment;
                const match = submissionAssignmentId?.toString() === assignment._id?.toString();
                if (match) {
                  console.log('Found submission for assignment:', assignment.title, s);
                }
                return match;
              });
              
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
                      </div>
                      {submission?.grade !== undefined && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm font-semibold text-green-900">
                            Your Grade: {submission.grade}/{submission.maxPoints} ({Math.round((submission.grade / submission.maxPoints) * 100)}%)
                          </p>
                          {submission.feedback && (
                            <p className="text-sm text-green-800 mt-1">Feedback: {submission.feedback}</p>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/student/assignment/${assignment._id}`)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium whitespace-nowrap ml-4"
                    >
                      {submission ? 'View' : 'Submit'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* My Submissions Tab */}
      {activeTab === 'my-submissions' && (
        <div className="space-y-4">
          {submissions.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-12 shadow-xl shadow-slate-900/5">
              <EmptyState 
                title="No submissions yet" 
                description="Submit your first assignment to see it here." 
              />
            </div>
          ) : (
            submissions.map((submission) => (
              <div
                key={submission._id}
                className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5"
              >
                <h3 className="text-lg font-semibold text-slate-900">{submission.assignment?.title}</h3>
                <div className="mt-2 space-y-2 text-sm text-slate-600">
                  <p>
                    Submitted:{' '}
                    {submission.submittedAt
                      ? new Date(submission.submittedAt).toLocaleDateString()
                      : 'Pending timestamp'}
                  </p>
                  <p>Status: 
                    <span className={`ml-2 inline-block px-3 py-1 rounded text-xs font-medium ${
                      submission.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                      submission.status === 'returned' ? 'bg-blue-100 text-blue-800' :
                      submission.status === 'graded' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {submission.status.toUpperCase()}
                    </span>
                  </p>
                  {submission.isLate && (
                    <p className="text-red-600 font-semibold">Late Submission</p>
                  )}
                </div>
                {submission.grade !== undefined && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-900">
                      Grade: {submission.grade}/{submission.maxPoints} ({Math.round((submission.grade / submission.maxPoints) * 100)}%)
                    </p>
                    {submission.feedback && (
                      <p className="text-sm text-green-800 mt-2">Feedback: {submission.feedback}</p>
                    )}
                  </div>
                )}
                <button
                  onClick={() => navigate(`/student/assignment/${submission.assignment?._id}`)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
                >
                  View Assignment
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentClassroomView;
