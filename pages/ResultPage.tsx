import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Submission, Exam } from '../types';
import { getPerformanceInsights } from '../geminiService';

interface ResultPageProps {
  submissions: Submission[];
  exams: Exam[];
}

const ResultPage: React.FC<ResultPageProps> = ({ submissions, exams }) => {
  const { id } = useParams();
  const location = useLocation();
  
  const submission = useMemo(() => {
    if (location.state?.submission) return location.state.submission as Submission;
    return submissions.find(s => s.id === id);
  }, [id, submissions, location.state]);

  const exam = useMemo(() => {
    if (!submission) return undefined;
    return exams.find(e => e.id === submission.examId);
  }, [exams, submission]);

  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (exam && submission) {
      setLoadingInsights(true);
      getPerformanceInsights(exam, submission).then(res => {
        setInsights(res);
        setLoadingInsights(false);
      });
    }
  }, [exam, submission]);

  if (!submission || !exam) return (
    <div className="max-w-3xl mx-auto py-24 text-center">
      <div className="w-10 h-10 border-2 border-slate-200 dark:border-slate-800 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Performance Data...</p>
    </div>
  );

  const passed = submission.status === 'passed';

  return (
    <div className="max-w-2xl mx-auto py-12 animate-in px-4">
      <div className="pro-card rounded-[2.5rem] overflow-hidden border-2">
        <div className={`p-12 text-center relative ${passed ? 'bg-slate-900 dark:bg-slate-950' : 'bg-rose-900 dark:bg-rose-950'}`}>
          <div className="absolute top-0 right-0 p-8 opacity-5 scale-[3] text-white">
             <i className={`fas ${passed ? 'fa-award' : 'fa-circle-exclamation'}`}></i>
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 tracking-tighter font-syne">
            {passed ? 'Assessment Success' : 'Session Recorded'}
          </h1>
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
            {exam.title}
          </p>
        </div>

        <div className="p-10 md:p-14 space-y-10">
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center border-b border-slate-100 dark:border-slate-800 pb-10">
             <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Score</p>
               <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                 {submission.percentage}%
               </div>
             </div>
             
             <div className="sm:border-x border-slate-100 dark:border-slate-800 px-4">
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Integrity</p>
               <div className={`text-xl font-bold ${submission.integrityViolations === 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {submission.integrityViolations || 0} Issues
               </div>
             </div>

             <div>
               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
               <div className={`text-xl font-black uppercase tracking-widest ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {submission.status}
               </div>
             </div>
           </div>

           <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
             <div className="flex items-center gap-2 mb-4">
               <i className="fas fa-sparkles text-indigo-500 text-xs"></i>
               <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">AI Intelligence Report</h3>
             </div>
             <div className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs italic font-medium">
               {loadingInsights ? "Analyzing telemetry..." : insights}
             </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-3">
             <Link to={`/review/${submission.id}`} className="flex-1 py-4 bg-indigo-600 text-white rounded-xl font-bold uppercase tracking-widest text-[9px] text-center shadow-lg hover:bg-indigo-700 transition-all">
               Detailed Review
             </Link>
             <Link to="/dashboard" className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[9px] uppercase tracking-widest text-center hover:bg-slate-50">
               Return Home
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;