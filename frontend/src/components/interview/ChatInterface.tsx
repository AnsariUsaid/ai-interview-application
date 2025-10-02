import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '@/store';
import { nextQuestion, endInterview, setTimeRemaining } from '@/store/slices/interviewSlice';
import { updateCandidateAnswer, completeInterview } from '@/store/slices/candidatesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Timer } from './Timer';
import { ChatMessage } from './ChatMessage';
import { apiService } from '@/services/api';
import { ProfileForm } from './ProfileForm';

export function ChatInterface() {
  const dispatch = useDispatch();
  const { currentCandidateId, currentQuestionIndex, timeRemaining, hasResumed } = useSelector(
    (state: RootState) => state.interview
  );
  const candidates = useSelector((state: RootState) => state.candidates.candidates);
  
  const currentCandidate = candidates.find(c => c.id === currentCandidateId);
  const currentQuestion = currentCandidate?.questions[currentQuestionIndex];
  
  const [answer, setAnswer] = useState('');
  const [messages, setMessages] = useState<Array<{ type: 'bot' | 'user'; content: string; timestamp: Date }>>([]);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if profile is complete
  useEffect(() => {
    if (currentCandidate) {
      const isProfileIncomplete = !currentCandidate.name || !currentCandidate.email || !currentCandidate.phone;
      setShowProfileForm(isProfileIncomplete);
      
      if (!isProfileIncomplete && messages.length === 0) {
        // Initialize chat with welcome message
        const welcomeMessage = hasResumed 
          ? `Welcome back, ${currentCandidate.name}! Let's continue with your interview.`
          : `Hello ${currentCandidate.name}! Welcome to your AI-powered interview. We'll go through 6 questions of varying difficulty. Each question has a time limit, so please answer as best as you can within the given time.`;
        
        setMessages([{
          type: 'bot',
          content: welcomeMessage,
          timestamp: new Date()
        }]);
        
        // Start the first question after a brief delay
        setTimeout(() => {
          if (currentQuestion) {
            setMessages(prev => [...prev, {
              type: 'bot',
              content: `Question ${currentQuestionIndex + 1}/6 (${currentQuestion.difficulty.toUpperCase()}): ${currentQuestion.text}`,
              timestamp: new Date()
            }]);
            setStartTime(new Date());
            dispatch(setTimeRemaining(currentQuestion.timeLimit));
          }
        }, 2000);
      }
    }
  }, [currentCandidate, hasResumed, dispatch, currentQuestion, currentQuestionIndex, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle time up
  useEffect(() => {
    if (timeRemaining === 0 && currentQuestion && startTime) {
      handleSubmitAnswer(true);
    }
  }, [timeRemaining, currentQuestion, startTime]);

  const handleSubmitAnswer = async (timeUp = false) => {
    if (!currentCandidate || !currentQuestion || !startTime) return;

    const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000;
    const finalAnswer = timeUp ? answer || "No answer provided" : answer;
    
    // Add user answer to chat
    if (finalAnswer.trim()) {
      setMessages(prev => [...prev, {
        type: 'user',
        content: finalAnswer,
        timestamp: new Date()
      }]);
    }

    // Generate AI score
    const score = apiService.generateQuestionScore(finalAnswer, currentQuestion.difficulty);
    
    // Update candidate answer
    dispatch(updateCandidateAnswer({
      candidateId: currentCandidate.id,
      questionId: currentQuestion.id,
      answer: finalAnswer,
      timeSpent,
      score
    }));

    // Clear answer and reset timer
    setAnswer('');
    setStartTime(null);

    if (currentQuestionIndex < 5) {
      // Move to next question
      setTimeout(() => {
        dispatch(nextQuestion());
        const nextQ = currentCandidate.questions[currentQuestionIndex + 1];
        if (nextQ) {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: `Question ${currentQuestionIndex + 2}/6 (${nextQ.difficulty.toUpperCase()}): ${nextQ.text}`,
            timestamp: new Date()
          }]);
          setStartTime(new Date());
          dispatch(setTimeRemaining(nextQ.timeLimit));
        }
      }, 1500);
    } else {
      // Interview complete
      const allScores = currentCandidate.questions
        .filter(q => q.score !== undefined)
        .map(q => q.score!)
        .concat([score]);
      
      const finalScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
      const summary = apiService.generateFinalSummary(allScores, currentCandidate.name);
      
      dispatch(completeInterview({
        candidateId: currentCandidate.id,
        finalScore,
        summary
      }));

      // Show completion message
      setTimeout(() => {
        setMessages(prev => [...prev, {
          type: 'bot',
          content: `Thank you for completing the interview, ${currentCandidate.name}! Your final score is ${finalScore}/10. ${summary}`,
          timestamp: new Date()
        }]);
        
        // End interview after showing results
        setTimeout(() => {
          dispatch(endInterview());
        }, 5000);
      }, 1500);
    }
  };

  if (showProfileForm) {
    return <ProfileForm onComplete={() => setShowProfileForm(false)} />;
  }

  if (!currentCandidate || !currentQuestion) {
    return <div>Loading...</div>;
  }

  const progress = ((currentQuestionIndex + 1) / 6) * 100;
  const isLastQuestion = currentQuestionIndex === 5;

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Interview Progress</CardTitle>
            <span className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of 6
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
      </Card>

      {/* Timer */}
      {startTime && (
        <Timer 
          timeLimit={currentQuestion.timeLimit}
          onTimeUp={() => handleSubmitAnswer(true)}
        />
      )}

      {/* Chat Messages */}
      <Card className="min-h-[400px]">
        <CardContent className="p-6 space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Answer Input */}
      {startTime && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="Type your answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="min-h-[120px]"
              disabled={timeRemaining === 0}
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                {answer.length} characters
              </span>
              <Button 
                onClick={() => handleSubmitAnswer(false)}
                disabled={!answer.trim() || timeRemaining === 0}
              >
                {isLastQuestion ? 'Finish Interview' : 'Submit Answer'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}