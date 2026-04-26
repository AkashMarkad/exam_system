import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ManageExams from './pages/ManageExams';
import TakeExam from './pages/TakeExam';
import ExamExecution from './pages/ExamExecution';
import Results from './pages/Results';
import Leaderboard from './pages/Leaderboard';
import ManageUsers from './pages/ManageUsers';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected User Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/exams" element={<ProtectedRoute><TakeExam /></ProtectedRoute>} />
        <Route path="/exam/:id/take" element={<ProtectedRoute><ExamExecution /></ProtectedRoute>} />
        <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin/manage-exams" element={<ProtectedRoute adminOnly={true}><ManageExams /></ProtectedRoute>} />
        <Route path="/admin/manage-users" element={<ProtectedRoute adminOnly={true}><ManageUsers /></ProtectedRoute>} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
