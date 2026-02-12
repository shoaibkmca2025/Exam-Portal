
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Exam, Submission, Question } from '../types';

interface ExamEngineProps {
  exams: Exam[];
  onFinish: (sub: Submission) => void;
  userId: string;
}

const ExamEngine: React.FC<ExamEngineProps> = ({ exams, onFinish, userId }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const exam = exams.find(e => e.id === id);

  // Shuffling logic
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [timeLeft, setTimeLeft] = useState(exam ? exam.durationMinutes * 60 : 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const hasSubmitted = useRef(false);

  // Standard Fisher-Yates shuffle
  const shuffleArray = (array: Question[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    if (exam) {
      setShuffledQuestions(shuffleArray(exam.questions));
    }
  }, [exam?.id]);

  const calculateScore = (exam: Exam, userAnswers: Record<string, number | number[]>) => {
    let score = 0;
    exam.questions.forEach(q => {
      const selected = userAnswers[q.id];
      if (selected === undefined) return;

      if (q.type === 'mcq-multi') {
        const selectedArr = Array.isArray(selected) ? (selected as number[]).sort() : [selected as number];
        const correctArr = Array.isArray(q.correctAnswer) ? (q.correctAnswer as number[]).sort() : [q.correctAnswer as number];
        
        if (JSON.stringify(selectedArr) === JSON.stringify(correctArr)) {
          score += (q.marks || 0);
        }
      } else {
        if (selected === q.correctAnswer) {
          score += (q.marks || 0);
        }
      }
    });
    return score;
  };

  const executeSubmission = () => {
    if (!exam || hasSubmitted.current) return;
    
    hasSubmitted.current = true;
    setIsSubmitting(true);

    try {
      const score = calculateScore(exam, answersRef.current);
      const totalMarks = exam.totalMarks || 1; 
      const percentage = Math.round((score / totalMarks) * 100);
      
      const submissionId = `s${Date.now()}`;
      
      const submission: Submission = {
        id: submissionId,
        userId,
        examId: exam.id,
        answers: { ...answersRef.current },
        score,
        percentage,
        status: percentage >= (exam.passingMarks || 0) ? 'passed' : 'failed',
        submittedAt: new Date().toISOString()
      };

      localStorage.setItem('exampro_last_submission', JSON.stringify(submission));
      onFinish(submission);
      
      setTimeout(() => {
        navigate(`/result/${submissionId}`, { 
          state: { submission, exam },
          replace: true 
        });
      }, 50);
    } catch (err) {
      console.error("Submission failed:", err);
      setIsSubmitting(false);
      hasSubmitted.current = false;
    }
  };

  useEffect(() => {
    if (!exam) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasSubmitted.current) executeSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam]);

  if (!exam || shuffledQuestions.length === 0) return (
    <div className="text-center py-24 flex flex-col items-center gap-6">
      <div className="w-16 h-16 border-4 border-slate-100 border-t-slate-900 rounded-full animate-spin"></div>
      <p className="text-slate-500 font-bold tracking-tight">Initializing Secure Assessment Environment...</p>
    </div>
  );

  const currentQuestion = shuffledQuestions[currentIdx];
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (idx: number) => {
    if (isSubmitting) return;

    if (currentQuestion.type === 'mcq-multi') {
      const currentSelected = Array.isArray(answers[currentQuestion.id]) 
        ? (answers[currentQuestion.id] as number[]) 
        : [];
      
      let nextSelected;
      if (currentSelected.includes(idx)) {
        nextSelected = currentSelected.filter(i => i !== idx);
      } else {
        nextSelected = [...currentSelected, idx].sort();
      }
      setAnswers({ ...answers, [currentQuestion.id]: nextSelected });
    } else {
      setAnswers({ ...answers, [currentQuestion.id]: idx });
    }
  };

  const isSelected = (idx: number) => {
    const ans = answers[currentQuestion.id];
    if (Array.isArray(ans)) return ans.includes(idx);
    return ans === idx;
  };

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 animate-fade-in-up">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 min-h-[600px] flex flex-col relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
             <div className="flex flex-wrap items-center gap-3">
               <span className="px-5 py-2 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em]">
                 ITEM {currentIdx + 1} / {shuffledQuestions.length}
               </span>
               <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                 {currentQuestion.type.replace('-', ' ')}
               </span>
               <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[9px] font-bold uppercase">
                 Randomized Order
               </span>
             </div>
             <span className="text-sm font-black text-slate-300">
               CREDITS: {currentQuestion.marks}
             </span>
          </div>

          <div className="flex-grow">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-12 leading-snug">
              {currentQuestion.text}
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {currentQuestion.options.map((opt, idx) => {
                const selected = isSelected(idx);
                return (
                  <button 
                    key={idx}
                    disabled={isSubmitting}
                    onClick={() => handleOptionSelect(idx)}
                    className={`w-full text-left p-6 rounded-[1.5rem] border-2 transition-all duration-300 flex items-center gap-5 ${selected ? 'border-slate-900 bg-slate-900 text-white shadow-xl shadow-slate-300' : 'border-slate-50 bg-slate-50/50 hover:border-slate-200 hover:bg-white'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center text-sm font-black transition-colors ${selected ? 'bg-white border-white text-slate-900' : 'border-slate-200 text-slate-400'}`}>
                      {currentQuestion.type === 'mcq-multi' ? (
                        <i className={`fas ${selected ? 'fa-check-square' : 'fa-square'}`}></i>
                      ) : (
                        String.fromCharCode(65 + idx)
                      )}
                    </div>
                    <span className="flex-1 text-lg font-semibold tracking-tight">{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-10 mt-12 border-t border-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button 
              disabled={currentIdx === 0 || isSubmitting}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="w-full sm:w-auto px-8 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-slate-400 hover:text-slate-900 transition-all disabled:opacity-20"
            >
              <i className="fas fa-arrow-left mr-2"></i> Previous
            </button>

            {currentIdx === shuffledQuestions.length - 1 ? (
              <button 
                disabled={isSubmitting}
                onClick={executeSubmission}
                className="w-full sm:w-auto px-12 py-4 bg-amber-400 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-amber-500 transition-all shadow-xl active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Finish Assessment'}
              </button>
            ) : (
              <button 
                disabled={isSubmitting}
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="w-full sm:w-auto px-12 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-xl"
              >
                Next Item <i className="fas fa-arrow-right ml-2"></i>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <div className="w-full lg:w-96 space-y-8 flex flex-col lg:sticky lg:top-24 h-fit">
        {/* Countdown Timer Card */}
        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-center shadow-2xl">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mb-3 text-white/50">Countdown</p>
          <div className={`text-5xl font-black tracking-tighter ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Question Inventory / Grid Navigator */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col max-h-[calc(100vh-350px)] lg:max-h-[600px]">
          <div className="flex items-center justify-between mb-6 shrink-0">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
              {shuffledQuestions.length} ITEMS
            </span>
          </div>
          
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
            <div className="grid grid-cols-5 gap-3">
              {shuffledQuestions.map((q, idx) => {
                const answer = answers[q.id];
                const isAnswered = answer !== undefined && (Array.isArray(answer) ? answer.length > 0 : true);
                const isCurrent = currentIdx === idx;
                
                return (
                  <button
                    key={q.id}
                    disabled={isSubmitting}
                    onClick={() => setCurrentIdx(idx)}
                    className={`aspect-square rounded-xl text-xs font-bold transition-all flex items-center justify-center relative ${
                      isCurrent 
                        ? 'bg-slate-900 text-white shadow-lg scale-110 z-10' 
                        : isAnswered 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {idx + 1}
                    {isAnswered && !isCurrent && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Key / Legend */}
          <div className="mt-8 pt-6 border-t border-slate-50 shrink-0 flex items-center justify-center gap-4">
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Done</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 bg-slate-100 border border-slate-200 rounded-full"></div>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Pending</span>
             </div>
             <div className="flex items-center gap-1.5">
               <div className="w-2 h-2 bg-slate-900 rounded-full"></div>
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Active</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamEngine;
