import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  activeTab: 'interviewee' | 'interviewer';
  showWelcomeBackModal: boolean;
  showErrorModal: boolean;
  errorMessage: string;
  showCandidateDetail: boolean;
  selectedCandidateId: string | null;
  isUploading: boolean;
}

const initialState: UiState = {
  activeTab: 'interviewee',
  showWelcomeBackModal: false,
  showErrorModal: false,
  errorMessage: '',
  showCandidateDetail: false,
  selectedCandidateId: null,
  isUploading: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<'interviewee' | 'interviewer'>) => {
      state.activeTab = action.payload;
    },
    showWelcomeBack: (state) => {
      state.showWelcomeBackModal = true;
    },
    hideWelcomeBack: (state) => {
      state.showWelcomeBackModal = false;
    },
    showError: (state, action: PayloadAction<string>) => {
      state.showErrorModal = true;
      state.errorMessage = action.payload;
    },
    hideError: (state) => {
      state.showErrorModal = false;
      state.errorMessage = '';
    },
    showCandidateDetails: (state, action: PayloadAction<string>) => {
      state.showCandidateDetail = true;
      state.selectedCandidateId = action.payload;
    },
    hideCandidateDetails: (state) => {
      state.showCandidateDetail = false;
      state.selectedCandidateId = null;
    },
    setUploading: (state, action: PayloadAction<boolean>) => {
      state.isUploading = action.payload;
    },
  },
});

export const {
  setActiveTab,
  showWelcomeBack,
  hideWelcomeBack,
  showError,
  hideError,
  showCandidateDetails,
  hideCandidateDetails,
  setUploading,
} = uiSlice.actions;

export default uiSlice.reducer;