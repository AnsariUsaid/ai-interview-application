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
  const [currentQuestionShown, setCurrentQuestionShown] = useState(-1);
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission guard
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if profile is complete and initialize chat (RUNS ONCE)
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
          if (currentCandidate?.questions?.[0]) {
            const firstQuestion = currentCandidate.questions[0];
            setMessages(prev => [...prev, {
              type: 'bot',
              content: `Question 1/6 (${firstQuestion.difficulty.toUpperCase()}): ${firstQuestion.text}`,
              timestamp: new Date()
            }]);
            setCurrentQuestionShown(0);
            setStartTime(new Date());
            dispatch(setTimeRemaining(firstQuestion.timeLimit));
          }
        }, 2000);
      }
    }
  }, [currentCandidate, hasResumed]);

  // Handle question progression (SEPARATE EFFECT)
  useEffect(() => {
    if (currentCandidate && currentQuestion && currentQuestionIndex !== currentQuestionShown) {
      const questionNumber = currentQuestionIndex + 1;
      
      if (currentQuestionIndex > 0) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: `Question ${questionNumber}/6 (${currentQuestion.difficulty.toUpperCase()}): ${currentQuestion.text}`,
            timestamp: new Date()
          }]);
          setCurrentQuestionShown(currentQuestionIndex);
          setStartTime(new Date());
          setIsSubmitting(false); // Reset submission guard for new question
          dispatch(setTimeRemaining(currentQuestion.timeLimit));
        }, 1500);
      }
    }
  }, [currentQuestionIndex, currentQuestion, currentQuestionShown]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // REMOVED: Duplicate time-up handler (Timer component handles this now)

  const handleSubmitAnswer = async (timeUp = false) => {
    // Submission guard - prevent double submission
    if (isSubmitting) {
      console.log('Already submitting, ignoring duplicate call');
      return;
    }

    if (!currentCandidate || !currentQuestion || !startTime) {
      console.log('Missing required data for submission');
      return;
    }

    setIsSubmitting(true); // Lock submission
    console.log('Submitting answer:', { timeUp, answer: answer || 'empty' });

    const timeSpent = (new Date().getTime() - startTime.getTime()) / 1000;
    const finalAnswer = answer.trim() || "No answer provided";
    
    // Add user answer to chat - ALWAYS show it, even if empty
    setMessages(prev => [...prev, {
      type: 'user',
      content: finalAnswer,
      timestamp: new Date()
    }]);

    // Generate AI score using backend API
    let score = 5;
    try {
      const evaluationResult = await apiService.evaluateAnswer(
        currentQuestion.id,
        currentQuestion.text,
        finalAnswer,
        currentQuestion.difficulty
      );
      score = evaluationResult.score;
    } catch (error) {
      console.error('Failed to evaluate answer, using fallback:', error);
      score = apiService.generateQuestionScore(finalAnswer, currentQuestion.difficulty);
    }
    
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
      }, 1500);
    } else {
      // Interview complete - Generate AI summary
      const allAnswers = currentCandidate.questions
        .filter(q => q.answer && q.score !== undefined)
        .map(q => ({
          question_id: q.id,
          question_text: q.text,
          answer_text: q.answer!,
          difficulty: q.difficulty,
          score: q.score!
        }))
        .concat([{
          question_id: currentQuestion.id,
          question_text: currentQuestion.text,
          answer_text: finalAnswer,
          difficulty: currentQuestion.difficulty,
          score
        }]);
      
      try {
        console.log('Generating final summary for:', currentCandidate.name);
        console.log('All answers data:', allAnswers);
        
        const summaryResponse = await apiService.generateFinalSummary(
          currentCandidate.name,
          allAnswers
        );
        
        console.log('Summary response from API:', summaryResponse);
        
        const finalScore = summaryResponse.final_score;
        const summary = summaryResponse.summary;
        
        console.log('Final score:', finalScore);
        console.log('Summary text:', summary);
        
        dispatch(completeInterview({
          candidateId: currentCandidate.id,
          finalScore,
          summary
        }));

        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: `Thank you for completing the interview, ${currentCandidate.name}! Your final score is ${finalScore}/10. ${summary}`,
            timestamp: new Date()
          }]);
          
          setTimeout(() => {
            dispatch(endInterview());
          }, 5000);
        }, 1500);
      } catch (error) {
        console.error('Failed to generate final summary:', error);
        
        const allScores = currentCandidate.questions
          .filter(q => q.score !== undefined)
          .map(q => q.score!)
          .concat([score]);
        
        const finalScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
        const summary = `Interview completed with an average score of ${finalScore}/10. AI summary unavailable.`;
        
        dispatch(completeInterview({
          candidateId: currentCandidate.id,
          finalScore,
          summary
        }));

        setTimeout(() => {
          setMessages(prev => [...prev, {
            type: 'bot',
            content: `Thank you for completing the interview, ${currentCandidate.name}! Your final score is ${finalScore}/10. ${summary}`,
            timestamp: new Date()
          }]);
          
          setTimeout(() => {
            dispatch(endInterview());
          }, 5000);
        }, 1500);
      }
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

    {/* Answer Input - Always Mounted */}
    <Card>
      <CardContent className="p-6 space-y-4">
        <Textarea
          placeholder={currentQuestionIndex === currentQuestionShown ? "Type your answer here..." : "Waiting for next question..."}
          value={answer}
          onChange={(e) => {
            if (currentQuestionIndex === currentQuestionShown && !isSubmitting) {
              setAnswer(e.target.value)
            }
          }}
          className="min-h-[120px]"
          disabled={isSubmitting || currentQuestionIndex !== currentQuestionShown}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {answer.length} characters
          </span>
          <Button 
            onClick={() => handleSubmitAnswer(false)}
            disabled={isSubmitting || !answer.trim() || currentQuestionIndex !== currentQuestionShown}
          >
            {isSubmitting ? 'Submitting...' : (isLastQuestion ? 'Finish Interview' : 'Submit Answer')}
          </Button>
        </div>
      </CardContent>
    </Card>

    </div>
  );
}