
export type UserRole = 'admin' | 'student';
export type QuestionType = 'mcq-single' | 'mcq-multi' | 'true-false';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  correctAnswer: number | number[]; // Index or indices of options
  explanation: string;
  marks: number;
}

export interface Exam {
  id: string;
  title: string;
  category: string;
  description: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questions: Question[];
  createdAt: string;
}

export interface Submission {
  id: string;
  userId: string;
  examId: string;
  answers: Record<string, number | number[]>;
  score: number;
  percentage: number;
  status: 'passed' | 'failed';
  submittedAt: string;
  integrityViolations?: number;
}

export interface AppState {
  currentUser: User | null;
  exams: Exam[];
  submissions: Submission[];
}
