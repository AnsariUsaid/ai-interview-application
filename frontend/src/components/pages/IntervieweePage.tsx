import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ResumeUploader } from '../interview/ResumeUploader';
import { ChatInterface } from '../interview/ChatInterface';
import { Card } from '@/components/ui/card';

export function IntervieweePage() {
  const { currentCandidateId, isInterviewActive } = useSelector((state: RootState) => state.interview);

  if (!currentCandidateId || !isInterviewActive) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 shadow-medium">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Your Interview</h2>
            <p className="text-muted-foreground">
              Please upload your resume to get started. We'll extract your basic information and begin the interview process.
            </p>
          </div>
          <ResumeUploader />
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <ChatInterface />
    </div>
  );
}