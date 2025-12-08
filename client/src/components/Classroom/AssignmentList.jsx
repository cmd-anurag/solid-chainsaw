import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useParams } from 'react-router-dom';

const AssignmentList = ({ userRole }) => {
  const { classroomId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [classroomId]);

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/api/assignments/classroom/${classroomId}`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;
    try {
      await api.delete(`/api/assignments/${id}`);
      fetchAssignments();
      alert('Assignment deleted successfully!');
    } catch (error) {
      alert('Error deleting assignment: ' + error.response?.data?.error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading assignments...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Assignments</h2>
        {userRole === 'teacher' && (
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            {showCreateForm ? 'Cancel' : 'Create Assignment'}
          </button>
        )}
      </div>

      {showCreateForm && userRole === 'teacher' && (
        <CreateAssignmentForm
          classroomId={classroomId}
          onSuccess={() => {
            setShowCreateForm(false);
            fetchAssignments();
          }}
        />
      )}

      {assignments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No assignments yet
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map(assignment => (
            <div key={assignment._id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{assignment.title}</h3>
                  <p className="text-gray-600 mb-2">{assignment.description}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                    <p>Points: {assignment.maxPoints}</p>
                    <p className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {assignment.status}
                    </p>
                  </div>
                </div>
                {userRole === 'teacher' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.location.href = `/assignment/${assignment._id}`}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      View
                    </button>
                    {assignment.status === 'draft' && (
                      <>
                        <button
                          onClick={() => handleDeleteAssignment(assignment._id)}
                          className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
                {userRole === 'student' && (
                  <button
                    onClick={() => window.location.href = `/assignment/${assignment._id}`}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    View & Submit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateAssignmentForm = ({ classroomId, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxPoints: 100
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/assignments', {
        ...formData,
        classroomId
      });
      alert('Assignment created successfully!');
      onSuccess();
    } catch (error) {
      alert('Error creating assignment: ' + error.response?.data?.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Create New Assignment</h3>
      <input
        type="text"
        name="title"
        placeholder="Assignment Title"
        value={formData.title}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        rows="3"
        required
      ></textarea>
      <textarea
        name="instructions"
        placeholder="Instructions"
        value={formData.instructions}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        rows="3"
      ></textarea>
      <input
        type="datetime-local"
        name="dueDate"
        value={formData.dueDate}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <input
        type="number"
        name="maxPoints"
        placeholder="Max Points"
        value={formData.maxPoints}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Create Assignment
      </button>
    </form>
  );
};

export default AssignmentList;
