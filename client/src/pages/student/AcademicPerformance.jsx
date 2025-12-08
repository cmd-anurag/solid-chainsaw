// frontend/src/pages/student/AcademicPerformance.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import MarksTable from '../../components/Academic/MarksTable';
import SGPAChart from '../../components/Academic/Charts/SGPAChart';
import CGPAProgress from '../../components/Academic/Charts/CGPAProgress';
import AcademicRecordForm from '../../components/Academic/AcademicRecordForm';
import api from '../../services/api';
import { useAuthContext } from '../../context/AuthContext';

const AcademicPerformance = ({ studentId: propStudentId }) => {
  const params = useParams();
  const { user } = useAuthContext();
  const [records, setRecords] = useState([]);
  const [cgpa, setCgpa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Use prop if provided (when embedded), otherwise use route param or current user
  const studentId = propStudentId || params?.id || user?._id || user?.id;

  const fetchRecords = async () => {
    try {
      const { data } = await api.get(`/students/${studentId}/marks`);
      setRecords(data);
    } catch (error) {
      console.error('Error fetching records:', error);
    }
  };

  const fetchCGPA = async () => {
    try {
      const { data } = await api.get(`/students/${studentId}/cgpa`);
      setCgpa(data.cgpa);
    } catch (error) {
      console.error('Error fetching CGPA:', error);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchRecords(), fetchCGPA()]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  const handleFormSubmit = async () => {
    await Promise.all([fetchRecords(), fetchCGPA()]);
    setShowForm(false);
    setEditingRecord(null);
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setShowForm(true);
  };

  const handleDelete = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await api.delete(`/marks/${recordId}`);
        await Promise.all([fetchRecords(), fetchCGPA()]);
      } catch (error) {
        console.error('Error deleting record:', error);
        alert('Failed to delete record');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading academic records..." />;
  }

  const canEdit = user?.role === 'admin' || (user?.permissions?.includes('editMarks') && user?.role === 'teacher');

  return (
    <div className="space-y-8">
      {/* CGPA Progress Bar */}
      {cgpa !== null && <CGPAProgress cgpa={cgpa} />}

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setEditingRecord(null);
              setShowForm(true);
            }}
            className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add New Record
          </button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-slate-900">
                {editingRecord ? 'Edit Academic Record' : 'Add Academic Record'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingRecord(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <AcademicRecordForm
              studentId={studentId}
              record={editingRecord}
              onSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingRecord(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Charts */}
      {records.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-900/5">
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">SGPA Trend</p>
            <div className="mt-6">
              <SGPAChart records={records} />
            </div>
          </div>
        </div>
      )}

      {/* Marks Table */}
      {records.length > 0 ? (
        <MarksTable
          records={records}
          onEdit={canEdit ? handleEdit : null}
          onDelete={canEdit ? handleDelete : null}
        />
      ) : (
        <EmptyState
          title="No academic records"
          description="Academic records will appear here once they are added."
        />
      )}
    </div>
  );
};

export default AcademicPerformance;

