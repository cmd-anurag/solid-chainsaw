import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useParams } from 'react-router-dom';

const AssignmentDetail = ({ userRole }) => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showGradeForm, setShowGradeForm] = useState(null);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await api.get(`/api/assignments/${assignmentId}`);
      setAssignment(response.data);

      if (userRole === 'teacher') {
        const submissionsResponse = await api.get(
          `/api/submissions/assignment/${assignmentId}/all`
        );
        setSubmissions(submissionsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.put(`/api/assignments/${assignmentId}/publish`);
      alert('Assignment published successfully!');
      fetchAssignment();
    } catch (error) {
      alert('Error publishing assignment: ' + error.response?.data?.error);
    }
  };

  const handleClose = async () => {
    try {
      await api.put(`/api/assignments/${assignmentId}/close`);
      alert('Assignment closed successfully!');
      fetchAssignment();
    } catch (error) {
      alert('Error closing assignment: ' + error.response?.data?.error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading assignment...</div>;
  }

  if (!assignment) {
    return <div className="text-center py-8">Assignment not found</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{assignment.title}</h1>
        <p className="text-gray-600 mb-4">{assignment.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="border rounded p-3">
            <p className="text-sm text-gray-600">Due Date</p>
            <p className="font-semibold">{new Date(assignment.dueDate).toLocaleDateString()}</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-600">Max Points</p>
            <p className="font-semibold">{assignment.maxPoints}</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold capitalize">{assignment.status}</p>
          </div>
          <div className="border rounded p-3">
            <p className="text-sm text-gray-600">Teacher</p>
            <p className="font-semibold">{assignment.teacher?.name}</p>
          </div>
        </div>

        {assignment.instructions && (
          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
            <h3 className="font-semibold mb-2">Instructions</h3>
            <p>{assignment.instructions}</p>
          </div>
        )}

        {userRole === 'teacher' && assignment.status === 'draft' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handlePublish}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Publish Assignment
            </button>
          </div>
        )}

        {userRole === 'teacher' && assignment.status === 'published' && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleClose}
              className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
            >
              Close Assignment
            </button>
          </div>
        )}

        {userRole === 'student' && assignment.status === 'published' && (
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {showSubmitForm ? 'Cancel' : 'Submit Assignment'}
          </button>
        )}
      </div>

      {showSubmitForm && userRole === 'student' && (
        <SubmitAssignmentForm
          assignmentId={assignmentId}
          onSuccess={() => {
            setShowSubmitForm(false);
            fetchAssignment();
          }}
        />
      )}

      {userRole === 'teacher' && (
        <SubmissionsList
          submissions={submissions}
          assignmentId={assignmentId}
          maxPoints={assignment.maxPoints}
          onGradeSuccess={() => {
            setShowGradeForm(null);
            fetchAssignment();
          }}
        />
      )}
    </div>
  );
};

const SubmitAssignmentForm = ({ assignmentId, onSuccess }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/submissions', {
        assignmentId,
        content
      });
      alert('Assignment submitted successfully!');
      onSuccess();
    } catch (error) {
      alert('Error submitting assignment: ' + error.response?.data?.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-4">Submit Assignment</h3>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Your submission content here..."
        className="w-full px-3 py-2 border rounded mb-3"
        rows="5"
        required
      ></textarea>
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {submitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
};

const SubmissionsList = ({ submissions, assignmentId, maxPoints, onGradeSuccess }) => {
  const [showGradeForm, setShowGradeForm] = useState(null);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Submissions ({submissions.length})</h2>

      {submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No submissions yet
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map(submission => (
            <div key={submission._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold">{submission.student?.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {submission.student?.rollNumber}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                    {submission.isLate && (
                      <span className="ml-2 text-red-600 font-semibold">LATE</span>
                    )}
                  </p>
                  {submission.grade !== undefined && (
                    <div className="mt-2 p-2 bg-green-50 rounded">
                      <p className="text-sm">
                        <strong>Grade:</strong> {submission.grade}/{maxPoints}
                        ({Math.round((submission.grade / maxPoints) * 100)}%)
                      </p>
                      {submission.feedback && (
                        <p className="text-sm mt-1"><strong>Feedback:</strong> {submission.feedback}</p>
                      )}
                    </div>
                  )}
                </div>
                {submission.status !== 'returned' || submission.grade === undefined ? (
                  <button
                    onClick={() => setShowGradeForm(
                      showGradeForm === submission._id ? null : submission._id
                    )}
                    className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600"
                  >
                    {showGradeForm === submission._id ? 'Cancel' : 'Grade'}
                  </button>
                ) : null}
              </div>

              {showGradeForm === submission._id && (
                <GradeForm
                  submissionId={submission._id}
                  maxPoints={maxPoints}
                  onSuccess={() => {
                    setShowGradeForm(null);
                    onGradeSuccess();
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const GradeForm = ({ submissionId, maxPoints, onSuccess }) => {
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.put(`/api/submissions/${submissionId}/grade`, {
        grade: parseInt(grade),
        feedback
      });
      alert('Submission graded successfully!');
      onSuccess();
    } catch (error) {
      alert('Error grading submission: ' + error.response?.data?.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 p-3 bg-gray-50 rounded border">
      <input
        type="number"
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        placeholder={`Grade (0-${maxPoints})`}
        min="0"
        max={maxPoints}
        className="w-full px-3 py-2 border rounded mb-2"
        required
      />
      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Feedback (optional)"
        className="w-full px-3 py-2 border rounded mb-2"
        rows="3"
      ></textarea>
      <button
        type="submit"
        disabled={submitting}
        className="w-full px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:bg-gray-400"
      >
        {submitting ? 'Saving...' : 'Save Grade'}
      </button>
    </form>
  );
};

export default AssignmentDetail;
