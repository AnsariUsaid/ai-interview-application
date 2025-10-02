from fastapi import FastAPI, UploadFile, HTTPException, File
import os
import io
import re
import json
import requests
from typing import List, Optional, Dict, Any
from dotenv import load_dotenv
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import docx

load_dotenv()
API_KEY = os.getenv("API_KEY", None)
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "openai/gpt-oss-20b:free"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def call_llm(prompt: str, max_tokens: int = 300) -> Optional[str]:
    if not API_KEY:
        return None
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
    }
    try:
        resp = requests.post(OPENROUTER_URL, headers=headers, json=data)
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return content
    except Exception as e:
        print("LLM call failed:", e)
        return None


def extract_text_from_pdf(b: bytes) -> str:
    text = ""
    with io.BytesIO(b) as f:
        with pdfplumber.open(f) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    return text

def extract_text_from_docs(b: bytes) -> str:
    text = ""
    with io.BytesIO(b) as f:
        doc = docx.Document(f)
        for para in doc.paragraphs:
            if para.text:
                text += para.text + "\n"
    return text

EMAIL_REGEX = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
PHONE_REGEXES = [
    r"\b\d{10}\b",
    r"\b(?:\+?\d{1,3}[-.\s]?)?(?:\d{2,4}[-.\s]?\d{2,4}[-.\s]?\d{2,4})\b",
]

def extract_contact_info(text: str) -> dict[str, str]:
    emails = re.findall(EMAIL_REGEX, text)
    email = emails[0] if emails else ""
    phone = ""
    for rx in PHONE_REGEXES:
        m = re.findall(rx, text)
        if m:
            candidate = re.sub(r"\D", "", m[0])
            if len(candidate) >= 8:
                phone = candidate
                break
    name = ""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    for line in lines[:10]:
        if 2 <= len(line.split()) <= 4:
            tokens = line.split()
            title_like = sum(1 for t in tokens if re.match(r"^[A-Z][a-z'-]+$", t))
            all_caps = sum(1 for t in tokens if re.match(r"^[A-Z]{2,}$", t))
            if title_like >= 1 or all_caps >= 1:
                name = line
                break
    missing_fields = []
    if not name:
        missing_fields.append("name")
    if not email:
        missing_fields.append("email")
    if not phone:
        missing_fields.append("phone")
    return {"name": name, "email": email, "phone": phone, "missing_fields": missing_fields}


class GenerateQuestionsRequest(BaseModel):
    role: Optional[str] = "Full Stack"

class EvaluateRequest(BaseModel):
    question_id: Optional[str] = None
    question_text: str
    answer_text: str
    difficulty: str

class FinalSummaryRequest(BaseModel):
    candidate_name: Optional[str] = None
    answers: List[Dict[str, Any]]

STATIC_BANK = [
    {"id": "q1", "difficulty": "easy", "text": "What is JSX in React?", "time_limit": 20},
    {"id": "q2", "difficulty": "easy", "text": "Difference between let and var in JavaScript?", "time_limit": 20},
    {"id": "q3", "difficulty": "medium", "text": "Explain the Virtual DOM in React and how reconciliation works.", "time_limit": 60},
    {"id": "q4", "difficulty": "medium", "text": "How do you design RESTful APIs in Node.js? Give an example flow.", "time_limit": 60},
    {"id": "q5", "difficulty": "hard", "text": "How would you optimize a Node.js application handling heavy I/O and CPU-bound tasks?", "time_limit": 120},
    {"id": "q6", "difficulty": "hard", "text": "Explain tradeoffs of SSR vs CSR vs ISR for a React app and when you'd choose each.", "time_limit": 120},
]


@app.get("/health/")
async def health():
    return {"status": "ok"}

@app.post("/parse-resume/")
async def parse_resume(file: UploadFile = File(...)):
    filename = file.filename.lower()
    contents = await file.read()
    if filename.endswith(".pdf"):
        try:
            text = extract_text_from_pdf(contents)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing PDF: {str(e)}")
    elif filename.endswith(".docx"):
        try:
            text = extract_text_from_docs(contents)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error parsing DOCX: {str(e)}")
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type. Upload PDF or DOCX.")
    info = extract_contact_info(text)
    info["raw_text_snippet"] = (text[:300] + "...") if text else ""
    return info

