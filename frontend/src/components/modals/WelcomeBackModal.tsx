import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { hideWelcomeBack } from '@/store/slices/uiSlice';
import { resumeInterview, endInterview } from '@/store/slices/interviewSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function WelcomeBackModal() {
  const dispatch = useDispatch();
  const showWelcomeBackModal = useSelector((state: RootState) => state.ui.showWelcomeBackModal);
  const currentCandidateId = useSelector((state: RootState) => state.interview.currentCandidateId);
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  
  const currentCandidate = currentCandidateId 
    ? candidates.find(c => c.id === currentCandidateId)
    : null;

  // Validate if we should actually show the modal
  const shouldShowModal = 
    showWelcomeBackModal &&
    !!currentCandidate &&
    currentCandidate.status === 'incomplete' &&
    currentCandidate.questions.length > 0;

  // Auto-hide modal if conditions aren't met
  useEffect(() => {
    if (showWelcomeBackModal && !shouldShowModal) {
      dispatch(hideWelcomeBack());
    }
  }, [showWelcomeBackModal, shouldShowModal, dispatch]);

  const handleContinue = () => {
    if (currentCandidateId) {
      dispatch(resumeInterview(currentCandidateId));
    }
    dispatch(hideWelcomeBack());
  };

  const handleStartOver = () => {
    // End the current interview properly
    dispatch(endInterview());
    dispatch(hideWelcomeBack());
    
    // Clear localStorage
    localStorage.removeItem('currentCandidateId');
    localStorage.removeItem('currentQuestionIndex');
  };

  const handleClose = () => {
    dispatch(hideWelcomeBack());
  };

  // Don't render if we shouldn't show
  if (!shouldShowModal) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            {currentCandidate?.name ? (
              <>
                Hi {currentCandidate.name}, you have an incomplete interview. 
                Would you like to continue where you left off?
              </>
            ) : (
              <>
                You have an incomplete interview. 
                Would you like to continue where you left off?
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleStartOver}>
            Start Over
          </Button>
          <Button onClick={handleContinue}>
            Continue Interview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
