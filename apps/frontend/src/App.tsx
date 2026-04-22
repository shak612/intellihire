import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import RecruiterDashboard from './pages/RecruiterDashboard';
import CandidatePortal from './pages/CandidatePortal';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import PostJob from './pages/PostJob';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route
              path="/*"
              element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Navigate to="/auth" replace />} />
                    <Route
                      path="/recruiter"
                      element={
                        <ProtectedRoute role="recruiter">
                          <RecruiterDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/post-job"
                      element={
                        <ProtectedRoute role="recruiter">
                          <PostJob />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/analytics"
                      element={
                        <ProtectedRoute role="recruiter">
                          <AnalyticsDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/candidate"
                      element={
                        <ProtectedRoute role="candidate">
                          <CandidatePortal />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </>
              }
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}