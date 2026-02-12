
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Exam, Submission, Question } from '../types';

interface AdminDashboardProps {
  exams: Exam[];
  submissions: Submission[];
  onDelete: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ exams, submissions, onDelete }) => {
  const analytics = useMemo(() => {
    const catStats: Record<string, { totalScore: number; count: number; totalPossible: number }> = {};
    const examAttempts: Record<string, number> = {};
    const questionStats: Record<string, { correct: number; total: number; text: string; examTitle: string }> = {};

    submissions.forEach(sub => {
      const exam = exams.find(e => e.id === sub.examId);
      if (!exam) return;
      const cat = exam.category || 'Other';
      if (!catStats[cat]) catStats[cat] = { totalScore: 0, count: 0, totalPossible: 0 };
      catStats[cat].totalScore += sub.score;
      catStats[cat].totalPossible += exam.totalMarks;
      catStats[cat].count += 1;
      examAttempts[exam.id] = (examAttempts[exam.id] || 0) + 1;
      exam.questions.forEach(q => {
        if (!questionStats[q.id]) {
          questionStats[q.id] = { correct: 0, total: 0, text: q.text, examTitle: exam.title };
        }
        questionStats[q.id].total += 1;
        const answer = sub.answers[q.id];
        let isCorrect = false;
        if (q.type === 'mcq-multi') {
          const sArr = Array.isArray(answer) ? [...(answer as number[])].sort() : [answer as number];
          const cArr = Array.isArray(q.correctAnswer) ? [...(q.correctAnswer as number[])].sort() : [q.correctAnswer as number];
          isCorrect = JSON.stringify(sArr) === JSON.stringify(cArr);
        } else {
          isCorrect = answer === q.correctAnswer;
        }
        if (isCorrect) questionStats[q.id].correct += 1;
      });
    });

    const categories = Object.entries(catStats).map(([name, stats]) => ({
      name,
      avgPercentage: Math.round((stats.totalScore / stats.totalPossible) * 100) || 0,
      count: stats.count
    })).sort((a, b) => b.avgPercentage - a.avgPercentage);

    const popularExams = exams
      .map(e => ({ title: e.title, attempts: examAttempts[e.id] || 0 }))
      .sort((a, b) => b.attempts - a.attempts)
      .slice(0, 5);

    const difficultQuestions = Object.values(questionStats)
      .filter(s => s.total > 2)
      .map(s => ({
        ...s,
        accuracy: Math.round((s.correct / s.total) * 100)
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    return { categories, popularExams, difficultQuestions };
  }, [exams, submissions]);

  return (
    <div className="space-y-12 animate-fade-in-up transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-4">
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tighter font-syne uppercase">Executive Control</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base md:text-lg font-medium">Global intelligence and examination protocol management.</p>
        </div>
        <Link 
          to="/create-exam" 
          className="w-full md:w-auto px-8 py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-2xl shadow-slate-900/10 flex items-center justify-center gap-3 active:scale-95"
        >
          <i className="fas fa-plus-circle text-amber-500"></i> New Assessment
        </Link>
      </header>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {[
          { label: 'Assessment Inventory', val: exams.length, icon: 'fa-layer-group' },
          { label: 'Total Engagement', val: submissions.length, icon: 'fa-fingerprint' },
          { label: 'Item Bank Size', val: exams.reduce((acc, e) => acc + e.questions.length, 0), icon: 'fa-database' },
          { label: 'Passing Quotient', val: submissions.length > 0 ? `${Math.round((submissions.filter(s => s.status === 'passed').length / submissions.length) * 100)}%` : '0%', icon: 'fa-chart-pie' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-900/5 hover:-translate-y-1 transition-all duration-300 group">
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-8 text-slate-400 dark:text-slate-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/20 group-hover:text-indigo-600 transition-all`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Category Performance */}
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-2 h-8 bg-slate-900 dark:bg-indigo-500 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-syne uppercase">Yield Analysis</h2>
          </div>
          <div className="space-y-10">
            {analytics.categories.length === 0 ? (
              <p className="text-slate-400 dark:text-slate-500 italic text-sm py-10 text-center">Data collection in progress...</p>
            ) : (
              analytics.categories.map(cat => (
                <div key={cat.name} className="space-y-4">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest">{cat.name}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{cat.avgPercentage}% Avg.</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 dark:bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${cat.avgPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em]">{cat.count} verified attempts</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Assessments */}
        <div className="bg-slate-900 dark:bg-slate-950 p-8 md:p-12 rounded-[3rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-[5] text-white transition-transform group-hover:rotate-12 duration-1000">
            <i className="fas fa-fire"></i>
          </div>
          <div className="flex items-center gap-4 mb-12 relative z-10">
            <div className="w-2 h-8 bg-amber-400 rounded-full"></div>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight font-syne uppercase">Trending Units</h2>
          </div>
          <div className="space-y-8 relative z-10">
            {analytics.popularExams.length === 0 ? (
              <p className="text-white/40 italic text-sm py-10 text-center">Engagement baseline not established.</p>
            ) : (
              analytics.popularExams.map((exam, i) => (
                <div key={exam.title} className="flex items-center gap-6 group/item">
                   <span className="text-3xl font-black text-white/10 group-hover/item:text-amber-400/30 transition-colors w-10">0{i+1}</span>
                   <div className="flex-1">
                     <p className="text-sm md:text-base font-bold text-white group-hover/item:text-amber-400 transition-colors line-clamp-1">{exam.title}</p>
                     <div className="h-1 w-full bg-white/10 mt-3 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full transition-all duration-1000" 
                          style={{ width: `${(exam.attempts / (submissions.length || 1)) * 100}%` }}
                        ></div>
                     </div>
                   </div>
                   <span className="text-[10px] font-black text-white/40 whitespace-nowrap">{exam.attempts} attempts</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Main Inventory Management */}
      <section>
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-syne uppercase">Inventory Control</h2>
          <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">{exams.length} Protocols Active</span>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-2xl shadow-slate-900/5">
          <div className="responsive-table-container custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Protocol Designation</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Type</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Duration</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center">Engagement</th>
                  <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {exams.map(exam => {
                  const examSubmissions = submissions.filter(s => s.examId === exam.id);
                  return (
                    <tr key={exam.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all group">
                      <td className="px-8 py-8">
                        <p className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{exam.title}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-medium italic tracking-wide">{exam.questions.length} question modules</p>
                      </td>
                      <td className="px-8 py-8 text-center">
                         <span className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest">
                           {exam.category || 'General'}
                         </span>
                      </td>
                      <td className="px-8 py-8 text-center font-mono text-[10px] text-slate-500 dark:text-slate-400 tracking-widest">{exam.durationMinutes} MIN</td>
                      <td className="px-8 py-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <span className="text-sm font-bold text-slate-900 dark:text-white">{examSubmissions.length}</span>
                           <span className="text-[9px] text-slate-300 dark:text-slate-600 font-bold uppercase tracking-widest">Entries</span>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-3">
                          <button className="w-11 h-11 rounded-2xl text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center justify-center transition-all">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            onClick={() => window.confirm('Permanently purge this assessment ledger?') && onDelete(exam.id)}
                            className="w-11 h-11 rounded-2xl text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center justify-center transition-all"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
