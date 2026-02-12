
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppState, User, Exam, Submission } from './types';
import { loadData, saveData } from './store';

// Pages
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ExamEngine from './pages/ExamEngine';
import ResultPage from './pages/ResultPage';
import ReviewPage from './pages/ReviewPage';
import CreateExam from './pages/CreateExam';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadData());

  useEffect(() => {
    saveData(state);
  }, [state]);

  const login = useCallback((user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
  }, []);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null }));
  }, []);

  const addExam = useCallback((exam: Exam) => {
    setState(prev => ({ ...prev, exams: [exam, ...prev.exams] }));
  }, []);
  
  const addSubmission = useCallback((submission: Submission) => {
    setState(prev => ({ ...prev, submissions: [...prev.submissions, submission] }));
  }, []);

  const deleteExam = useCallback((id: string) => {
    setState(prev => ({ ...prev, exams: prev.exams.filter(e => e.id !== id) }));
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar user={state.currentUser} onLogout={logout} />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={state.currentUser ? <Navigate to="/dashboard" /> : <AuthPage onLogin={login} />} 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                !state.currentUser ? <Navigate to="/login" /> : 
                state.currentUser.role === 'admin' ? 
                <AdminDashboard exams={state.exams} submissions={state.submissions} onDelete={deleteExam} /> : 
                <StudentDashboard exams={state.exams} submissions={state.submissions} user={state.currentUser} />
              } 
            />

            <Route 
              path="/create-exam" 
              element={
                state.currentUser?.role === 'admin' ? 
                <CreateExam onAdd={addExam} /> : <Navigate to="/dashboard" />
              } 
            />

            <Route 
              path="/exam/:id" 
              element={
                !state.currentUser ? <Navigate to="/login" /> : 
                <ExamEngine exams={state.exams} onFinish={addSubmission} userId={state.currentUser.id} />
              } 
            />

            <Route 
              path="/result/:id" 
              element={
                !state.currentUser ? <Navigate to="/login" /> : 
                <ResultPage submissions={state.submissions} exams={state.exams} />
              } 
            />

            <Route 
              path="/review/:submissionId" 
              element={
                !state.currentUser ? <Navigate to="/login" /> : 
                <ReviewPage submissions={state.submissions} exams={state.exams} />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
