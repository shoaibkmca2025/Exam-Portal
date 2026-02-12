
import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { Submission, Exam } from '../types';
import { getPerformanceInsights } from '../geminiService';

interface ResultPageProps {
  submissions: Submission[];
  exams: Exam[];
}

const ResultPage: React.FC<ResultPageProps> = ({ submissions, exams }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // High-res data finding strategy
  const submission = useMemo(() => {
    // 1. Direct location state (most accurate/fastest)
    const fromState = location.state?.submission as Submission | undefined;
    if (fromState && fromState.id === id) return fromState;
    
    // 2. Props (global state)
    const fromProps = submissions.find(s => s.id === id);
    if (fromProps) return fromProps;
    
    // 3. Rescue logic: Emergency localStorage bridge
    try {
      const rescuedRaw = localStorage.getItem('exampro_last_submission');
      if (rescuedRaw) {
        const rescued = JSON.parse(rescuedRaw) as Submission;
        if (rescued.id === id) return rescued;
      }
    } catch (e) {
      console.warn("Rescue logic failed", e);
    }
    
    return undefined;
  }, [id, submissions, location.state]);

  const exam = useMemo(() => {
    if (!submission) return undefined;
    
    // Try to get exam from direct state
    const fromState = location.state?.exam as Exam | undefined;
    if (fromState && fromState.id === submission.examId) return fromState;
    
    // Fallback to searching in prop exams
    return exams.find(e => e.id === submission.examId);
  }, [exams, submission, location.state]);

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
    <div className="max-w-3xl mx-auto py-24 text-center space-y-6 animate-pulse">
      <div className="w-20 h-20 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin mx-auto"></div>
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Syncing Result Ledger...</h2>
      <p className="text-slate-400 font-medium max-w-sm mx-auto">Connecting to verification server. This may take a moment if your network is slow.</p>
      <div className="pt-8 flex justify-center gap-4">
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm"
        >
          Retry Sync
        </button>
        <button 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const passed = submission.status === 'passed';

  return (
    <div className="max-w-3xl mx-auto py-12 animate-fade-in-up">
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className={`p-16 text-center relative ${passed ? 'bg-slate-900' : 'bg-rose-900'}`}>
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-[5] text-white pointer-events-none">
             <i className={`fas ${passed ? 'fa-award' : 'fa-circle-exclamation'}`}></i>
          </div>
          <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] mb-6">Credential Review</p>
          <h1 className="text-5xl font-extrabold text-white mb-4 tracking-tighter">
            {passed ? 'High Achievement' : 'Performance Report'}
          </h1>
          <p className="text-white/60 max-w-sm mx-auto font-light leading-relaxed">
            Record for <span className="text-white font-bold">{exam.title}</span> finalized on {new Date(submission.submittedAt).toLocaleDateString()}.
          </p>
        </div>

        <div className="p-16 space-y-16">
           <div className="flex flex-col md:flex-row justify-between items-center gap-10">
             <div className="text-center md:text-left">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Total Score</p>
               <div className="text-5xl font-black text-slate-900 tracking-tighter">
                 {submission.score} <span className="text-lg text-slate-200 font-medium tracking-normal ml-1">/ {exam.totalMarks} PTS</span>
               </div>
             </div>
             
             <div className="w-px h-16 bg-slate-100 hidden md:block"></div>

             <div className="text-center">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Yield Rate</p>
               <div className={`text-5xl font-black tracking-tighter ${passed ? 'text-amber-500' : 'text-rose-500'}`}>
                 {submission.percentage}%
               </div>
             </div>

             <div className="w-px h-16 bg-slate-100 hidden md:block"></div>

             <div className="text-center md:text-right">
               <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Status</p>
               <div className={`text-xl font-black uppercase tracking-[0.2em] ${passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {submission.status}
               </div>
             </div>
           </div>

           <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 relative">
             <div className="flex items-center gap-4 mb-6">
               <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-sm">
                 <i className="fas fa-sparkles"></i>
               </div>
               <h3 className="text-lg font-bold text-slate-900 tracking-tight">AI Insights</h3>
             </div>
             <div className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap font-medium italic">
               {loadingInsights ? "Synthesizing your performance data..." : insights}
             </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-6">
             <Link 
               to={`/review/${submission.id}`}
               className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] text-center hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
             >
               Detailed Review
             </Link>
             <Link 
               to="/dashboard"
               className="flex-1 py-5 bg-white text-slate-500 border border-slate-100 rounded-2xl font-bold text-center hover:text-slate-900 hover:border-slate-300 transition-all"
             >
               Return Home
             </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
