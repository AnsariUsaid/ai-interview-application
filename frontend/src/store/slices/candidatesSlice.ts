import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit: number; // in seconds
  answer?: string;
  score?: number;
  timeSpent?: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  resumeFile?: File;
  questions: Question[];
  finalScore?: number;
  summary?: string;
  status: 'incomplete' | 'completed';
  createdAt: string;
  completedAt?: string;
}

interface CandidatesState {
  candidates: Candidate[];
  searchTerm: string;
  sortBy: 'score' | 'name' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

const initialState: CandidatesState = {
  candidates: [],
  searchTerm: '',
  sortBy: 'score',
  sortOrder: 'desc',
};

const candidatesSlice = createSlice({
  name: 'candidates',
  initialState,
  reducers: {
    addCandidate: (state, action: PayloadAction<Candidate>) => {
      state.candidates.push(action.payload);
    },
    updateCandidate: (state, action: PayloadAction<{ id: string; updates: Partial<Candidate> }>) => {
      const { id, updates } = action.payload;
      const candidateIndex = state.candidates.findIndex(c => c.id === id);
      if (candidateIndex !== -1) {
        state.candidates[candidateIndex] = { ...state.candidates[candidateIndex], ...updates };
      }
    },
    updateCandidateAnswer: (state, action: PayloadAction<{ 
      candidateId: string; 
      questionId: string; 
      answer: string; 
      timeSpent: number;
      score?: number;
    }>) => {
      const { candidateId, questionId, answer, timeSpent, score } = action.payload;
      const candidate = state.candidates.find(c => c.id === candidateId);
      if (candidate) {
        const question = candidate.questions.find(q => q.id === questionId);
        if (question) {
          question.answer = answer;
          question.timeSpent = timeSpent;
          if (score !== undefined) {
            question.score = score;
          }
        }
      }
    },
    completeInterview: (state, action: PayloadAction<{ 
      candidateId: string; 
      finalScore: number; 
      summary: string;
    }>) => {
      const { candidateId, finalScore, summary } = action.payload;
      const candidate = state.candidates.find(c => c.id === candidateId);
      if (candidate) {
        candidate.finalScore = finalScore;
        candidate.summary = summary;
        candidate.status = 'completed';
        candidate.completedAt = new Date().toISOString();
      }
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
    },
    setSorting: (state, action: PayloadAction<{ sortBy: 'score' | 'name' | 'createdAt'; sortOrder: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
  },
});

export const {
  addCandidate,
  updateCandidate,
  updateCandidateAnswer,
  completeInterview,
  setSearchTerm,
  setSorting,
} = candidatesSlice.actions;

export default candidatesSlice.reducer;