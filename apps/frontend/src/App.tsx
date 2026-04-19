import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidatePortal from './pages/CandidatePortal';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/recruiter" replace />} />
          <Route path="/recruiter" element={<RecruiterDashboard />} />
          <Route path="/candidate" element={<CandidatePortal />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}