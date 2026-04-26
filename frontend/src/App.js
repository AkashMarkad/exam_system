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
import AdminResults from './pages/AdminResults';
import Leaderboard from './pages/Leaderboard';
import ManageUsers from './pages/ManageUsers';
import './styles/App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/manage-exams" element={<ManageExams />} />
        <Route path="/admin/manage-users" element={<ManageUsers />} />
        <Route path="/exams" element={<TakeExam />} />
        <Route path="/exam/:id/take" element={<ExamExecution />} />
        <Route path="/results" element={<Results />} />
        <Route path="/admin/results" element={<AdminResults />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
