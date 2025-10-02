import { CandidatesDashboard } from '../dashboard/CandidatesDashboard';

export function InterviewerPage() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-2">Candidates Dashboard</h2>
        <p className="text-muted-foreground">
          View and manage all interview candidates. Click on any candidate to see their detailed interview results.
        </p>
      </div>
      <CandidatesDashboard />
    </div>
  );
}