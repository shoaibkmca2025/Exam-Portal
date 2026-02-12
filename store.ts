
import { AppState, User, Exam, Submission } from './types';

const STORAGE_KEY = 'exampro_db_v1';

const INITIAL_DATA: AppState = {
  currentUser: null,
  exams: [
    {
      id: 'exam-1',
      title: 'General Science & Environment',
      category: 'Science',
      description: 'Test your basic knowledge of physical sciences and sustainability.',
      durationMinutes: 10,
      totalMarks: 4,
      passingMarks: 50, // 50%
      createdAt: new Date().toISOString(),
      questions: [
        {
          id: 'q1',
          type: 'mcq-single',
          text: 'What is the most common gas in the Earth atmosphere?',
          options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
          correctAnswer: 1,
          explanation: 'Nitrogen makes up approximately 78% of the Earth\'s atmosphere.',
          marks: 2
        },
        {
          id: 'q2',
          type: 'mcq-single',
          text: 'Which planet is known as the Red Planet?',
          options: ['Venus', 'Mars', 'Jupiter', 'Saturn'],
          correctAnswer: 1,
          explanation: 'Mars is known as the Red Planet due to iron oxide on its surface.',
          marks: 2
        }
      ]
    }
  ],
  submissions: []
};

export const loadData = (): AppState => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return INITIAL_DATA;
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_DATA;
  }
};

export const saveData = (data: AppState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
