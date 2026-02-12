
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Exam, Question, QuestionType } from '../types';
import { getAIExplanation } from '../geminiService';

interface CreateExamProps {
  onAdd: (exam: Exam) => void;
}

const CreateExam: React.FC<CreateExamProps> = ({ onAdd }) => {
  const navigate = useNavigate();
  const [loadingAI, setLoadingAI] = useState<number | null>(null);
  const [exam, setExam] = useState({
    title: '',
    category: 'Science',
    description: '',
    durationMinutes: 30,
    passingMarks: 50,
  });

  const categories = ['Science', 'Technology', 'Mathematics', 'Language', 'History', 'Other'];

  const [questions, setQuestions] = useState<Partial<Question>[]>([
    { 
      id: '1', 
      type: 'mcq-single', 
      text: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0, 
      explanation: '', 
      marks: 1 
    }
  ]);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { 
        id: Date.now().toString(), 
        type: 'mcq-single', 
        text: '', 
        options: ['', '', '', ''], 
        correctAnswer: 0, 
        explanation: '', 
        marks: 1 
      }
    ]);
  };

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const handleTypeChange = (index: number, type: QuestionType) => {
    const updated = [...questions];
    const current = updated[index];
    
    current.type = type;
    if (type === 'true-false') {
      current.options = ['True', 'False'];
      current.correctAnswer = 0;
    } else if (type === 'mcq-multi') {
      current.correctAnswer = [0];
      if (!current.options || current.options.length < 2) {
        current.options = ['', '', '', ''];
      }
    } else {
      current.correctAnswer = 0;
      if (!current.options || current.options.length < 2) {
        current.options = ['', '', '', ''];
      }
    }
    
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex: number, oIndex: number, value: string) => {
    const updated = [...questions];
    const opts = [...(updated[qIndex].options || [])];
    opts[oIndex] = value;
    updated[qIndex].options = opts;
    setQuestions(updated);
  };

  const toggleMultiCorrect = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    const currentCorrect = Array.isArray(updated[qIdx].correctAnswer) 
      ? (updated[qIdx].correctAnswer as number[]) 
      : [updated[qIdx].correctAnswer as number];
    
    if (currentCorrect.includes(oIdx)) {
      if (currentCorrect.length > 1) {
        updated[qIdx].correctAnswer = currentCorrect.filter(i => i !== oIdx);
      }
    } else {
      updated[qIdx].correctAnswer = [...currentCorrect, oIdx].sort();
    }
    setQuestions(updated);
  };

  const generateExplanation = async (idx: number) => {
    const q = questions[idx];
    const correctVal = Array.isArray(q.correctAnswer) 
      ? q.correctAnswer.map(i => q.options?.[i]).join(', ')
      : q.options?.[q.correctAnswer as number];

    if (!q.text || !correctVal) {
      alert("Please fill question text and correct answer first!");
      return;
    }
    setLoadingAI(idx);
    const exp = await getAIExplanation(q.text, q.options as string[], correctVal as string);
    handleQuestionChange(idx, 'explanation', exp);
    setLoadingAI(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalMarks = questions.reduce((acc, q) => acc + (q.marks || 0), 0);
    const newExam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      ...exam,
      totalMarks,
      createdAt: new Date().toISOString(),
      questions: questions as Question[]
    };
    onAdd(newExam);
    navigate('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 animate-fade-in-up">
      <div className="flex items-center gap-6 mb-12">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 border border-slate-100 hover:border-slate-300 transition-all shadow-sm active:scale-95"
        >
          <i className="fas fa-arrow-left"></i>
        </button>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Curate Assessment</h1>
          <p className="text-slate-400 font-medium">Draft a new examination for your students.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* Exam Metadata */}
        <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-slate-900 rounded-full"></div>
            <h2 className="text-xl font-bold text-slate-900 uppercase tracking-widest text-[11px]">Primary Credentials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Assessment Title</label>
              <input 
                required
                type="text" 
                value={exam.title}
                onChange={e => setExam({ ...exam, title: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-50 transition-all font-semibold"
                placeholder="e.g. Molecular Biology Fundamentals"
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Classification</label>
              <div className="flex gap-2 flex-wrap">
                {categories.map(cat => (
                  <button
                    type="button"
                    key={cat}
                    onClick={() => setExam({ ...exam, category: cat })}
                    className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
                      exam.category === cat 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Abstract</label>
              <textarea 
                value={exam.description}
                onChange={e => setExam({ ...exam, description: e.target.value })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-50 transition-all h-32 font-medium"
                placeholder="Define the scope and rules of this examination..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Standard Duration (Min)</label>
              <input 
                required
                type="number" 
                value={exam.durationMinutes}
                onChange={e => setExam({ ...exam, durationMinutes: parseInt(e.target.value) })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-50 transition-all font-bold"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Success Threshold (%)</label>
              <input 
                required
                type="number" 
                value={exam.passingMarks}
                onChange={e => setExam({ ...exam, passingMarks: parseInt(e.target.value) })}
                className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 focus:ring-4 focus:ring-slate-50 transition-all font-bold"
              />
            </div>
          </div>
        </section>

        {/* Question Builder */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inquiry Ledger</h2>
            <button 
              type="button"
              onClick={handleAddQuestion}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-900 rounded-2xl font-bold flex items-center gap-3 hover:border-slate-900 transition-all active:scale-95 shadow-sm"
            >
              <i className="fas fa-plus-circle text-amber-500"></i> New Entry
            </button>
          </div>

          {questions.map((q, qIdx) => (
            <div key={q.id} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-200/20 space-y-8 relative overflow-hidden">
              <div className="flex items-center justify-between relative z-10">
                <span className="text-4xl font-black text-slate-100 absolute -left-2 -top-4 select-none">
                  {String(qIdx + 1).padStart(2, '0')}
                </span>
                
                <div className="flex items-center gap-4 ml-12">
                   {/* Question Type Switcher */}
                   <div className="flex bg-slate-100 p-1 rounded-xl">
                     {[
                       { id: 'mcq-single', label: 'Single', icon: 'fa-circle-dot' },
                       { id: 'mcq-multi', label: 'Multi', icon: 'fa-square-check' },
                       { id: 'true-false', label: 'T/F', icon: 'fa-toggle-on' }
                     ].map(type => (
                       <button
                         key={type.id}
                         type="button"
                         onClick={() => handleTypeChange(qIdx, type.id as QuestionType)}
                         className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${q.type === type.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                       >
                         <i className={`fas ${type.icon}`}></i> {type.label}
                       </button>
                     ))}
                   </div>

                   <div className="flex items-center bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                     <span className="text-[9px] font-black text-slate-400 mr-3 tracking-widest">CREDITS</span>
                     <input 
                        type="number" 
                        value={q.marks} 
                        onChange={e => handleQuestionChange(qIdx, 'marks', parseInt(e.target.value))}
                        className="w-8 bg-transparent text-sm font-bold text-slate-900 outline-none"
                      />
                   </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                  className="w-10 h-10 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>

              {/* Question Content */}
              <div className="relative z-10">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Inquiry Prompt</label>
                <input 
                  required
                  type="text" 
                  value={q.text}
                  onChange={e => handleQuestionChange(qIdx, 'text', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all font-semibold"
                  placeholder="Enter your question here..."
                />
              </div>

              {/* Options Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {q.options?.map((opt, oIdx) => {
                  const isCorrect = Array.isArray(q.correctAnswer) 
                    ? q.correctAnswer.includes(oIdx) 
                    : q.correctAnswer === oIdx;

                  return (
                    <div key={oIdx} className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${isCorrect ? 'border-slate-900 bg-slate-900/5' : 'border-slate-50 bg-slate-50/30 hover:bg-white hover:border-slate-200'}`}>
                      {q.type === 'mcq-multi' ? (
                        <input 
                          type="checkbox" 
                          checked={isCorrect}
                          onChange={() => toggleMultiCorrect(qIdx, oIdx)}
                          className="w-5 h-5 accent-slate-900"
                        />
                      ) : (
                        <input 
                          type="radio" 
                          name={`correct-${qIdx}`} 
                          checked={isCorrect}
                          onChange={() => handleQuestionChange(qIdx, 'correctAnswer', oIdx)}
                          className="w-5 h-5 accent-slate-900"
                        />
                      )}
                      
                      {q.type === 'true-false' ? (
                        <span className="flex-1 font-bold text-slate-700">{opt}</span>
                      ) : (
                        <input 
                          required
                          type="text" 
                          value={opt}
                          onChange={e => handleOptionChange(qIdx, oIdx, e.target.value)}
                          className="flex-1 bg-transparent outline-none font-medium text-sm text-slate-700"
                          placeholder={`Option ${oIdx + 1}`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Section */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Rationale & Analysis</label>
                  <button 
                    type="button"
                    onClick={() => generateExplanation(qIdx)}
                    disabled={loadingAI === qIdx}
                    className="text-[10px] font-black text-slate-900 bg-amber-400 px-4 py-1.5 rounded-full hover:bg-amber-500 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {loadingAI === qIdx ? 'Analyzing...' : <><i className="fas fa-sparkles text-[9px]"></i> AI SYNTHESIS</>}
                  </button>
                </div>
                <textarea 
                  value={q.explanation}
                  onChange={e => handleQuestionChange(qIdx, 'explanation', e.target.value)}
                  className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50/50 outline-none focus:bg-white focus:border-slate-900 transition-all h-24 text-sm font-medium"
                  placeholder="Explain why this answer is correct..."
                />
              </div>
            </div>
          ))}
        </section>

        {/* Footer Actions */}
        <div className="pt-12 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-6">
          <button 
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-10 py-4 bg-white text-slate-500 font-bold rounded-2xl border border-slate-100 hover:text-slate-900 transition-all"
          >
            Cancel Draft
          </button>
          <button 
            type="submit"
            className="px-12 py-4 bg-slate-900 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200"
          >
            Finalize Assessment
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateExam;
