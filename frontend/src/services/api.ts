import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface ResumeParseResponse {
  name?: string;
  email?: string;
  phone?: string;
  missing_fields?: string[];
}

export interface Question {
  id: string;
  difficulty: 'easy' | 'medium' | 'hard';
  text: string;
  time_limit: number;
}

export interface GenerateQuestionsResponse {
  questions: Question[];
}

export interface EvaluateAnswerResponse {
  score: number;
  feedback: string;
}

export interface FinalSummaryResponse {
  final_score: number;
  summary: string;
}

export class ApiService {
  private static instance: ApiService;
  private axiosInstance;

  private constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  async parseResume(file: File): Promise<ResumeParseResponse> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.axiosInstance.post('/parse-resume/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Resume parsing failed: ${error.response?.data?.detail || error.message}`);
      }
      throw new Error('Resume parsing failed: Unknown error');
    }
  }

  async generateQuestions(role: string = 'Full Stack'): Promise<GenerateQuestionsResponse> {
    try {
      const response = await this.axiosInstance.post('/generate-questions', {
        role,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate questions from API, using fallback');
      // Fallback to static questions if API fails
      return {
        questions: [
          { id: 'q1', difficulty: 'easy', text: 'Tell me about yourself and your background.', time_limit: 30 },
          { id: 'q2', difficulty: 'easy', text: 'What interests you most about this role?', time_limit: 30 },
          { id: 'q3', difficulty: 'medium', text: 'Describe a challenging project you worked on and how you overcame the obstacles.', time_limit: 90 },
          { id: 'q4', difficulty: 'medium', text: 'How do you handle working under tight deadlines?', time_limit: 90 },
          { id: 'q5', difficulty: 'hard', text: 'Design a system to handle 1 million concurrent users. Walk me through your architecture decisions.', time_limit: 180 },
          { id: 'q6', difficulty: 'hard', text: 'How would you approach optimizing a slow database query that affects critical business operations?', time_limit: 180 },
        ],
      };
    }
  }

  async evaluateAnswer(
    questionId: string,
    questionText: string,
    answerText: string,
    difficulty: string
  ): Promise<EvaluateAnswerResponse> {
    try {
      const response = await this.axiosInstance.post('/evaluate-answer', {
        question_id: questionId,
        question_text: questionText,
        answer_text: answerText,
        difficulty,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to evaluate answer from API, using fallback');
      // Fallback scoring based on answer length and keywords
      const wordCount = answerText.trim().split(/\s+/).length;
      let score = Math.min(10, Math.max(1, Math.floor(wordCount / 10)));
      
      // Adjust based on difficulty
      if (difficulty === 'easy' && wordCount < 20) score = Math.max(1, score - 2);
      if (difficulty === 'hard' && wordCount < 50) score = Math.max(1, score - 3);
      
      return {
        score,
        feedback: 'Answer evaluated using fallback scoring (AI unavailable).',
      };
    }
  }

  async generateFinalSummary(
    candidateName: string,
    answers: Array<{
      question_id: string;
      question_text: string;
      answer_text: string;
      difficulty: string;
      score: number;
    }>
  ): Promise<FinalSummaryResponse> {
    try {
      const response = await this.axiosInstance.post('/final-summary', {
        candidate_name: candidateName,
        answers,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to generate summary from API, using fallback');
      // Fallback summary calculation
      const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0);
      const averageScore = Math.round((totalScore / answers.length) * 10) / 10;
      
      return {
        final_score: averageScore,
        summary: `Interview completed with an average score of ${averageScore}/10. AI summary unavailable.`,
      };
    }
  }

  // Legacy methods for backward compatibility
  generateQuestionScore(answer: string, difficulty: string): number {
    const wordCount = answer.trim().split(/\s+/).length;
    let score = Math.min(10, Math.max(1, Math.floor(wordCount / 10)));
    
    if (difficulty === 'easy' && wordCount < 20) score = Math.max(1, score - 2);
    if (difficulty === 'hard' && wordCount < 50) score = Math.max(1, score - 3);
    
    return score;
  }

  generateFinalSummary_Legacy(scores: number[], candidateName: string): string {
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    return `${candidateName} completed the interview with an average score of ${average.toFixed(1)}/10.`;
  }
}

export const apiService = ApiService.getInstance();
