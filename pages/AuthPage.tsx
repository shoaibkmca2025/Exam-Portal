import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: isLogin ? (formData.email.split('@')[0]) : formData.name,
      email: formData.email,
      role: role
    };
    onLogin(user);
  };

  return (
    <div className="max-w-xl mx-auto py-20 px-6 animate-in">
      <div className="pro-card p-10 md:p-14 border-2">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 mb-6">
            <i className={`fas ${isLogin ? 'fa-lock-open' : 'fa-id-badge'} text-2xl`}></i>
          </div>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white font-syne tracking-tighter uppercase">
            {isLogin ? 'Identity Sync' : 'Initialize Record'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-3 font-medium text-base">
            {isLogin ? 'Authenticate to resume your session.' : 'Establish your official academic ledger.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Segmented Controller - Refined */}
          <div className="relative flex bg-slate-100 dark:bg-slate-800 p-2 rounded-[1.5rem]">
            <div 
              className={`absolute top-2 bottom-2 w-[calc(50%-8px)] bg-white dark:bg-slate-700 rounded-xl shadow-md transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${role === 'admin' ? 'translate-x-full' : 'translate-x-0'}`}
            ></div>
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`relative z-10 flex-1 py-4 text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${role === 'student' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`relative z-10 flex-1 py-4 text-[12px] font-black uppercase tracking-[0.2em] transition-colors ${role === 'admin' ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}
            >
              Inspector
            </button>
          </div>

          <div className="space-y-6">
            {!isLogin && (
              <div className="space-y-2.5">
                <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Legal Designation</label>
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-8 py-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-lg"
                  placeholder="Jane Sterling"
                />
              </div>
            )}

            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Protocol Email</label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-8 py-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-lg"
                placeholder="jane@academy.edu"
              />
            </div>

            <div className="space-y-2.5">
              <label className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Secure Cipher</label>
              <input
                required
                type="password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-8 py-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold text-lg"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-6 bg-slate-900 dark:bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-[12px] hover:bg-slate-800 dark:hover:bg-indigo-700 hover:-translate-y-1 transition-all shadow-xl shadow-slate-900/10 dark:shadow-indigo-500/20 active:scale-[0.97] mt-10"
          >
            {isLogin ? 'Authenticate Session' : 'Establish Record'}
          </button>
        </form>

        <div className="mt-12 pt-10 border-t border-slate-50 dark:border-slate-800 text-center">
          <p className="text-sm font-bold text-slate-400">
            {isLogin ? "New to the terminal?" : "Already verified?"}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-3 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-widest hover:underline active:opacity-60"
            >
              {isLogin ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;