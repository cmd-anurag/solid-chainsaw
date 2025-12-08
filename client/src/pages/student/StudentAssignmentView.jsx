import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import api from '../../services/api';

const StudentAssignmentView = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitContent, setSubmitContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const assignmentRes = await api.get(`/assignments/${assignmentId}`);
        setAssignment(assignmentRes.data);

        // Get student's submission for this assignment via classroom submissions list
        const classroomId = assignmentRes.data?.classroom?._id || assignmentRes.data?.classroom;
        if (classroomId) {
          const submissionsRes = await api
            .get(`/submissions/classroom/${classroomId}`)
            .catch(() => null);
          if (submissionsRes?.data) {
            // Only consider actual submitted submissions, not drafts (includes 'submitted' and 'returned' status)
            const submittedOnes = submissionsRes.data.filter(s => s.status === 'submitted' || s.status === 'returned');
            const mine = submittedOnes.find((s) => {
              const submissionAssignmentId = s.assignment?._id || s.assignment;
              return submissionAssignmentId?.toString() === assignmentId?.toString();
            });
            if (mine) {
              setSubmission(mine);
              setSubmitContent(mine.content || '');
            }
          }
        }
      } catch (error) {
        console.error('Error loading assignment:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await api.post('/submissions', {
        assignmentId,
        content: submitContent,
      });
      const newSubmission = response.data.submission || response.data;
      setSubmission(newSubmission);
      setShowSubmitForm(false);
      alert('Assignment submitted successfully!');
      // Reload page to refresh state
      window.location.reload();
    } catch (error) {
      alert('Error submitting assignment: ' + error.response?.data?.error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading assignment..." />;
  }

  if (!assignment) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/student')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Classrooms
        </button>
        <EmptyState title="Assignment not found" description="The assignment you're looking for doesn't exist." />
      </div>
    );
  }

  const daysUntilDue = Math.ceil((new Date(assignment.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0;
  // Student can only submit if: assignment is published, no submission exists, or submission is not yet submitted/graded
  const canSubmit = assignment.status === 'published' && !submission;
  // Hide submit button if submission already exists (submitted or graded)
  const showSubmitButton = canSubmit;

  console.log('Assignment status:', assignment.status);
  console.log('Submission:', submission);
  console.log('Can submit:', canSubmit);

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
        <h1 className="text-3xl font-semibold text-slate-900">{assignment.title}</h1>
        <p className="text-slate-600 mt-1">{assignment.description}</p>
      </div>

      {/* Assignment Info */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Due Date</p>
          <p className="text-lg font-bold text-slate-900 mt-1">
            {new Date(assignment.dueDate).toLocaleDateString()}
          </p>
          <p className={`text-xs mt-2 font-semibold ${isOverdue ? 'text-red-600' : 'text-slate-600'}`}>
            {isOverdue ? 'Overdue' : `${daysUntilDue} days remaining`}
          </p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Points Available</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{assignment.maxPoints}</p>
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <p className="text-sm text-slate-600">Status</p>
          <p className={`text-lg font-bold mt-1 ${
            submission?.grade !== undefined ? 'text-green-600' :
            submission?.status === 'submitted' ? 'text-yellow-600' :
            'text-slate-600'
          }`}>
            {submission?.grade !== undefined ? 'Graded' :
             submission?.status === 'submitted' ? 'Submitted' :
             submission?.status === 'returned' ? 'Returned' :
             'Not Submitted'}
          </p>
        </div>
      </div>

      {/* Instructions */}
      {assignment.instructions && (
        <div className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Instructions</h3>
          <p className="text-slate-700">{assignment.instructions}</p>
        </div>
      )}

      {/* Submission Section */}
      {showSubmitButton ? (
        <>
          {!showSubmitForm ? (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Submit Assignment
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl border border-blue-200 bg-blue-50 p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Response</label>
                <textarea
                  value={submitContent}
                  onChange={(e) => setSubmitContent(e.target.value)}
                  placeholder="Enter your submission content here..."
                  rows="6"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:bg-gray-400"
                >
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubmitForm(false);
                    setSubmitContent('');
                  }}
                  className="px-6 py-2 bg-slate-300 text-slate-900 rounded-lg hover:bg-slate-400 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      ) : null}

      {/* Existing Submission */}
      {submission && (
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Your Submission</h2>
          
          <div className="mb-4 pb-4 border-b border-slate-200">
            <p className="text-sm text-slate-600">Submitted on:</p>
            <p className="font-semibold text-slate-900 mt-1">
              {submission.submittedAt
                ? `${new Date(submission.submittedAt).toLocaleDateString()} at ${new Date(submission.submittedAt).toLocaleTimeString()}`
                : 'Pending timestamp'}
            </p>
            {submission.isLate && (
              <p className="text-red-600 font-semibold mt-2">⚠️ Late Submission</p>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-lg mb-4">
            <p className="text-sm text-slate-600 mb-2">Content:</p>
            <p className="text-slate-900 whitespace-pre-wrap">{submission.content}</p>
          </div>

          {submission.grade !== undefined && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-2">Grade:</p>
              <p className="text-2xl font-bold text-green-600 mb-2">
                {submission.grade}/{submission.maxPoints} ({Math.round((submission.grade / submission.maxPoints) * 100)}%)
              </p>
              {submission.feedback && (
                <>
                  <p className="text-sm text-slate-600 mb-2">Feedback:</p>
                  <p className="text-slate-900 whitespace-pre-wrap">{submission.feedback}</p>
                </>
              )}
            </div>
          )}

        </div>
      )}
    </div>
  );
};

export default StudentAssignmentView;
