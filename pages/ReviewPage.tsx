
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

  if (!submission || !exam) return <div className="text-center py-20">Submission data missing.</div>;

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
    <div className="max-w-4xl mx-auto py-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 text-slate-400 hover:text-indigo-600">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Answer Review</h1>
            <p className="text-slate-500">{exam.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2">
             <i className="fas fa-check-circle"></i> {submission.score} Points
           </div>
           <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${submission.status === 'passed' ? 'bg-indigo-50 text-indigo-700' : 'bg-red-50 text-red-700'}`}>
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
            <div key={q.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition hover:border-slate-300">
              <div className="p-8 border-b border-slate-100 flex items-start gap-4">
                 <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${correct ? 'bg-green-50 text-green-600' : isSkipped ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-600'}`}>
                   {idx + 1}
                 </span>
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 py-0.5 bg-slate-50 rounded">
                        {q.type.replace('-', ' ')}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 leading-relaxed mb-6">{q.text}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                      {q.options.map((opt, oIdx) => {
                        const isChosen = Array.isArray(selected) ? selected.includes(oIdx) : selected === oIdx;
                        const isProper = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(oIdx) : q.correctAnswer === oIdx;

                        let borderColor = 'border-slate-100';
                        let bgColor = 'bg-white';
                        let badge = null;

                        if (isProper) {
                          borderColor = 'border-green-500 ring-1 ring-green-100';
                          bgColor = 'bg-green-50/30';
                          badge = <i className="fas fa-check-circle text-green-600 ml-auto"></i>;
                        } else if (isChosen && !isProper) {
                          borderColor = 'border-red-400 ring-1 ring-red-100';
                          bgColor = 'bg-red-50/30';
                          badge = <i className="fas fa-times-circle text-red-500 ml-auto"></i>;
                        }

                        return (
                          <div 
                            key={oIdx}
                            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${borderColor} ${bgColor}`}
                          >
                             <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-black shrink-0 ${isProper ? 'bg-green-600 border-green-600 text-white' : isChosen ? 'bg-red-600 border-red-600 text-white' : 'border-slate-200 text-slate-400'}`}>
                                {q.type === 'mcq-multi' ? (
                                  <i className="fas fa-check"></i>
                                ) : (
                                  String.fromCharCode(65 + oIdx)
                                )}
                             </div>
                             <span className="text-slate-700 font-bold text-sm">{opt}</span>
                             {badge}
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                         <i className="fas fa-shield-halved text-indigo-500"></i> Logic Consensus
                       </h4>
                       <p className="text-sm text-slate-600 leading-relaxed font-medium">{q.explanation || 'Consult official syllabus for detailed explanation.'}</p>
                    </div>
                 </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <Link to="/dashboard" className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
          Return to Hub
        </Link>
      </div>
    </div>
  );
};

export default ReviewPage;
