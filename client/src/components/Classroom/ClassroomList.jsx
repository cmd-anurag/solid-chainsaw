import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const ClassroomList = ({ userRole }) => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      const endpoint = userRole === 'teacher' 
        ? '/api/classrooms/teacher/all' 
        : '/api/classrooms/student/all';
      const response = await api.get(endpoint);
      setClassrooms(response.data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClassroom = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/classrooms/join/code', { code: joinCode });
      setJoinCode('');
      fetchClassrooms();
      alert('Joined classroom successfully!');
    } catch (error) {
      alert('Error joining classroom: ' + error.response?.data?.error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading classrooms...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Classrooms</h2>
        {userRole === 'student' && (
          <div className="flex gap-4">
            <form onSubmit={handleJoinClassroom} className="flex gap-2">
              <input
                type="text"
                placeholder="Enter classroom code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                className="px-3 py-2 border rounded"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Join
              </button>
            </form>
          </div>
        )}
      </div>

      {classrooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No classrooms {userRole === 'student' ? 'joined yet' : 'created yet'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classrooms.map(classroom => (
            <div
              key={classroom._id}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <h3 className="text-lg font-semibold mb-2">{classroom.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{classroom.description}</p>
              <p className="text-sm text-gray-500 mb-3">
                Section: {classroom.section} | Dept: {classroom.department}
              </p>
              {userRole === 'teacher' && (
                <p className="text-xs bg-gray-100 p-2 rounded mb-3">
                  Code: <strong>{classroom.code}</strong>
                </p>
              )}
              <p className="text-xs text-gray-500 mb-3">
                Students: {classroom.students?.length || 0}
              </p>
              <button
                onClick={() => window.location.href = `/classroom/${classroom._id}`}
                className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Open Classroom
              </button>
            </div>
          ))}
        </div>
      )}

      {userRole === 'teacher' && (
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showCreateForm ? 'Cancel' : 'Create Classroom'}
        </button>
      )}

      {showCreateForm && <CreateClassroomForm onSuccess={() => {
        setShowCreateForm(false);
        fetchClassrooms();
      }} />}
    </div>
  );
};

const CreateClassroomForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    section: '',
    department: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/classrooms', formData);
      alert('Classroom created successfully!');
      onSuccess();
    } catch (error) {
      alert('Error creating classroom: ' + error.response?.data?.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-4">Create New Classroom</h3>
      <input
        type="text"
        name="name"
        placeholder="Classroom Name"
        value={formData.name}
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
      ></textarea>
      <input
        type="text"
        name="section"
        placeholder="Section"
        value={formData.section}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <input
        type="text"
        name="department"
        placeholder="Department"
        value={formData.department}
        onChange={handleChange}
        className="w-full px-3 py-2 border rounded mb-3"
        required
      />
      <button
        type="submit"
        className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Create Classroom
      </button>
    </form>
  );
};

export default ClassroomList;
