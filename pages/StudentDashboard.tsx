import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Exam, Submission, User } from '../types';

interface StudentDashboardProps {
  exams: Exam[];
  submissions: Submission[];
  user: User;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ exams, submissions, user }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const userSubmissions = submissions.filter(s => s.userId === user.id);

  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    exams.forEach(e => {
      const c = e.category || 'General';
      counts[c] = (counts[c] || 0) + 1;
    });
    return [{ name: 'All', count: exams.length }, ...Object.keys(counts).sort().map(name => ({ name, count: counts[name] }))];
  }, [exams]);

  const filteredExams = useMemo(() => {
    if (selectedCategory === 'All') return exams;
    return exams.filter(e => (e.category || 'General') === selectedCategory);
  }, [exams, selectedCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in">
      {/* Header - More Substantial */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-12 border-b-2 border-slate-200/60 dark:border-slate-800/60">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full">
            Verified Record
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter font-syne text-gradient uppercase">
            {user.name.split(' ')[0]} <span className="text-indigo-600 dark:text-indigo-400">Terminal</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg font-medium max-w-xl">
            Official academic repository and performance analytics.
          </p>
        </div>
        
        <div className="flex gap-6">
          <div className="pro-card px-8 py-6 rounded-[2rem] text-center border-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Units</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white leading-none">{userSubmissions.length}</p>
          </div>
          <div className="pro-card px-8 py-6 rounded-[2rem] text-center bg-indigo-600 border-none shadow-indigo-500/20">
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-2">Mastery Rate</p>
            <p className="text-4xl font-black text-white leading-none">
              {userSubmissions.length > 0 ? Math.round((userSubmissions.filter(s => s.status === 'passed').length / userSubmissions.length) * 100) : 0}%
            </p>
          </div>
        </div>
      </header>

      {/* Filter - Larger Buttons */}
      <div className="flex flex-wrap gap-3">
        {categories.map(cat => (
          <button 
            key={cat.name} 
            onClick={() => setSelectedCategory(cat.name)}
            className={`px-8 py-3.5 rounded-2xl text-[11px] font-black tracking-widest transition-all border-2 ${
              selectedCategory === cat.name 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl' 
              : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-900 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {cat.name.toUpperCase()} <span className="opacity-50 ml-1">[{cat.count}]</span>
          </button>
        ))}
      </div>

      {/* Grid - Balanced Size Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {filteredExams.map((exam, idx) => {
          const sub = userSubmissions.find(s => s.examId === exam.id);
          const isDone = !!sub;
          
          return (
            <div 
              key={exam.id} 
              className="pro-card p-10 flex flex-col h-full group border-2 relative overflow-hidden"
              style={{ animationDelay: `${idx * 0.05}s` }}
            >
              <div className="flex justify-between items-start mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  {exam.category || 'GENERAL'}
                </span>
                {isDone && (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 shadow-sm">
                    <i className="fas fa-certificate text-sm"></i>
                  </div>
                )}
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 leading-tight font-syne uppercase tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {exam.title}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 line-clamp-3 leading-relaxed font-medium">
                {exam.description}
              </p>
              
              <div className="grid grid-cols-3 gap-6 mb-10 mt-auto py-6 border-y-2 border-slate-50 dark:border-slate-800/50">
                <div className="text-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1.5">MINS</p>
                  <p className="text-base font-black text-slate-900 dark:text-white">{exam.durationMinutes}</p>
                </div>
                <div className="text-center border-x-2 border-slate-50 dark:border-slate-800/50 px-2">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1.5">SCORE</p>
                  <p className="text-base font-black text-slate-900 dark:text-white">{exam.totalMarks}</p>
                </div>
                <div className="text-center">
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1.5">ITEMS</p>
                  <p className="text-base font-black text-slate-900 dark:text-white">{exam.questions.length}</p>
                </div>
              </div>

              {isDone ? (
                <Link to={`/review/${sub.id}`} className="w-full py-4 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl font-black text-[11px] tracking-widest text-center border-2 border-slate-200 dark:border-slate-700 hover:bg-white hover:border-slate-900 dark:hover:border-white dark:hover:text-white transition-all">
                  REVIEW_RECORD
                </Link>
              ) : (
                <Link to={`/exam/${exam.id}`} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] tracking-widest text-center shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
                  START_ASSESSMENT
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;