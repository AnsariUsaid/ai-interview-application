# AI-Powered Interview Application

An intelligent interview platform that automates the technical interview process using AI-powered question generation and answer evaluation. The application provides two distinct interfaces: one for candidates to take interviews and another for interviewers to review candidate performance.

## 🌟 Features

### For Candidates (Interviewee Interface)
- **Resume Upload & Parsing**: Automatic extraction of contact information from PDF/DOCX resumes
- **AI-Generated Questions**: Role-specific interview questions with varying difficulty levels
- **Timed Responses**: Each question has appropriate time limits based on difficulty
- **Real-time Feedback**: Instant evaluation and scoring for each answer
- **Progress Tracking**: Interview state persists across browser refreshes
- **Comprehensive Results**: Final score with detailed performance summary

### For Interviewers (Interviewer Interface)
- **Candidate Dashboard**: View all interviewed candidates in one place
- **Detailed Analytics**: Review individual answers with scores and AI feedback
- **Performance Metrics**: Weighted scoring system based on question difficulty
- **Interview Summaries**: AI-generated professional summaries for each candidate
- **Export Capabilities**: Download candidate data and interview results

### AI-Powered Intelligence
- **Smart Question Generation**: Creates role-specific questions using LLM
- **Answer Evaluation**: AI-powered scoring with constructive feedback
- **Professional Summaries**: Automated comprehensive interview assessments
- **Difficulty Balancing**: 2 easy, 2 medium, 2 hard questions per interview

## 🏗️ Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **UI Components**: Shadcn/UI (built on Radix UI primitives)
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit with Redux Persist
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios with singleton API service
- **Data Fetching**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Animations**: Framer Motion

### Backend
- **Framework**: FastAPI (Python 3.13)
- **Document Processing**: 
  - pdfplumber for PDF parsing
  - python-docx for DOCX files
- **AI Integration**: OpenRouter API for LLM capabilities
- **Model**: OpenAI GPT-OSS-20B (free tier)
- **CORS**: Configured for local development

## 📋 Prerequisites

- **Node.js**: v18 or higher
- **Python**: 3.11 or higher
- **npm** or **bun**: Package manager
- **OpenRouter API Key**: For AI features (free tier available)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/AnsariUsaid/ai-interview-application.git
cd ai-interview-application
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv myvenv

# Activate virtual environment
# On macOS/Linux:
source myvenv/bin/activate
# On Windows:
myvenv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "API_KEY=your_openrouter_api_key_here" > .env
```

**Get your API Key:**
1. Visit [OpenRouter.ai](https://openrouter.ai/)
2. Sign up for a free account
3. Generate an API key
4. Add it to your `.env` file

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
# or
bun install

# Start development server
npm run dev
# or
bun dev
```

## 🎯 Running the Application

### Start Backend Server

```bash
cd backend
source myvenv/bin/activate  # On macOS/Linux
python main.py
```

Backend runs on: `http://localhost:8000`

### Start Frontend Server

```bash
cd frontend
npm run dev
# or
bun dev
```

Frontend runs on: `http://localhost:8080`

### Access the Application

Open your browser and navigate to: `http://localhost:8080`

## 📱 Usage

### Taking an Interview (Candidate Flow)

1. **Upload Resume**
   - Click "Start Interview" on the home page
   - Upload your resume (PDF or DOCX format)
   - System automatically extracts your contact information

2. **Begin Interview**
   - Review extracted information
   - Click "Start Interview" to begin
   - Questions are presented one at a time

3. **Answer Questions**
   - Each question has a specific time limit
   - Type your answer in the provided text area
   - Click "Submit Answer" to proceed

4. **View Results**
   - Receive immediate feedback on each answer
   - See your score and AI-generated feedback
   - Review final summary at the end

### Reviewing Candidates (Interviewer Flow)

1. **Access Interviewer Dashboard**
   - Click "Interviewer" from the main menu
   - View list of all candidates who completed interviews

2. **Review Individual Candidates**
   - Click on any candidate card
   - View detailed answers with scores
   - Read AI-generated feedback for each response
   - Check overall performance metrics

3. **Export Data** (if needed)
   - Use browser's print function for reports
   - Copy candidate information for records

## 🛠️ Development

### Project Structure

```
swipe-project/
├── backend/
│   ├── main.py              # FastAPI application with all endpoints
│   ├── requirements.txt     # Python dependencies
│   ├── myvenv/             # Virtual environment (not in git)
│   └── .env                # Environment variables (not in git)
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── pages/      # Main page components
│   │   │   ├── interview/  # Interview-specific components
│   │   │   ├── modals/     # Modal dialogs
│   │   │   └── ui/         # Shadcn UI components
│   │   ├── store/          # Redux store and slices
│   │   ├── services/       # API service layer
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── vite.config.ts      # Vite configuration
│
├── WARP.md                 # Development guidelines
└── README.md               # This file
```

### Available Scripts

#### Frontend

