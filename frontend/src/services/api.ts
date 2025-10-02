import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export interface ResumeParseResponse {
  name?: string;
  email?: string;
  phone?: string;
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
}

export const apiService = ApiService.getInstance();