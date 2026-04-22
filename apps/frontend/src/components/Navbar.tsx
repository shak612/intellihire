import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isRecruiter } = useAuth();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-indigo-600 border-b-2 border-indigo-600'
      : 'text-gray-500 hover:text-gray-800';

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">IH</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">IntelliHire</span>
      </div>

      <div className="flex gap-6">
        {isRecruiter && (
          <>
            <Link to="/recruiter" className={`text-sm pb-1 ${isActive('/recruiter')}`}>
              Shortlist
            </Link>
            <Link to="/post-job" className={`text-sm pb-1 ${isActive('/post-job')}`}>
              Post job
            </Link>
            <Link to="/analytics" className={`text-sm pb-1 ${isActive('/analytics')}`}>
              Analytics
            </Link>
          </>
        )}
        {!isRecruiter && user && (
          <Link to="/candidate" className={`text-sm pb-1 ${isActive('/candidate')}`}>
            Jobs
          </Link>
        )}
      </div>

      <div className="flex items-center gap-3">
        {user ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-700 text-xs font-medium">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-xs text-gray-600">{user.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                user.role === 'recruiter'
                  ? 'bg-purple-50 text-purple-700'
                  : 'bg-green-50 text-green-700'
              }`}>
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Sign out
            </button>
          </>
        ) : (
          <Link to="/auth" className="text-sm text-indigo-600 font-medium">
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
}