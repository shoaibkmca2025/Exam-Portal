
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[100] transition-colors duration-300">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-2 shrink-0">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <i className="fas fa-graduation-cap text-lg md:text-xl"></i>
          </div>
          <span className="text-lg md:text-xl font-bold bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300 bg-clip-text text-transparent">
            ExamPro
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <button 
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
          </button>

          {user ? (
            <>
              <Link to="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition">
                Dashboard
              </Link>
              <div className="flex items-center space-x-3 pl-6 border-l border-slate-200 dark:border-slate-800">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.role}</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user.name}</p>
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
              className="px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition shadow-md shadow-indigo-100 dark:shadow-none"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button 
            onClick={onToggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-all"
          >
            <i className={`fas ${theme === 'dark' ? 'fa-sun text-amber-400' : 'fa-moon text-indigo-600'}`}></i>
          </button>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300"
          >
            <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 animate-fade-in-up shadow-xl transition-colors duration-300">
          <div className="px-4 py-6 space-y-4">
            {user ? (
              <>
                <div className="pb-4 border-b border-slate-50 dark:border-slate-800">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{user.role}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left py-3 text-rose-500 font-bold"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="block w-full py-4 bg-indigo-600 text-white rounded-xl text-center font-bold"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
