import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { RootState } from '@/store';
import { setTimeRemaining } from '@/store/slices/interviewSlice';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface TimerProps {
  timeLimit: number; // in seconds
  onTimeUp: () => void;
}

export function Timer({ timeLimit, onTimeUp }: TimerProps) {
  const dispatch = useDispatch();
  const { timeRemaining } = useSelector((state: RootState) => state.interview);

  useEffect(() => {
    if (timeRemaining <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      dispatch(setTimeRemaining(timeRemaining - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, dispatch, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (timeRemaining / timeLimit) * 100;
  const isUrgent = timeRemaining <= 10;
  const isWarning = timeRemaining <= 30;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ 
        scale: isUrgent ? [1, 1.02, 1] : 1,
        opacity: 1 
      }}
      transition={{ 
        scale: { repeat: isUrgent ? Infinity : 0, duration: 0.5 },
        opacity: { duration: 0.3 }
      }}
    >
      <Card className={`border-2 ${isUrgent ? 'border-destructive' : isWarning ? 'border-warning' : 'border-border'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Clock className={`w-5 h-5 ${isUrgent ? 'text-destructive' : isWarning ? 'text-warning' : 'text-primary'}`} />
              <span className="font-medium">Time Remaining</span>
            </div>
            <span className={`text-xl font-bold ${isUrgent ? 'text-destructive' : isWarning ? 'text-warning' : 'text-primary'}`}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className={`h-2 ${isUrgent ? '[&>div]:bg-destructive' : isWarning ? '[&>div]:bg-warning' : ''}`}
          />
          
          {isUrgent && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-destructive mt-2 font-medium"
            >
              Time is running out!
            </motion.p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}