import { motion } from 'framer-motion';
import { User, Mail, Phone, Clock, Calendar, Award } from 'lucide-react';
import { Candidate } from '@/store/slices/candidatesSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CandidateDetailProps {
  candidate: Candidate;
}

export function CandidateDetail({ candidate }: CandidateDetailProps) {
  // Add error handling for malformed data
  if (!candidate) {
    return <div className="p-4 text-center text-muted-foreground">No candidate data available</div>;
  }

  // Debug logging to identify the issue
  console.log('CandidateDetail - Candidate data:', candidate);
  console.log('CandidateDetail - Questions:', candidate.questions);
  
  // Safe string conversion helper
  const safeString = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };
  
  try {

  const formatTime = (seconds?: number) => {
    if (!seconds || isNaN(seconds)) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreBadge = (score?: number) => {
    if (score === undefined) return <span className="text-muted-foreground">Not answered</span>;
    
    let variant: "default" | "secondary" | "destructive" = "secondary";
    if (score >= 8) variant = "default";
    else if (score < 5) variant = "destructive";

    return (
      <Badge variant={variant} className={
        score >= 8 ? "bg-success text-success-foreground" : 
        score < 5 ? "" : "bg-warning text-warning-foreground"
      }>
        {score}/10
      </Badge>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants = {
      easy: "bg-success text-success-foreground",
      medium: "bg-warning text-warning-foreground", 
      hard: "bg-destructive text-destructive-foreground"
    };
    
    return (
      <Badge className={variants[difficulty as keyof typeof variants]}>
        {difficulty.toUpperCase()}
      </Badge>
    );
  };

  // Safe access to questions array
  const questions = candidate.questions || [];
  const completedQuestions = questions.filter(q => q.answer);
  const totalScore = questions
    .filter(q => q.score !== undefined)
    .reduce((sum, q) => sum + (q.score || 0), 0);
  const avgScore = completedQuestions.length > 0 ? totalScore / completedQuestions.length : 0;

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Candidate Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">{safeString(candidate.name) || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{safeString(candidate.email) || 'No email'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{safeString(candidate.phone) || 'No phone'}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Started</p>
                  <p className="text-muted-foreground">
                    {candidate.createdAt ? new Date(candidate.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>
              
              {candidate.completedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Completed</p>
                    <p className="text-muted-foreground">
                      {new Date(candidate.completedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Final Score</p>
                  <p className="text-muted-foreground">
                    {candidate.finalScore ? `${candidate.finalScore}/10` : 'Pending'}
                  </p>
                </div>
              </div>
              
              <div>
                <p className="font-medium">Status</p>
                <Badge variant={candidate.status === 'completed' ? 'default' : 'secondary'} 
                       className={candidate.status === 'completed' ? 'bg-success text-success-foreground' : ''}>
                  {candidate.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Questions and Answers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions & Answers</CardTitle>
            <p className="text-sm text-muted-foreground">
              {completedQuestions.length} of {questions.length} questions answered
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Question</TableHead>
                    <TableHead>Difficulty</TableHead>
                    <TableHead>Answer</TableHead>
                    <TableHead>Time Spent</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questions.map((question, index) => (
                    <TableRow key={question.id || index}>
                      <TableCell className="max-w-md">
                        <p className="font-medium text-sm">Q{index + 1}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {safeString(question.text) || 'No question text'}
                        </p>
                      </TableCell>
                      <TableCell>
                        {getDifficultyBadge(question.difficulty || 'easy')}
                      </TableCell>
                      <TableCell className="max-w-md">
                        {question.answer ? (
                          <p className="text-sm line-clamp-3">{safeString(question.answer)}</p>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not answered</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{formatTime(question.timeSpent)}</span>
                      </TableCell>
                      <TableCell>
                        {getScoreBadge(question.score)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Summary */}
      {candidate.summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
            <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{safeString(candidate.summary)}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
  } catch (error) {
    console.error('CandidateDetail error:', error);
    console.error('Candidate data that caused error:', candidate);
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-2">Error displaying candidate details</p>
        <p className="text-sm text-muted-foreground mb-4">
          Error: {error instanceof Error ? error.message : 'Unknown error'}
        </p>
        <details className="text-left text-xs bg-muted p-2 rounded">
          <summary className="cursor-pointer mb-2">Debug Info</summary>
          <pre>{JSON.stringify(candidate, null, 2)}</pre>
        </details>
      </div>
    );
  }
}