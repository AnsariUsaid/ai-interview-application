import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { hideError } from '@/store/slices/uiSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export function ErrorModal() {
  const dispatch = useDispatch();
  const { showErrorModal, errorMessage } = useSelector((state: RootState) => state.ui);

  return (
    <Dialog open={showErrorModal} onOpenChange={() => dispatch(hideError())}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <DialogTitle>Error</DialogTitle>
          </div>
          <DialogDescription>
            {errorMessage}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => dispatch(hideError())}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}