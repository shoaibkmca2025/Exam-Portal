
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Exam, Submission, Question } from '../types';

interface AdminDashboardProps {
  exams: Exam[];
  submissions: Submission[];
  onDelete: (id: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ exams, submissions, onDelete }) => {
  // Analytics Calculations
  const analytics = useMemo(() => {
    // 1. Category Performance
    const catStats: Record<string, { totalScore: number; count: number; totalPossible: number }> = {};
    
    // 2. Exam Popularity
    const examAttempts: Record<string, number> = {};

    // 3. Question Performance (to find difficult ones)
    const questionStats: Record<string, { correct: number; total: number; text: string; examTitle: string }> = {};

    submissions.forEach(sub => {
      const exam = exams.find(e => e.id === sub.examId);
      if (!exam) return;

      // Category tracking
      const cat = exam.category || 'Other';
      if (!catStats[cat]) catStats[cat] = { totalScore: 0, count: 0, totalPossible: 0 };
      catStats[cat].totalScore += sub.score;
      catStats[cat].totalPossible += exam.totalMarks;
      catStats[cat].count += 1;

      // Popularity tracking
      examAttempts[exam.id] = (examAttempts[exam.id] || 0) + 1;

      // Question accuracy tracking
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
      .filter(s => s.total > 2) // Only show if enough data
      .map(s => ({
        ...s,
        accuracy: Math.round((s.correct / s.total) * 100)
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);

    return { categories, popularExams, difficultQuestions };
  }, [exams, submissions]);

  return (
    <div className="space-y-12 animate-fade-in-up">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Executive Control</h1>
          <p className="text-slate-500 mt-2 text-lg font-medium">Global intelligence and examination management dashboard.</p>
        </div>
        <Link 
          to="/create-exam" 
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3"
        >
          <i className="fas fa-plus-circle text-amber-500"></i> New Assessment
        </Link>
      </header>

      {/* Global Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Assessment Inventory', val: exams.length, icon: 'fa-layer-group', color: 'slate' },
          { label: 'Total Engagement', val: submissions.length, icon: 'fa-fingerprint', color: 'indigo' },
          { label: 'Item Bank Size', val: exams.reduce((acc, e) => acc + e.questions.length, 0), icon: 'fa-database', color: 'amber' },
          { label: 'Passing Quotient', val: submissions.length > 0 ? `${Math.round((submissions.filter(s => s.status === 'passed').length / submissions.length) * 100)}%` : '0%', icon: 'fa-chart-pie', color: 'emerald' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 text-slate-400`}>
              <i className={`fas ${stat.icon} text-xl`}></i>
            </div>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
            <p className="text-3xl font-black text-slate-900 tracking-tighter">{stat.val}</p>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Category Performance */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Category Yield Analysis</h2>
          </div>
          <div className="space-y-8">
            {analytics.categories.length === 0 ? (
              <p className="text-slate-400 italic text-sm py-10 text-center">No category data accumulated yet.</p>
            ) : (
              analytics.categories.map(cat => (
                <div key={cat.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                    <span className="text-xs font-black text-slate-900">{cat.avgPercentage}% Avg.</span>
                  </div>
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-slate-900 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${cat.avgPercentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{cat.count} total attempts</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Popular Assessments */}
        <div className="bg-slate-900 p-10 rounded-[3rem] shadow-2xl shadow-slate-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-5 scale-[4] text-white">
            <i className="fas fa-fire"></i>
          </div>
          <div className="flex items-center gap-3 mb-10 relative z-10">
            <div className="w-1.5 h-6 bg-amber-400 rounded-full"></div>
            <h2 className="text-xl font-bold text-white tracking-tight">Popular Assessments</h2>
          </div>
          <div className="space-y-6 relative z-10">
            {analytics.popularExams.length === 0 ? (
              <p className="text-white/40 italic text-sm py-10 text-center">No engagement recorded.</p>
            ) : (
              analytics.popularExams.map((exam, i) => (
                <div key={exam.title} className="flex items-center gap-6 group">
                   <span className="text-2xl font-black text-white/10 group-hover:text-amber-400/20 transition-colors w-8">0{i+1}</span>
                   <div className="flex-1">
                     <p className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">{exam.title}</p>
                     <div className="h-1 w-full bg-white/5 mt-2 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${(exam.attempts / (submissions.length || 1)) * 100}%` }}
                        ></div>
                     </div>
                   </div>
                   <span className="text-xs font-black text-white/40">{exam.attempts} tries</span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Difficulty Analysis */}
      <section className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Difficulty Mapping (Top Missed Questions)</h2>
          </div>
          <span className="px-4 py-1.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">Action Required</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Fragment</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source Assessment</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Success Rate</th>
                <th className="pb-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Attempts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {analytics.difficultQuestions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400 italic text-sm">Insufficient data for difficulty mapping.</td>
                </tr>
              ) : (
                analytics.difficultQuestions.map((q, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 pr-8">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-rose-600 transition-colors">{q.text}</p>
                    </td>
                    <td className="py-6">
                      <span className="text-[11px] font-medium text-slate-400">{q.examTitle}</span>
                    </td>
                    <td className="py-6">
                      <div className="flex items-center gap-3">
                         <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-rose-500" style={{ width: `${q.accuracy}%` }}></div>
                         </div>
                         <span className={`text-xs font-black ${q.accuracy < 30 ? 'text-rose-600' : 'text-slate-600'}`}>{q.accuracy}%</span>
                      </div>
                    </td>
                    <td className="py-6 text-right font-black text-slate-900 text-sm">{q.total}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Main Exam Management Table */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Management</h2>
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{exams.length} Items Listed</span>
        </div>
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/40">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assessment Designation</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Classification</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {exams.map(exam => {
                const examSubmissions = submissions.filter(s => s.examId === exam.id);

                return (
                  <tr key={exam.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-8">
                      <p className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{exam.title}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-medium italic">{exam.questions.length} Question Units</p>
                    </td>
                    <td className="px-10 py-8">
                       <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                         {exam.category || 'General'}
                       </span>
                    </td>
                    <td className="px-10 py-8 font-mono text-xs text-slate-500">{exam.durationMinutes} MIN</td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-2">
                         <span className="text-sm font-bold text-slate-900">{examSubmissions.length}</span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase">Record(s)</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="w-10 h-10 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all flex items-center justify-center">
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          onClick={() => {
                            if (window.confirm('Erase this assessment record permanently?')) {
                              onDelete(exam.id);
                            }
                          }}
                          className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-slate-400 italic font-medium">No assessment protocols found in active memory.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
