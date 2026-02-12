import React, { useState, useEffect, useRef } from 'react';
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

  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[]>>({});
  const [timeLeft, setTimeLeft] = useState(exam ? exam.durationMinutes * 60 : 0);
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isProctorHidden, setIsProctorHidden] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const answersRef = useRef(answers);
  const violationsRef = useRef(violations);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    answersRef.current = answers;
    violationsRef.current = violations;
  }, [answers, violations]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setViolations(prev => prev + 1);
        setShowViolationWarning(true);
        setTimeout(() => setShowViolationWarning(false), 3000);
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("Proctoring camera unavailable.");
      }
    }
    setupWebcam();
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

  useEffect(() => {
    if (exam && shuffledQuestions.length === 0) {
      const shuffled = [...exam.questions].sort(() => 0.5 - Math.random());
      setShuffledQuestions(shuffled);
    }
  }, [exam?.id]);

  const executeSubmission = () => {
    if (!exam || hasSubmitted.current) return;
    hasSubmitted.current = true;
    const score = exam.questions.reduce((acc, q) => {
      const selected = answersRef.current[q.id];
      if (selected === undefined) return acc;
      if (q.type === 'mcq-multi') {
        const sArr = Array.isArray(selected) ? [...selected].sort() : [selected];
        const cArr = Array.isArray(q.correctAnswer) ? [...(q.correctAnswer as number[])].sort() : [q.correctAnswer];
        return JSON.stringify(sArr) === JSON.stringify(cArr) ? acc + q.marks : acc;
      }
      return selected === q.correctAnswer ? acc + q.marks : acc;
    }, 0);
    const percentage = Math.round((score / exam.totalMarks) * 100);
    const submission: Submission = {
      id: `s${Date.now()}`,
      userId,
      examId: exam.id,
      answers: { ...answersRef.current },
      score,
      percentage,
      status: percentage >= exam.passingMarks ? 'passed' : 'failed',
      submittedAt: new Date().toISOString(),
      integrityViolations: violationsRef.current
    };
    onFinish(submission);
    navigate(`/result/${submission.id}`, { state: { submission, exam }, replace: true });
  };

  useEffect(() => {
    if (!exam) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          executeSubmission();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam]);

  if (!exam || shuffledQuestions.length === 0) return (
    <div className="flex flex-col items-center justify-center py-24 gap-10">
      <div className="w-12 h-12 md:w-16 md:h-16 border-[4px] md:border-[6px] border-slate-100 dark:border-slate-800 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="text-slate-400 font-black tracking-[0.2em] md:tracking-[0.4em] text-[10px] md:text-[11px] uppercase text-center px-4">Decrypting Official Protocol...</p>
    </div>
  );

  const currentQuestion = shuffledQuestions[currentIdx];
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto pb-48 animate-in px-4 md:px-6">
      <div className="bg-subtle-grid fixed inset-0 pointer-events-none opacity-20" />
      
      {/* Violation Alert - Compact on mobile */}
      {showViolationWarning && (
        <div className="fixed top-20 md:top-24 left-1/2 -translate-x-1/2 z-[300] bg-rose-600 text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl shadow-2xl flex items-center gap-3 md:gap-4 border-2 border-white/20 animate-bounce w-[90%] md:w-auto">
          <i className="fas fa-triangle-exclamation text-lg md:text-xl"></i>
          <span className="font-black text-[10px] md:text-xs uppercase tracking-widest leading-tight">Integrity Violation Logged</span>
        </div>
      )}

      {/* Proctor Terminal Widget - Collapsible on small screens */}
      <div className={`fixed top-40 md:top-48 right-4 md:right-12 bg-slate-950 border-4 border-white dark:border-slate-800 shadow-2xl z-[80] overflow-hidden grayscale contrast-150 notched transition-all duration-300 ${isProctorHidden ? 'w-8 h-8 md:w-48 md:h-48 rounded-full md:notched opacity-50' : 'w-24 h-24 md:w-48 md:h-48'}`}>
        {!isProctorHidden && (
          <>
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-50" />
            <div className="absolute top-2 left-2 md:top-3 md:left-3 flex items-center gap-1 md:gap-2 bg-black/70 px-1.5 py-0.5 md:px-2 md:py-1 rounded-md">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-rose-500 rounded-full animate-pulse"></div>
              <span className="text-[7px] md:text-[9px] font-black text-white uppercase tracking-widest">LIVE</span>
            </div>
          </>
        )}
        <button 
          onClick={() => setIsProctorHidden(!isProctorHidden)}
          className="absolute bottom-1 right-1 w-6 h-6 md:hidden bg-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] shadow-lg pointer-events-auto"
        >
          <i className={`fas ${isProctorHidden ? 'fa-eye' : 'fa-eye-slash'}`}></i>
        </button>
      </div>

      {/* Dynamic Progress Header - Responsive layout */}
      <header className="flex items-center justify-between py-4 md:py-6 mb-8 md:mb-12 sticky top-16 md:top-20 z-[90] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-b-2 border-slate-200 dark:border-slate-800 px-4 md:px-6 rounded-xl md:rounded-2xl shadow-xl shadow-slate-900/5">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] md:tracking-[0.3em] mb-1 truncate">SEG {currentIdx + 1} / {shuffledQuestions.length}</span>
          <h2 className="text-[11px] md:text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight opacity-70 font-syne truncate max-w-[120px] sm:max-w-none">{exam.title}</h2>
        </div>
        <div className="flex items-center gap-3 md:gap-5 shrink-0">
           <button onClick={() => setIsMapOpen(true)} className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-900 dark:text-white transition-all active:scale-90 rounded-lg md:rounded-xl hover:border-indigo-500">
             <i className="fas fa-layer-group text-sm md:text-base"></i>
           </button>
           <div className={`px-4 py-1.5 md:px-6 md:py-2.5 rounded-lg md:rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-mono text-lg md:text-2xl font-black shadow-lg ${timeLeft < 60 ? 'bg-rose-600 text-white animate-pulse' : ''}`}>
             {formatTime(timeLeft)}
           </div>
        </div>
      </header>

      {/* Assessment Container */}
      <div className="pro-card p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] relative overflow-hidden notched border-2 min-h-[350px] md:min-h-[500px] flex flex-col justify-between z-10">
        <div className="absolute top-0 left-0 w-full h-1.5 md:h-2 bg-slate-100 dark:bg-slate-800">
          <div className={`h-full transition-all duration-1000 ${violations > 0 ? 'bg-rose-500' : 'bg-indigo-600 shadow-indigo-500/50 shadow-lg'}`} style={{ width: `${((currentIdx + 1) / shuffledQuestions.length) * 100}%` }}></div>
        </div>
        
        <div className="mb-8 md:mb-12 space-y-6 md:space-y-8">
          <div className="flex items-center gap-3 md:gap-4">
            <span className="px-3 py-1 bg-slate-900 dark:bg-white text-[8px] md:text-[10px] font-black text-white dark:text-slate-900 uppercase tracking-widest rounded-lg">
              {currentQuestion.type.toUpperCase()}
            </span>
            <span className="text-[9px] md:text-[11px] font-black text-slate-400 tracking-[0.1em] md:tracking-[0.3em] uppercase">{currentQuestion.marks} CREDITS</span>
          </div>
          <h1 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white leading-[1.3] tracking-tight font-syne uppercase">
            {currentQuestion.text}
          </h1>
        </div>

        <div className="grid grid-cols-1 gap-3 md:gap-5">
          {currentQuestion.options.map((opt, idx) => {
            const ans = answers[currentQuestion.id];
            const selected = Array.isArray(ans) ? ans.includes(idx) : ans === idx;
            return (
              <button 
                key={idx} 
                onClick={() => {
                  if (currentQuestion.type === 'mcq-multi') {
                    const cur = Array.isArray(ans) ? ans : [];
                    const next = cur.includes(idx) ? cur.filter(i => i !== idx) : [...cur, idx].sort();
                    setAnswers({ ...answers, [currentQuestion.id]: next });
                  } else {
                    setAnswers({ ...answers, [currentQuestion.id]: idx });
                  }
                }}
                className={`w-full text-left p-4 md:p-8 rounded-[1.2rem] md:rounded-[1.5rem] border-2 transition-all flex items-center gap-4 md:gap-6 group ${
                  selected 
                  ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/40 dark:bg-indigo-900/10' 
                  : 'border-slate-100 dark:border-slate-800/60 bg-slate-50/30 dark:bg-slate-900/30'
                }`}
              >
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-xl border-2 flex items-center justify-center text-sm md:text-base font-black shrink-0 transition-all ${
                  selected 
                  ? 'bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-lg' 
                  : 'border-slate-200 dark:border-slate-700 text-slate-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className={`flex-1 text-sm md:text-xl font-bold tracking-tight uppercase ${selected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                  {opt}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Navigation - Bottom fixed on mobile for thumb reach */}
      <div className="fixed bottom-4 md:bottom-10 left-1/2 -translate-x-1/2 w-[95%] md:w-[90%] max-w-5xl p-3 md:p-5 bg-slate-950 dark:bg-white border-2 border-slate-800 dark:border-slate-200 rounded-[1.5rem] md:rounded-[2.5rem] flex items-center justify-between gap-3 md:gap-6 z-[150] shadow-2xl">
        <button 
          disabled={currentIdx === 0} 
          onClick={() => setCurrentIdx(prev => prev - 1)}
          className="flex-1 h-12 md:h-14 text-white dark:text-slate-900 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-[10px] disabled:opacity-20 flex items-center justify-center gap-2 md:gap-4 hover:bg-slate-900 dark:hover:bg-slate-50 rounded-xl md:rounded-2xl transition-all active:scale-95"
        >
          <i className="fas fa-chevron-left text-[10px] md:text-xs"></i> <span className="hidden sm:inline">PREV</span>
        </button>

        {currentIdx === shuffledQuestions.length - 1 ? (
          <button 
            onClick={executeSubmission}
            className="flex-[2] h-12 md:h-14 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[9px] md:text-[11px] rounded-xl md:rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 md:gap-4"
          >
            FINALIZE <i className="fas fa-upload text-[10px] md:text-xs"></i>
          </button>
        ) : (
          <button 
            onClick={() => setCurrentIdx(prev => prev + 1)}
            className="flex-[2] h-12 md:h-14 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[9px] md:text-[11px] rounded-xl md:rounded-2xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 md:gap-4 border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-black"
          >
            NEXT <i className="fas fa-chevron-right text-[10px] md:text-xs"></i>
          </button>
        )}
      </div>

      {/* Grid Navigation Modal - Full Screen Map */}
      {isMapOpen && (
        <div className="fixed inset-0 z-[400] bg-slate-950/98 backdrop-blur-2xl flex items-center justify-center p-6 md:p-10 animate-in">
          <div className="w-full max-w-5xl space-y-12 md:space-y-20">
            <div className="flex items-center justify-between">
              <h3 className="text-3xl md:text-5xl font-black text-white font-syne uppercase tracking-tighter">MAP</h3>
              <button onClick={() => setIsMapOpen(false)} className="w-12 h-12 md:w-20 md:h-20 bg-white flex items-center justify-center text-slate-900 active:scale-90 transition-all rounded-xl md:rounded-[2rem] hover:bg-indigo-50">
                <i className="fas fa-times text-xl md:text-3xl"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 md:gap-6 overflow-y-auto max-h-[60vh] p-2">
              {shuffledQuestions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered = ans !== undefined && (Array.isArray(ans) ? ans.length > 0 : true);
                const isCurrent = currentIdx === idx;

                return (
                  <button 
                    key={idx} 
                    onClick={() => {
                      setCurrentIdx(idx);
                      setIsMapOpen(false);
                    }}
                    className={`aspect-square border-2 md:border-4 text-sm md:text-2xl font-black transition-all flex items-center justify-center relative rounded-lg md:rounded-3xl ${
                      isCurrent 
                      ? 'bg-indigo-600 border-indigo-600 text-white scale-110 md:scale-125 z-10 shadow-2xl' 
                      : isAnswered 
                        ? 'bg-white/20 border-white text-white' 
                        : 'bg-transparent border-white/10 text-white/30'
                    } active:scale-90`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamEngine;