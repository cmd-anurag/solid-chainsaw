import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

const AssignmentView = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [gradeFormData, setGradeFormData] = useState({});
  const [submittingGrade, setSubmittingGrade] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [assignmentRes, submissionsRes, summaryRes] = await Promise.all([
          api.get(`/assignments/${assignmentId}`),
          api.get(`/submissions/assignment/${assignmentId}/all`),
          api.get(`/submissions/assignment/${assignmentId}/summary`),
        ]);
        setAssignment(assignmentRes.data);
        // Filter to only show submissions that have been submitted (not draft or missing)
        const actualSubmissions = submissionsRes.data.filter(
          s => (s.status === 'submitted' || s.status === 'returned') && s.submittedAt
        );
        setSubmissions(actualSubmissions);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error('Error loading assignment:', error);
        alert('Failed to load assignment');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId]);

  const handleDeleteAssignment = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/assignments/${assignmentId}`);
      alert('Assignment deleted successfully!');
      navigate('/teacher');
    } catch (error) {
      alert('Error deleting assignment: ' + error.response?.data?.error);
    }
  };

  const handleGradeChange = (submissionId, field, value) => {
    setGradeFormData((prev) => ({
      ...prev,
      [submissionId]: { ...prev[submissionId], [field]: value },
    }));
  };
  const handleSaveGrade = async (submissionId) => {
    const formData = gradeFormData[submissionId];
    if (!formData || formData.grade === undefined) {
      alert('Please enter a grade');
      return;
    }

    setSubmittingGrade(submissionId);
    try {
      await api.put(`/submissions/${submissionId}/grade`, {
        grade: parseInt(formData.grade),
        feedback: formData.feedback || '',
      });
      alert('Submission graded successfully!');
      // Reload submissions and summary
      const [submissionsRes, summaryRes] = await Promise.all([
        api.get(`/submissions/assignment/${assignmentId}/all`),
        api.get(`/submissions/assignment/${assignmentId}/summary`),
      ]);
      const actualSubmissions = submissionsRes.data.filter(
        s => (s.status === 'submitted' || s.status === 'returned') && s.submittedAt
      );
      setSubmissions(actualSubmissions);
      setSummary(summaryRes.data);
      setGradeFormData({});
      setGradingSubmission(null);
    } catch (error) {
      alert('Error grading submission: ' + error.response?.data?.error);
    } finally {
      setSubmittingGrade(null);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading assignment..." />;
  }

  if (!assignment) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/teacher')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Classrooms
        </button>
        <EmptyState title="Assignment not found" description="The assignment you're looking for doesn't exist." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start mb-3">
          <button
            onClick={() => navigate('/teacher')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Classrooms
          </button>
          <button
            onClick={handleDeleteAssignment}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
          >
            Delete Assignment
          </button>
        </div>
        <h1 className="text-3xl font-semibold text-slate-900">{assignment.title}</h1>
        <p className="text-slate-600 mt-1">{assignment.description}</p>
      </div>

      {/* Assignment Info */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Status</p>
          <p className={`text-2xl font-bold mt-1 ${
            assignment.status === 'published' ? 'text-green-600' :
            assignment.status === 'draft' ? 'text-yellow-600' :
            'text-gray-600'
          }`}>
            {assignment.status.toUpperCase()}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Due Date</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {new Date(assignment.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Max Points</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{assignment.maxPoints}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Submissions</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{submissions.length}</p>
        </div>
      </div>

      {/* Instructions */}
      {assignment.instructions && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Instructions</h3>
          <p className="text-slate-700">{assignment.instructions}</p>
        </div>
      )}

      {/* Summary Stats */}
      {summary && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-sm text-slate-600">Submitted</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{summary.totalSubmitted}</p>
            <p className="text-xs text-slate-500 mt-1">{summary.totalSubmitted} / {submissions.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-sm text-slate-600">Graded</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{summary.totalGraded}</p>
            <p className="text-xs text-slate-500 mt-1">{summary.totalGraded} / {submissions.length}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-sm text-slate-600">Average Grade</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{summary.averageGrade.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Submissions List */}
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Student Submissions ({submissions.length})
        </h2>

        {submissions.length === 0 ? (
          <EmptyState 
            title="No submissions yet" 
            description="Students will submit their work here." 
          />
        ) : (
          <div className="space-y-3">
            {submissions.map((submission) => (
              <div key={submission._id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 hover:bg-slate-100 transition">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">
                        {submission.student?.name || submission.studentName || 'Unknown Student'}
                      </h3>
                      {submission.isLate && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">LATE</span>
                      )}
                      {submission.grade !== undefined && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                          {submission.grade}/{submission.maxPoints} ({Math.round((submission.grade / submission.maxPoints) * 100)}%)
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      {submission.student?.email || submission.studentEmail} • Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => setGradingSubmission(submission)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm whitespace-nowrap"
                  >
                    {submission.grade !== undefined ? 'View/Edit Grade' : 'Grade'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grading Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {gradingSubmission.student?.name || gradingSubmission.studentName}
                  </h3>
                  <p className="text-sm text-slate-600">{gradingSubmission.student?.email || gradingSubmission.studentEmail}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted: {new Date(gradingSubmission.submittedAt).toLocaleDateString()} at {new Date(gradingSubmission.submittedAt).toLocaleTimeString()}
                  </p>
                  {gradingSubmission.isLate && (
                    <p className="text-xs text-red-600 font-bold mt-1">⚠️ LATE SUBMISSION</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setGradingSubmission(null);
                    setGradeFormData({});
                  }}
                  className="text-slate-400 hover:text-slate-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Submission Content */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-2">Submission Content:</h4>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                  <p className="text-slate-700 whitespace-pre-wrap">{gradingSubmission.content || '(No content provided)'}</p>
                </div>
              </div>

              {/* Grading Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Grade (0-{assignment.maxPoints})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={assignment.maxPoints}
                    value={gradeFormData[gradingSubmission._id]?.grade ?? gradingSubmission.grade ?? ''}
                    onChange={(e) => handleGradeChange(gradingSubmission._id, 'grade', e.target.value)}
                    placeholder="Enter grade"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Feedback (optional)
                  </label>
                  <textarea
                    value={gradeFormData[gradingSubmission._id]?.feedback ?? gradingSubmission.feedback ?? ''}
                    onChange={(e) => handleGradeChange(gradingSubmission._id, 'feedback', e.target.value)}
                    placeholder="Add feedback for the student"
                    rows="4"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleSaveGrade(gradingSubmission._id)}
                  disabled={submittingGrade === gradingSubmission._id}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400"
                >
                  {submittingGrade === gradingSubmission._id ? 'Saving...' : 'Save Grade'}
                </button>
                <button
                  onClick={() => {
                    setGradingSubmission(null);
                    setGradeFormData({});
                  }}
                  className="px-4 py-3 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentView;