```bash
npm run dev          # Start development server (port 8080)
npm run build        # Build for production
npm run build:dev    # Build with development mode
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

#### Backend

```bash
python main.py       # Start FastAPI server (port 8000)
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health/` | GET | Health check |
| `/parse-resume/` | POST | Upload and parse resume |
| `/generate-questions` | POST | Generate interview questions |
| `/evaluate-answer` | POST | Evaluate candidate answer |
| `/final-summary` | POST | Generate interview summary |

### Environment Variables

#### Backend (.env)
```
API_KEY=your_openrouter_api_key
```

#### Frontend
No environment variables required for basic setup. Uses `http://localhost:8000` as default backend URL.

## 🎨 Features in Detail

### Resume Parsing
- Supports PDF and DOCX formats
- Extracts name, email, and phone number
- Uses regex patterns for contact information
- Provides raw text snippet for verification

### Question Generation
- Role-specific question creation
- Difficulty levels: Easy (20s), Medium (60s), Hard (120s)
- Fallback to static question bank if AI unavailable
- Automatic retry mechanism for reliability

### Answer Evaluation
- 0-10 scoring scale
- Difficulty-weighted scoring system
- Constructive feedback for each answer
- Heuristic fallback when AI is unavailable

### State Persistence
- Interview progress saved in browser
- Resume if browser is closed accidentally
- Welcome back modal for incomplete interviews
- Complete candidate data retention

## 🔧 Configuration

### CORS Settings

Backend CORS is configured for localhost development:
```python
allow_origins=["http://localhost:8080"]
```

For production, update this in `backend/main.py` to include your production domain.

### Port Configuration

- **Frontend**: Port 8080 (configured in `vite.config.ts`)
- **Backend**: Port 8000 (default FastAPI port)

To change ports, update:
- Frontend: `vite.config.ts` → `server.port`
- Backend: `main.py` → `uvicorn.run()` parameters

### AI Model Selection

Current model: `openai/gpt-oss-20b:free`

To use a different model, update `MODEL` variable in `backend/main.py`:
```python
MODEL = "your-preferred-model"
```

See [OpenRouter Models](https://openrouter.ai/models) for available options.

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError` when starting backend
```bash
# Solution: Ensure virtual environment is activated and dependencies installed
source myvenv/bin/activate
pip install -r requirements.txt
```

**Problem**: AI features not working
```bash
# Solution: Check your API key in .env file
# Ensure API_KEY is set correctly
# Verify you have credits on OpenRouter
```

**Problem**: CORS errors
```bash
# Solution: Ensure frontend is running on port 8080
# Or update CORS settings in backend/main.py
```

### Frontend Issues

**Problem**: `Cannot find module` errors
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Problem**: Port already in use
```bash
# Solution: Kill process on port 8080 or change port
# macOS/Linux:
lsof -ti:8080 | xargs kill -9
# Or change port in vite.config.ts
```

**Problem**: Build fails
```bash
# Solution: Clear cache and rebuild
npm run build -- --force
```

## 🚀 Deployment

### Backend Deployment

1. **Prepare for production**:
   - Update CORS origins in `main.py`
   - Set production environment variables
   - Use production-grade WSGI server (Gunicorn/Uvicorn)

2. **Deploy options**:
   - Render.com
   - Railway.app
   - AWS Lambda
   - Google Cloud Run

### Frontend Deployment

1. **Build production bundle**:
```bash
npm run build
```

2. **Deploy options**:
   - Vercel (recommended for Vite projects)
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

3. **Update API URL**:
   - Create environment variable for production backend URL
   - Update API service configuration

## 📊 Performance

- **Question Generation**: ~2-3 seconds (with AI)
- **Answer Evaluation**: ~1-2 seconds per answer
- **Resume Parsing**: <1 second
- **Frontend Build**: ~5-10 seconds
- **Bundle Size**: ~500KB (gzipped)

## 🔒 Security Considerations

- API keys stored in environment variables (not committed to git)
- CORS configured for specific origins
- File upload limited to PDF/DOCX only
- Input validation using Pydantic models
- No persistent data storage (stateless application)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

**Ansari Usaid Anzer**
- GitHub: [@AnsariUsaid](https://github.com/AnsariUsaid)
- Repository: [ai-interview-application](https://github.com/AnsariUsaid/ai-interview-application)

## 🙏 Acknowledgments

- **Shadcn/UI** for beautiful React components
- **OpenRouter** for AI model access
- **FastAPI** for excellent Python backend framework
- **Vite** for blazing fast development experience
- **Radix UI** for accessible component primitives

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions

## 🗺️ Roadmap

- [ ] Add authentication system
- [ ] Implement database for persistent storage
- [ ] Add video interview capability
- [ ] Support multiple languages
- [ ] Add interview scheduling
- [ ] Implement email notifications
- [ ] Add analytics dashboard
- [ ] Support custom question banks

---

**Made with ❤️ for better technical interviews**
