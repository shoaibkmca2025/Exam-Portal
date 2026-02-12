
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Submission, Exam, Question } from '../types';

interface ReviewPageProps {
  submissions: Submission[];
  exams: Exam[];
}

const ReviewPage: React.FC<ReviewPageProps> = ({ submissions, exams }) => {
  const { submissionId } = useParams();
  const submission = submissions.find(s => s.id === submissionId);
  const exam = exams.find(e => e.id === submission?.examId);

  if (!submission || !exam) return <div className="text-center py-20 dark:text-slate-400">Submission data missing.</div>;

  const isCorrect = (q: Question, selected: number | number[] | undefined) => {
    if (selected === undefined) return false;
    if (q.type === 'mcq-multi') {
      const selectedArr = Array.isArray(selected) ? (selected as number[]).sort() : [selected as number];
      const correctArr = Array.isArray(q.correctAnswer) ? (q.correctAnswer as number[]).sort() : [q.correctAnswer as number];
      return JSON.stringify(selectedArr) === JSON.stringify(correctArr);
    }
    return selected === q.correctAnswer;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-2 sm:px-4 transition-colors duration-300">
      <header className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Answer Review</h1>
            <p className="text-slate-500 dark:text-slate-400">{exam.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-green-50 dark:bg-emerald-900/20 text-green-700 dark:text-emerald-400 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
             <i className="fas fa-check-circle"></i> {submission.score} Points
           </div>
           <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${submission.status === 'passed' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400' : 'bg-red-50 dark:bg-rose-900/20 text-red-700 dark:text-rose-400'}`}>
             {submission.status}
           </div>
        </div>
      </header>

      <div className="space-y-8">
        {exam.questions.map((q, idx) => {
          const selected = submission.answers[q.id];
          const correct = isCorrect(q, selected);
          const isSkipped = selected === undefined || (Array.isArray(selected) && selected.length === 0);

          return (
            <div key={q.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition hover:border-slate-300 dark:hover:border-slate-700">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-start gap-4">
                 <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${correct ? 'bg-green-50 dark:bg-emerald-900/20 text-green-600 dark:text-emerald-400' : isSkipped ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500' : 'bg-red-50 dark:bg-rose-900/20 text-red-600 dark:text-rose-400'}`}>
                   {idx + 1}
                 </span>
                 <div className="flex-1 w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 px-2 py-0.5 bg-slate-50 dark:bg-slate-800 rounded">
                        {q.type.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-relaxed mb-6">{q.text}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = Array.isArray(selected) ? selected.includes(oIdx) : selected === oIdx;
                        const isProper = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(oIdx) : q.correctAnswer === oIdx;

                        let borderColor = 'border-slate-100 dark:border-slate-800';
                        let bgColor = 'bg-white dark:bg-slate-800/50';
                        let badge = null;

                        if (isProper) {
                          borderColor = 'border-green-500 dark:border-emerald-500 ring-1 ring-green-100 dark:ring-emerald-900/30';
                          bgColor = 'bg-green-50/30 dark:bg-emerald-900/10';
                          badge = <i className="fas fa-check-circle text-green-600 dark:text-emerald-400 ml-auto"></i>;
                        } else if (isChosen && !isProper) {
                          borderColor = 'border-red-400 dark:border-rose-500 ring-1 ring-red-100 dark:ring-rose-900/30';
                          bgColor = 'bg-red-50/30 dark:bg-rose-900/10';
                          badge = <i className="fas fa-times-circle text-red-500 dark:text-rose-400 ml-auto"></i>;
                        }

                        return (
                          <div 
                            key={oIdx}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${borderColor} ${bgColor}`}
                          >
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 ${isProper ? 'bg-green-600 dark:bg-emerald-500 border-green-600 dark:border-emerald-500 text-white' : isChosen ? 'bg-red-600 dark:bg-rose-500 border-red-600 dark:border-rose-500 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'}`}>
                                {q.type === 'mcq-multi' ? (
                                  <i className="fas fa-check"></i>
                                ) : (
                                  String.fromCharCode(65 + oIdx)
                                )}
                             </div>
                             <span className="text-slate-700 dark:text-slate-300 font-bold text-sm">{opt}</span>
                             {badge}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                       <h4 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <i className="fas fa-shield-halved text-indigo-500 dark:text-indigo-400"></i> Logic Consensus
                       </h4>
                       <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">{q.explanation || 'Consult official syllabus for detailed explanation.'}</p>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center pb-12">
        <Link to="/dashboard" className="px-10 py-4 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all shadow-xl shadow-slate-200 dark:shadow-none">
          Return to Hub
        </Link>
      </div>
    </div>
  );
};

export default ReviewPage;