# @app.post("/generate-questions")
# async def generate_questions(req: GenerateQuestionsRequest):
#     prompt = (
#         f"You are an interview question generator for the role: {req.role}.\n"
#         "Generate exactly 6 questions as a JSON array with keys: id, difficulty, text, time_limit.\n"
#         "Order: 2 easy (20s), 2 medium (60s), 2 hard (120s). Return only JSON."
#     )
#     content = call_llm(prompt, max_tokens=700)
#     if not content:
#         return {"questions": STATIC_BANK}
#     try:
#         questions = json.loads(content)
#         if not isinstance(questions, list) or len(questions) != 6:
#             raise ValueError("invalid shape")
#         return {"questions": questions}
#     except Exception:
#         return {"questions": STATIC_BANK}

@app.post("/generate-questions")
async def generate_questions(req: GenerateQuestionsRequest):
    prompt = (
        f"You are an interview question generator for the role: {req.role}.\n"
        "Return EXACTLY 6 questions as a JSON array ONLY, nothing else.\n"
        "Each question must have: id, difficulty, text, time_limit.\n"
        "Order: 2 easy (20s), 2 medium (60s), 2 hard (120s).\n"
        "Do NOT include explanations, text, or Markdown.\n"
        "The output must start with '[' and end with ']'."
    )

    def extract_json_array(s: str):
        import re, json
        # Remove Markdown fences
        s_clean = re.sub(r"```json|```", "", s, flags=re.IGNORECASE).strip()
        try:
            match = re.search(r"\[.*\]", s_clean, re.DOTALL)
            if match:
                return json.loads(match.group(0))
        except Exception as e:
            print("JSON extraction failed:", e)
        return None

    # First LLM call
    content = call_llm(prompt, max_tokens=1000)
    if content:
        questions = extract_json_array(content)
        if questions and len(questions) == 6:
            return {"questions": questions}

    # Retry once if first attempt failed
    print("First attempt failed, retrying LLM call...")
    content_retry = call_llm(prompt, max_tokens=1000)
    if content_retry:
        questions = extract_json_array(content_retry)
        if questions and len(questions) == 6:
            return {"questions": questions}

    # Fallback to static bank
    print("Falling back to STATIC_BANK")
    return {"questions": STATIC_BANK}



@app.post("/evaluate-answer")
async def evaluate_answer(req: EvaluateRequest):
    if not req.answer_text.strip():
        return {"score": 0, "feedback": "No answer provided."}
    prompt = (
        f"You are a senior interviewer evaluating candidate answers.\n"
        f"Question: {req.question_text}\n"
        f"Candidate answer: {req.answer_text}\n"
        f"Difficulty: {req.difficulty}\n\n"
        "Return ONLY valid JSON with exactly two fields:\n"
        " - score (integer from 0 to 10)\n"
        " - feedback (strictly one short sentence, max 15 words)\n"
        "Example: {\"score\": 7, \"feedback\": \"Good explanation but missing error handling.\"}\n"
    )

    content = call_llm(prompt, max_tokens=500)
    if not content:
        words = len(req.answer_text.split())
        score = min(10, max(1, int(words / 10)))
        return {"score": score, "feedback": "Fallback heuristic score (AI unavailable)."}
    try:
        return json.loads(content)
    except Exception:
        return {"score": 5, "feedback": "AI response parse failed, fallback used."}

@app.post("/final-summary")
async def final_summary(req: FinalSummaryRequest):
    difficulty_weight = {"easy": 1, "medium": 2, "hard": 3}
    total_weight, total_max = 0.0, 0.0

    for a in req.answers:
        score = float(a.get("score", 0))
        diff = a.get("difficulty", "easy")
        w = difficulty_weight.get(diff, 1)
        total_weight += score * w
        total_max += 10 * w

    if total_max > 0:
        final_percent = round((total_weight / total_max) * 100, 1)
        final_score = round((total_weight / total_max) * 10, 1)
    else:
        final_percent = 0.0
        final_score = 0.0

    content = (
        f"Candidate answered {len(req.answers)} questions. "
        f"Final Score: {final_score}/10 ({final_percent}%)."
    )

    return {
        "final_score": final_score,          # 0–10 scale
        "final_percent": final_percent,      # 0–100 scale
        "summary": content
    }


