import { Route, Routes } from 'react-router-dom';
import './App.css';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/admin/AdminDashboard';
import Analytics from './pages/admin/Analytics';
import ManageUsers from './pages/admin/ManageUsers';
import StudentDashboard from './pages/student/StudentDashboard';
import MyActivities from './pages/student/MyActivities';
import Profile from './pages/student/Profile';
import UploadActivity from './pages/student/UploadActivity';
import PendingActivities from './pages/teacher/PendingActivities';
import TeacherDashboard from './pages/teacher/TeacherDashboard';

const App = () => (
  <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />

    <Route element={<ProtectedRoute roles={['student']} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/upload" element={<UploadActivity />} />
        <Route path="/student/activities" element={<MyActivities />} />
        <Route path="/student/profile" element={<Profile />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={['teacher']} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/pending" element={<PendingActivities />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute roles={['admin']} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/users" element={<ManageUsers />} />
      </Route>
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default App;
