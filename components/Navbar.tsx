
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <i className="fas fa-graduation-cap text-xl"></i>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">
            ExamPro
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 hover:text-indigo-600 font-medium transition">
                Dashboard
              </Link>
              <div className="flex items-center space-x-3 pl-6 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 transition"
                  title="Logout"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-100"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
