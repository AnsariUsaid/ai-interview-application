import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Question } from './candidatesSlice';

interface InterviewState {
  currentCandidateId: string | null;
  currentQuestionIndex: number;
  isInterviewActive: boolean;
  timeRemaining: number;
  isPaused: boolean;
  hasResumed: boolean;
  pendingProfileData: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
}

const initialState: InterviewState = {
  currentCandidateId: null,
  currentQuestionIndex: 0,
  isInterviewActive: false,
  timeRemaining: 0,
  isPaused: false,
  hasResumed: false,
  pendingProfileData: null,
};

// Mock questions pool
export const questionPool: Omit<Question, 'id'>[] = [
  // Easy questions (20s each)
  {
    text: "Tell me about yourself and your background.",
    difficulty: 'easy',
    timeLimit: 20,
  },
  {
    text: "What interests you most about this role?",
    difficulty: 'easy',
    timeLimit: 20,
  },
  {
    text: "Describe your greatest strength.",
    difficulty: 'easy',
    timeLimit: 20,
  },
  
  // Medium questions (60s each)
  {
    text: "Describe a challenging project you worked on and how you overcame the obstacles.",
    difficulty: 'medium',
    timeLimit: 60,
  },
  {
    text: "How do you handle working under tight deadlines?",
    difficulty: 'medium',
    timeLimit: 60,
  },
  {
    text: "Explain a time when you had to work with a difficult team member.",
    difficulty: 'medium',
    timeLimit: 60,
  },
  
  // Hard questions (120s each)
  {
    text: "Design a system to handle 1 million concurrent users. Walk me through your architecture decisions.",
    difficulty: 'hard',
    timeLimit: 120,
  },
  {
    text: "How would you approach optimizing a slow database query that affects critical business operations?",
    difficulty: 'hard',
    timeLimit: 120,
  },
  {
    text: "Describe how you would implement a real-time notification system for a social media platform.",
    difficulty: 'hard',
    timeLimit: 120,
  },
];

const interviewSlice = createSlice({
  name: 'interview',
  initialState,
  reducers: {
    startInterview: (state, action: PayloadAction<string>) => {
      state.currentCandidateId = action.payload;
      state.currentQuestionIndex = 0;
      state.isInterviewActive = true;
      state.isPaused = false;
      state.hasResumed = false;
    },
    resumeInterview: (state, action: PayloadAction<string>) => {
      state.currentCandidateId = action.payload;
      state.isInterviewActive = true;
      state.isPaused = false;
      state.hasResumed = true;
    },
    nextQuestion: (state) => {
      if (state.currentQuestionIndex < 5) { // 6 questions total (0-5)
        state.currentQuestionIndex += 1;
      }
    },
    setTimeRemaining: (state, action: PayloadAction<number>) => {
      state.timeRemaining = action.payload;
    },
    pauseInterview: (state) => {
      state.isPaused = true;
    },
    endInterview: (state) => {
      state.currentCandidateId = null;
      state.currentQuestionIndex = 0;
      state.isInterviewActive = false;
      state.timeRemaining = 0;
      state.isPaused = false;
      state.hasResumed = false;
      state.pendingProfileData = null;
    },
    setPendingProfileData: (state, action: PayloadAction<{ name?: string; email?: string; phone?: string }>) => {
      state.pendingProfileData = action.payload;
    },
    clearPendingProfileData: (state) => {
      state.pendingProfileData = null;
    },
  },
});

export const {
  startInterview,
  resumeInterview,
  nextQuestion,
  setTimeRemaining,
  pauseInterview,
  endInterview,
  setPendingProfileData,
  clearPendingProfileData,
} = interviewSlice.actions;

export default interviewSlice.reducer;