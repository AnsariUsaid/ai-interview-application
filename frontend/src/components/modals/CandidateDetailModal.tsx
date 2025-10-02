import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { hideCandidateDetails } from '@/store/slices/uiSlice';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CandidateDetail } from '../dashboard/CandidateDetail';

export function CandidateDetailModal() {
  const dispatch = useDispatch();
  const { showCandidateDetail, selectedCandidateId } = useSelector((state: RootState) => state.ui);
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  
  const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);

  if (!selectedCandidate) {
    return null;
  }

  return (
    <Dialog open={showCandidateDetail} onOpenChange={() => dispatch(hideCandidateDetails())}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Interview Details - {selectedCandidate.name}</DialogTitle>
        </DialogHeader>
        <CandidateDetail candidate={selectedCandidate} />
      </DialogContent>
    </Dialog>
  );
}