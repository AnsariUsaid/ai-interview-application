# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is an AI-powered interview application built with a React/TypeScript frontend and Python FastAPI backend. The application provides two interfaces: one for interviewees to take automated interviews and another for interviewers to review candidate results.

## Architecture

### Frontend (`frontend/`)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Library**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit with Redux Persist for state persistence
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with singleton API service pattern
- **Data Fetching**: TanStack Query (React Query) for server state management
- **Forms**: React Hook Form with Zod validation
- **Animations**: Framer Motion

### Backend (`backend/`)
- **Framework**: FastAPI with Python 3.13
- **Document Processing**: pdfplumber for PDF extraction, python-docx for DOCX files
- **LLM Integration**: OpenRouter API for AI-powered question generation and answer evaluation
- **CORS**: Configured to allow frontend on localhost:8080

### Key Components

#### Frontend State Management
- **Candidates Slice**: Manages candidate profiles, interview questions, and completion status
- **Interview Slice**: Controls active interview session, timing, and question progression
- **UI Slice**: Handles modal states, navigation, and loading indicators

#### Backend Services
- **Resume Parsing**: Extracts contact information (name, email, phone) from uploaded documents
- **Question Generation**: Uses LLM to create role-specific interview questions with different difficulty levels
- **Answer Evaluation**: AI-powered scoring and feedback generation for candidate responses
- **Final Summary**: Generates comprehensive interview summaries with weighted scoring

## Common Development Tasks

### Frontend Development

**Start development server:**
```bash
cd frontend
npm run dev
```
Server runs on `http://localhost:8080` (configured to match backend CORS settings)

**Build for production:**
```bash
cd frontend
npm run build
```

**Build for development (with debugging):**
```bash
cd frontend
npm run build:dev
```

**Lint code:**
```bash
cd frontend
npm run lint
```

**Preview production build:**
```bash
cd frontend
npm run preview
```

### Backend Development

**Start development server:**
```bash
cd backend
python main.py
```
Server runs on `http://localhost:8000` by default

**Environment Setup:**
- Create `.env` file with `API_KEY=your_openrouter_api_key`
- The backend uses OpenRouter's free tier model: `openai/gpt-oss-20b:free`

### Running Full Stack

1. Start backend: `cd backend && python main.py`
2. Start frontend: `cd frontend && npm run dev`
3. Access application at `http://localhost:8080`

## Development Notes

### Frontend Architecture Patterns

**Component Organization:**
- `components/pages/` - Main page components (IntervieweePage, InterviewerPage)
- `components/interview/` - Interview-specific components (ResumeUploader, ChatInterface)
- `components/modals/` - Modal dialogs
- `components/ui/` - Reusable UI components (Shadcn/UI)

**State Management:**
- Redux slices follow domain-driven design
- Redux Persist maintains state across browser refreshes
- Async operations use Redux Toolkit's createAsyncThunk pattern

**Styling System:**
- Custom CSS variables for consistent theming
- Tailwind utilities with custom design tokens
- Responsive design with mobile-first approach
- Custom gradients and shadows defined in CSS variables

### Backend Architecture Patterns

**API Endpoints:**
- `/health/` - Health check endpoint
- `/parse-resume/` - Document upload and parsing
- `/generate-questions` - AI question generation for specific roles
- `/evaluate-answer` - Individual answer scoring and feedback
- `/final-summary` - Complete interview evaluation

**Error Handling:**
- FastAPI automatic validation with Pydantic models
- Graceful fallbacks when AI services are unavailable
- HTTP exception handling with descriptive error messages

### Testing Strategy

- No test suite currently configured
- When adding tests, consider:
  - Frontend: Jest/Vitest with React Testing Library
  - Backend: pytest with FastAPI test client
  - E2E: Playwright for full-stack integration tests

### File Upload Handling

- Supports PDF and DOCX resume formats
- Text extraction uses specialized libraries (pdfplumber, python-docx)
- Contact information extracted via regex patterns
- Frontend handles file validation and upload progress

### AI Integration

- OpenRouter API integration for LLM capabilities
- Fallback mechanisms when AI services are unavailable
- Question banks provide static alternatives
- Structured prompting for consistent AI responses

### Development Environment

- Frontend uses Vite dev server with hot module replacement
- TypeScript strict mode disabled for faster development
- ESLint configured with React-specific rules
- Path aliases configured (`@/` maps to `src/`)

### State Persistence

- Interview progress persists across browser refreshes
- Candidate data stored in localStorage via redux-persist
- Welcome back modal for resuming incomplete interviews