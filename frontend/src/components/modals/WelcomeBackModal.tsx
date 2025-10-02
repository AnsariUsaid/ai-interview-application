import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { hideWelcomeBack } from '@/store/slices/uiSlice';
import { resumeInterview } from '@/store/slices/interviewSlice';
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
  const { showWelcomeBackModal } = useSelector((state: RootState) => state.ui);
  const { currentCandidateId } = useSelector((state: RootState) => state.interview);
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  
  const currentCandidate = candidates.find(c => c.id === currentCandidateId);

  const handleContinue = () => {
    if (currentCandidateId) {
      dispatch(resumeInterview(currentCandidateId));
    }
    dispatch(hideWelcomeBack());
  };

  const handleStartOver = () => {
    dispatch(hideWelcomeBack());
    // This will trigger the interview to start from the beginning
    window.location.reload();
  };

  return (
    <Dialog open={showWelcomeBackModal} onOpenChange={() => dispatch(hideWelcomeBack())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome Back!</DialogTitle>
          <DialogDescription>
            {currentCandidate ? (
              <>
                Hi {currentCandidate.name}, you have an incomplete interview. 
                Would you like to continue where you left off?
              </>
            ) : (
              'You have an incomplete interview. Would you like to continue where you left off?'
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
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