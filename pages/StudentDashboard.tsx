
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
  const attemptedIds = userSubmissions.map(s => s.examId);

  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    exams.forEach(e => {
      const cat = e.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const sortedCats = Object.keys(counts).sort();
    return [{ name: 'All', count: exams.length }, ...sortedCats.map(name => ({ name, count: counts[name] }))];
  }, [exams]);

  const filteredExams = useMemo(() => {
    if (selectedCategory === 'All') return exams;
    return exams.filter(e => (e.category || 'General') === selectedCategory);
  }, [exams, selectedCategory]);

  return (
    <div className="space-y-12 animate-fade-in-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 border-b border-slate-100 pb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Portfolio <span className="text-slate-400 font-light">/</span> {user.name}
          </h1>
          <p className="text-slate-500 mt-2 text-lg">Your academic progress and available assessments.</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-1">Completion</p>
            <p className="text-2xl font-black text-slate-900">{userSubmissions.length}</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-slate-100 flex items-center justify-center text-amber-500 font-bold">
            {userSubmissions.length > 0 ? Math.round((userSubmissions.filter(s => s.status === 'passed').length / userSubmissions.length) * 100) : 0}%
          </div>
        </div>
      </header>

      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Active Assessments</h2>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar no-scrollbar">
            {categoriesWithCounts.map(cat => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                  selectedCategory === cat.name 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-slate-900 hover:text-slate-900'
                }`}
              >
                {cat.name}
                <span className={`px-2 py-0.5 rounded-md text-[10px] ${selectedCategory === cat.name ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-400'}`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredExams.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center opacity-60">
              <i className="fas fa-layer-group text-5xl text-slate-300 mb-6 block"></i>
              <p className="text-slate-500 font-medium">No assessments found in "{selectedCategory}"</p>
            </div>
          )}
          {filteredExams.map((exam, idx) => {
            const isAttempted = attemptedIds.includes(exam.id);
            const submission = userSubmissions.find(s => s.examId === exam.id);
            
            return (
              <div 
                key={exam.id} 
                className={`group bg-white rounded-3xl border border-slate-100 p-8 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500 relative flex flex-col opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${(idx + 1) * 0.1}s`, animationFillMode: 'forwards' }}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ${isAttempted ? 'bg-slate-50 text-slate-400' : 'bg-amber-50 text-amber-600 group-hover:bg-slate-900 group-hover:text-white'}`}>
                    <i className={`fas ${isAttempted ? 'fa-check-double' : 'fa-feather-pointed'}`}></i>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 text-slate-500 rounded-lg">
                      {exam.category || 'General'}
                    </span>
                    {isAttempted && (
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${submission?.status === 'passed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {submission?.status}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-amber-600 transition-colors">{exam.title}</h3>
                <p className="text-slate-500 text-sm mb-8 line-clamp-2 leading-relaxed font-light">{exam.description}</p>
                
                <div className="flex items-center gap-6 mb-10 mt-auto">
                  <div className="text-slate-400 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Time</span>
                    <span className="text-sm font-bold text-slate-700">{exam.durationMinutes}m</span>
                  </div>
                  <div className="text-slate-400 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Credits</span>
                    <span className="text-sm font-bold text-slate-700">{exam.totalMarks}</span>
                  </div>
                  <div className="text-slate-400 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Items</span>
                    <span className="text-sm font-bold text-slate-700">{exam.questions.length}</span>
                  </div>
                </div>

                {isAttempted ? (
                  <Link 
                    to={`/review/${submission?.id}`}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-50 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all border border-slate-100"
                  >
                    View Insight <i className="fas fa-arrow-right text-xs"></i>
                  </Link>
                ) : (
                  <Link 
                    to={`/exam/${exam.id}`}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                  >
                    Take Assessment <i className="fas fa-play text-[10px]"></i>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {userSubmissions.length > 0 && (
        <section className="bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-[4] rotate-12">
            <i className="fas fa-history"></i>
          </div>
          <h2 className="text-3xl font-bold mb-10 flex items-center gap-4 relative z-10">
            Performance Ledger
          </h2>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Assignment</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Category</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Yield</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Standing</th>
                  <th className="pb-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Insight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {userSubmissions.map(sub => {
                  const exam = exams.find(e => e.id === sub.examId);
                  return (
                    <tr key={sub.id} className="group hover:bg-white/5 transition-all">
                      <td className="py-6 font-bold text-white pr-4">{exam?.title || 'Archive Entry'}</td>
                      <td className="py-6">
                        <span className="px-2 py-1 bg-white/10 text-slate-300 rounded text-[9px] font-black uppercase tracking-widest">
                          {exam?.category || 'General'}
                        </span>
                      </td>
                      <td className="py-6 font-mono text-amber-400 font-bold">{sub.score} <span className="text-white/20">/</span> {exam?.totalMarks}</td>
                      <td className="py-6">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-widest ${sub.status === 'passed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {sub.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <Link to={`/review/${sub.id}`} className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group-hover:translate-x-1">
                          <span className="text-xs font-bold uppercase tracking-widest">Review</span>
                          <i className="fas fa-chevron-right text-[10px]"></i>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default StudentDashboard;
