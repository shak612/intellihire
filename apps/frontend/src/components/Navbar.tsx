import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path
      ? 'text-indigo-600 border-b-2 border-indigo-600'
      : 'text-gray-500 hover:text-gray-800';

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs font-bold">IH</span>
        </div>
        <span className="font-semibold text-gray-900 text-sm">IntelliHire</span>
      </div>
      <div className="flex gap-6">
        <Link to="/recruiter" className={`text-sm pb-1 ${isActive('/recruiter')}`}>
          Recruiter
        </Link>
        <Link to="/candidate" className={`text-sm pb-1 ${isActive('/candidate')}`}>
          Candidate
        </Link>
      </div>
    </nav>
  );
}