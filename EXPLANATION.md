# InterviewForge AI — Project Explanation

## 1. Product Level

### What is InterviewForge AI?

InterviewForge AI is a web-based adaptive mock interview platform. It ingests a user's resume, generates role-specific and resume-anchored interview questions using Google Gemini 1.5 Flash, conducts a structured text-based interview session, and returns a detailed scoring report with actionable feedback.

### Core Differentiator

Deep personalization — every question is anchored to something the user actually wrote on their resume. No generic question banks, no pre-scripted flows. The system reads the resume, understands the candidate's claimed experience, and challenges them on it — exactly as a human interviewer would.

### Target Users

- **Primary**: College students and early-career engineers (fresher/junior level)
- **Target Roles**: SDE, AI/ML Engineer, Full-Stack Developer, Frontend Engineer, Python Developer
- **Use Case**: Preparing for interviews at Indian tech companies and startups

### Interview Modes

| Mode | Description |
|---|---|
| **Resume Round** | Questions directly tied to the candidate's stated projects, experience, and skills from their resume |
| **Technical Round** | Role-specific conceptual questions based on the target role the user declared at onboarding |

### Scoring Dimensions

| Dimension | Weight | What it measures |
|---|---|---|
| Technical Depth | 30% | Accuracy and completeness of technical answer |
| Clarity | 20% | How well-structured and easy to follow the answer is |
| Relevance | 20% | Whether the answer addresses the actual question asked |
| Communication | 15% | Professional tone, appropriate length, articulation |
| Problem Solving | 15% | Evidence of reasoning process, not just recited facts |

### Key Functional Requirements

- Resume upload (PDF/DOCX up to 5MB) with AI-powered parsing
- Personalized question generation (8-10 per session)
- Structured interview session with turn-by-turn flow (no skipping, no going back)
- Minimum answer length enforcement (30 characters)
- 60-minute session timeout
- Post-interview scoring with per-question feedback and model answers
- Interview history dashboard
- JWT-based authentication with refresh tokens

---

## 2. System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                           │
│                                                                     │
│   Next.js 14 · TypeScript · Tailwind CSS · Zustand · Axios         │
│                                                                     │
│   Pages: Landing | Auth | Dashboard | Interview | Report           │
│                                                                     │
└──────────────────────────┬──────────────────────────────────────────┘
                           │  HTTPS / REST JSON
                           │  JWT Bearer Auth
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         BACKEND (Railway)                           │
│                                                                     │
│   Flask · Python 3.11 · SQLAlchemy · Flask-JWT-Extended             │
│                                                                     │
│   Routers: Auth | Resumes | Sessions | Reports                      │
│   Services: Resume Parser | Question Generator | Scoring Engine     │
│                                                                     │
└──────────┬──────────────────────────────┬───────────────────────────┘
           │                              │
           │  HTTP / SQL                  │  REST API
           ▼                              ▼
┌──────────────────────┐    ┌────────────────────────────┐
│    DATABASE          │    │    AI LAYER                │
│                      │    │                            │
│   PostgreSQL         │    │   Google Gemini 1.5 Flash  │
│   (via Supabase)     │    │                            │
│                      │    │   Tasks:                   │
│   Tables:            │    │   - Resume parsing         │
│   - users            │    │   - Question generation    │
│   - resumes          │    │   - Answer scoring         │
│   - sessions         │    │   - Feedback generation    │
│   - questions        │    │                            │
│   - answers          │    └────────────────────────────┘
│   - reports          │
└──────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | Next.js 14 (App Router) | SSR, routing, dynamic pages |
| Styling | Tailwind CSS | Utility-first CSS with neobrutalism theme |
| State Management | Zustand | Lightweight client state for interview session |
| HTTP Client | Axios | API calls with JWT interceptor |
| Backend Framework | Flask 3.x | REST API server |
| ORM | SQLAlchemy | Database abstraction and migrations |
| Auth | Flask-JWT-Extended | JWT access + refresh tokens |
| AI Provider | Google Gemini 1.5 Flash | Resume parsing, question gen, scoring |
| File Parsing | pypdf / python-docx | PDF and DOCX text extraction |
| Database | PostgreSQL (SQLite for dev) | Relational data storage |
| Deployment | Vercel (FE) + Railway (BE) | Hosting and CI/CD |

### Key Technical Decisions

| Decision | Choice | Rationale |
|---|---|---|
| AI Provider | Gemini 1.5 Flash | Free tier on Google AI Studio, no credit card needed |
| Backend Language | Python + Flask | Best ecosystem for AI/LLM integration |
| Resume Storage | Parsed JSON only | No file storage costs, reduced privacy surface |
| Scoring Computation | Weights applied server-side | Prevents prompt injection of scores |
| Session State | Database-backed | Survives restarts, supports history |
| Auth | JWT (no OAuth) | Simpler for MVP; easier to extend later |
| No Real-Time | HTTP polling / REST | MVP doesn't need WebSocket complexity |

---

## 3. Request Flow

### Full User Journey

```
User                        Frontend                      Backend                      Gemini
 │                            │                              │                           │
 │  1. Sign Up                │                              │                           │
 │ ─────────────────────────► │  POST /auth/signup           │                           │
 │                            │ ────────────────────────────► │                           │
 │                            │ ◄──────────────────────────── │ JWT tokens                │
 │ ◄───────────────────────── │                              │                           │
 │                            │                              │                           │
 │  2. Upload Resume          │                              │                           │
 │ ─────────────────────────► │  POST /resumes/upload        │                           │
 │                            │ ────────────────────────────► │                           │
 │                            │                              │ ───────────────────────► │  3. Parse resume
 │                            │                              │ ◄─────────────────────── │  Structured JSON
 │                            │ ◄──────────────────────────── │ Resume ID + parsed data  │
 │ ◄───────────────────────── │                              │                           │
 │                            │                              │                           │
 │  4. Start Interview        │                              │                           │
 │ ─────────────────────────► │  POST /sessions/start        │                           │
 │                            │ ────────────────────────────► │                           │
 │                            │                              │ ───────────────────────► │  5. Generate questions
 │                            │                              │ ◄─────────────────────── │  10 questions array
 │                            │ ◄──────────────────────────── │ Session ID + questions    │
 │ ◄───────────────────────── │                              │                           │
 │                            │                              │                           │
 │  6. Answer Q1              │                              │                           │
 │ ─────────────────────────► │  POST /sessions/{id}/answer  │                           │
 │                            │ ────────────────────────────► │                           │
 │                            │ ◄──────────────────────────── │ { next_question }        │
 │ ◄───────────────────────── │                              │                           │
 │                            │                              │                           │
 │  ... (repeat for Q2-Q10)   │                              │                           │
 │                            │                              │                           │
 │  7. Complete Session       │                              │                           │
 │                            │  POST /sessions/{id}/complete │                           │
 │                            │ ────────────────────────────► │                           │
 │                            │                              │ ───────────────────────► │  8. Score all answers
 │                            │                              │ ◄─────────────────────── │  Scores + feedback
 │                            │ ◄──────────────────────────── │ Report ID                 │
 │ ◄───────────────────────── │                              │                           │
 │                            │                              │                           │
 │  9. View Report            │                              │                           │
 │ ─────────────────────────► │  GET /reports/{id}           │                           │
 │                            │ ────────────────────────────► │                           │
 │                            │ ◄──────────────────────────── │ Full report with scores   │
 │ ◄───────────────────────── │                              │                           │
```

### Data Flow Detail

1. **Resume Upload Flow**: User uploads PDF/DOCX → Flask receives multipart file → pypdf/python-docx extracts raw text → Gemini structures it into JSON → parsed data stored in `resumes` table → frontend displays for confirmation

2. **Question Generation Flow**: User selects resume + mode → Flask reads parsed resume from DB → sends resume JSON + role info to Gemini → Gemini returns 10 questions with difficulty levels → stored in `questions` table → returned to frontend

3. **Interview Flow**: Frontend shows one question at a time → user types answer → posted to backend → stored in `answers` table → backend returns next question or session_complete flag

4. **Scoring Flow**: After last answer, user triggers `/complete` → backend collects all Q&A pairs → sends to Gemini for scoring → Gemini returns per-question dimension scores + feedback → backend computes weighted overall score → saves `report` record → returns report ID

---

## 4. Database Schema

### Entity Relationship

```
User ──┬── Resume ──┬── Session ──┬── Question ── Answer
       │            │              │
       │            │              └── Report
       │            │
       └────────────┘
```

### Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| email | VARCHAR(255) UNIQUE | Login identifier |
| password_hash | VARCHAR(255) | bcrypt hashed |
| name | VARCHAR(100) | |
| target_role | VARCHAR(100) | e.g. "AI/ML Engineer" |
| experience_level | VARCHAR(20) | fresher / junior / mid |
| created_at | DATETIME | Auto-generated |

#### `resumes`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| user_id | VARCHAR(36) FK → users.id | |
| parsed_data | JSON | Structured: skills, projects, education, experience |
| raw_text | TEXT | Full extracted text for LLM context |
| created_at | DATETIME | |

#### `sessions`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| user_id | VARCHAR(36) FK → users.id | |
| resume_id | VARCHAR(36) FK → resumes.id | |
| mode | VARCHAR(20) | resume_round / technical_round |
| status | VARCHAR(20) | active / completed / abandoned |
| started_at | DATETIME | |
| completed_at | DATETIME | Nullable |

#### `questions`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| session_id | VARCHAR(36) FK → sessions.id | |
| question_text | TEXT | |
| question_order | INTEGER | 1-indexed |
| difficulty | VARCHAR(10) | easy / medium / hard |
| resume_anchor | TEXT | The resume claim this targets (nullable for technical) |

#### `answers`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| question_id | VARCHAR(36) FK → questions.id UNIQUE | One answer per question |
| answer_text | TEXT | User's raw answer |
| submitted_at | DATETIME | |

#### `reports`
| Column | Type | Notes |
|---|---|---|
| id | VARCHAR(36) PK | UUID |
| session_id | VARCHAR(36) FK → sessions.id UNIQUE | One report per session |
| overall_score | INTEGER | Weighted, computed server-side |
| dimension_scores | JSON | { technical_depth: 85, clarity: 70, ... } |
| question_feedback | JSON | Array of per-question feedback objects |
| summary | TEXT | Top 3 improvement areas |
| created_at | DATETIME | |

---

## 5. API Contracts

### Auth Endpoints

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/auth/signup` | No | `{ email, password, name, target_role?, experience_level? }` | `{ user_id, access_token, refresh_token, name, email }` |
| POST | `/auth/login` | No | `{ email, password }` | `{ user_id, access_token, refresh_token, name, email }` |
| POST | `/auth/refresh` | Refresh Token | `{ refresh_token }` | `{ access_token }` |
| GET | `/auth/me` | Bearer Token | — | `{ id, email, name, target_role, experience_level, created_at }` |
| PUT | `/auth/profile` | Bearer Token | `{ name?, target_role?, experience_level? }` | `{ message }` |

### Resume Endpoints

| Method | Endpoint | Auth | Request | Response |
|---|---|---|---|---|
| POST | `/resumes/upload` | Bearer Token | `multipart/form-data: file` | `{ resume_id, parsed_data, created_at }` |
| GET | `/resumes/` | Bearer Token | — | `{ resumes: [...] }` |
| GET | `/resumes/{id}` | Bearer Token | — | `{ resume_id, parsed_data, created_at }` |

### Session Endpoints

| Method | Endpoint | Auth | Request Body | Response |
|---|---|---|---|---|
| POST | `/sessions/start` | Bearer Token | `{ resume_id, mode }` | `{ session_id, questions: [{id, text, order}] }` |
| POST | `/sessions/{id}/answer` | Bearer Token | `{ question_id, answer_text }` | `{ next_question | session_complete: true }` |
| POST | `/sessions/{id}/complete` | Bearer Token | — | `{ report_id }` |
| GET | `/sessions/` | Bearer Token | — | `{ sessions: [...] }` |
| GET | `/sessions/{id}` | Bearer Token | — | Full session with questions |

### Report Endpoints

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/reports/{id}` | Bearer Token | `{ overall_score, dimension_scores, question_feedback[], summary }` |
| GET | `/reports/session/{sessionId}` | Bearer Token | Same as above |

---

## 6. Frontend Structure

### Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, features, how-it-works |
| `/login` | Login | Sign in form |
| `/signup` | Signup | Registration with role/experience selection |
| `/dashboard` | Dashboard | Resume management, session history |
| `/interview/setup` | Setup | Select resume + interview mode |
| `/interview/[sessionId]` | Session | Active interview with Q&A flow |
| `/report/[reportId]` | Report | Full scoring report with feedback |
| `/report/session/[sessionId]` | Redirect | Redirects to report by report ID |

### Component Architecture

```
components/
├── ui/                      # Reusable neobrutalism design system
│   ├── NeoButton.tsx        # Button with 4 variants + 3 sizes
│   ├── NeoCard.tsx          # Card container with optional rotation
│   ├── NeoInput.tsx         # Input + Textarea components
│   ├── NeoBadge.tsx         # Inline badge with 5 color variants
│   └── ProgressBar.tsx      # Animated progress bar
├── interview/
│   ├── QuestionCard.tsx     # Question display with difficulty badge
│   └── AnswerInput.tsx      # Textarea with validation + submit
└── report/
    ├── ScoreCard.tsx        # Score display (sm/lg sizes)
    ├── DimensionBreakdown.tsx  # Grid of dimension scores with bars
    └── QuestionFeedback.tsx   # Per-question feedback card
```

### State Management (Zustand)

The `sessionStore` manages the active interview session:

```typescript
interface SessionState {
  sessionId: string | null
  mode: 'resume_round' | 'technical_round' | null
  questions: InterviewQuestion[]
  currentIndex: number
  isComplete: boolean
  reportId: string | null
  isLoading: boolean
  error: string | null
}
```

### Auth Flow

1. User signs up/logs in → backend returns JWT access + refresh tokens
2. Tokens stored in `localStorage` via `lib/auth.ts`
3. Axios interceptor in `lib/api.ts` automatically attaches `Authorization: Bearer <token>` to all requests
4. On 401 response, interceptor tries to refresh token automatically
5. If refresh fails, clears auth and redirects to `/login`

---

## 7. AI Prompt Architecture

### 7.1 Resume Parsing Prompt

**Purpose**: Convert raw extracted text into structured JSON.

```
SYSTEM: You are a resume parser. Extract structured information...
Schema: { name, skills, tech_stack, projects[], experience[], education[] }

USER: {raw_resume_text}
```

### 7.2 Question Generation — Resume Round

**Purpose**: Generate 10 questions anchored to resume claims.

```
SYSTEM: You are a senior technical interviewer. Generate 10 questions.
Rules: Every question references resume content. Mix 3 easy, 4 medium, 3 hard.
Focus on architecture, tradeoffs, failure modes. No trivia.

USER: Target Role: {role} Experience: {level} Resume: {json}
```

### 7.3 Question Generation — Technical Round

**Purpose**: Generate 10 role-specific technical questions.

```
SYSTEM: Generate 10 technical questions for this target role.
Rules: Test conceptual depth. Mix difficulty levels.

USER: Target Role: {role} Experience: {level}
```

### 7.4 Scoring Prompt

**Purpose**: Score each answer across 5 dimensions with feedback.

```
SYSTEM: You are an interview evaluator. Score each answer.
Dimensions (0-100): technical_depth, clarity, relevance, communication, problem_solving
Rules: Feedback must be specific. Model answer 2-4 sentences.

USER: {qa_pairs_json}
```

### Fallback Strategy

When Gemini is unavailable (no API key or rate limited), the system falls back to deterministic mock responses that simulate realistic data for all three AI functions. This allows development and testing without API access.

---

## 8. Neobrutalism Design System

### Design Tokens

```css
-- Colors: nb-black (#1a1a1a), nb-yellow (#ffd803), nb-pink (#ff6b6b),
           nb-blue (#3b82f6), nb-green (#10b981), nb-orange (#f97316),
           nb-purple (#8b5cf6), nb-white (#fefefe), nb-gray (#f0f0f0)

-- Shadows: nb (4px 4px 0px 0px #1a1a1a)
            nb-sm (3px 3px 0px 0px #1a1a1a)
            nb-lg (6px 6px 0px 0px #1a1a1a)

-- Borders: 3px solid #1a1a1a (every component)
-- Fonts: Space Grotesk (display), Inter (body), JetBrains Mono (code)
-- Rotations: -2deg to +2deg on cards for "hand-placed" feel
```

### Key Design Principles

1. **Bold outlines** — Every interactive element has a 3px black border
2. **Hard shadows** — Box shadows have zero blur, creating a chunky 3D effect
3. **High contrast** — Bright saturated backgrounds (yellow, pink, blue, green) with black text
4. **Slight rotations** — Cards and badges are subtly rotated for a hand-crafted feel
5. **Chunky typography** — Bold display fonts with heavy weight
6. **Interactive feedback** — Buttons shift on hover/click (translate + shadow change)

### Component Examples

```
[Button]     ┌──────────────────────────────┐
             │  ██  Start Interview →  ██   │
             └──────────────────────────────┘
             Bold bg, 3px border, hard shadow

[Card]       ┌──────────────────────────────────┐
             │  📄 Resume-Personalized          │
             │  Every question is anchored...   │
             └──────────────────────────────────┘
             Rotated -1deg, pink bg, 3px border

[Input]      ┌──────────────────────────────────┐
             │  Type your answer here...        │
             └──────────────────────────────────┘
             White bg, 3px border, focus shadow
```

---

## 9. Deployment

### Backend (Railway)

```
1. Push interviewforge-backend/ to GitHub
2. Connect repo to Railway
3. Set start command: gunicorn run:app
4. Configure environment variables in Railway dashboard
5. Railway auto-deploys on push to main
```

### Frontend (Vercel)

```
1. Push interviewforge-frontend/ to GitHub
2. Connect repo to Vercel
3. Set framework: Next.js
4. Set environment variable: NEXT_PUBLIC_API_URL=<railway-url>
5. Vercel auto-deploys on push to main
```

### Required Environment Variables

**Backend** (`.env`):
```
DATABASE_URL=postgresql://user:pass@host:5432/interviewforge
GEMINI_API_KEY=your_key_from_aistudio
JWT_SECRET_KEY=random_256_bit_secret
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

**Frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

---

## 10. Project Structure

```
interviewforge-backend/
├── app/
│   ├── __init__.py          # Flask app factory, DB init, blueprint registration
│   ├── models/
│   │   ├── user.py          # User model
│   │   ├── resume.py        # Resume model
│   │   ├── session.py       # Session + Question + Answer models
│   │   └── report.py        # Report model
│   ├── routes/
│   │   ├── auth.py          # Signup, login, refresh, profile
│   │   ├── resumes.py       # Upload, list, get
│   │   ├── sessions.py      # Start, answer, complete, list
│   │   └── reports.py       # Get report
│   └── services/
│       ├── gemini_client.py      # Gemini API wrapper with retry + mock fallback
│       ├── resume_parser.py      # PDF/DOCX extraction + Gemini parsing
│       ├── question_generator.py # Resume + Technical question generation
│       └── scoring_engine.py     # Answer scoring with weighted dimensions
├── run.py                   # Entry point
├── requirements.txt
└── .env

interviewforge-frontend/
├── app/
│   ├── layout.tsx           # Root layout with global styles
│   ├── globals.css          # Tailwind + neobrutalism design system
│   ├── page.tsx             # Landing page
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── dashboard/page.tsx
│   ├── interview/
│   │   ├── setup/page.tsx
│   │   └── [sessionId]/page.tsx
│   └── report/
│       ├── [reportId]/page.tsx
│       └── session/[sessionId]/page.tsx
├── components/
│   ├── ui/                  # NeoButton, NeoCard, NeoInput, NeoBadge, ProgressBar
│   ├── interview/           # QuestionCard, AnswerInput
│   └── report/              # ScoreCard, DimensionBreakdown, QuestionFeedback
├── lib/
│   ├── api.ts               # Axios instance with JWT interceptor
│   └── auth.ts              # Token and user helpers
├── store/
│   └── sessionStore.ts      # Zustand store for active session
├── types/
│   └── index.ts             # TypeScript interfaces and constants
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── postcss.config.js
```

---

## 11. Build & Run Commands

```bash
# === BACKEND ===
cd interviewforge-backend

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env  # Edit with your config

# Run development server
python run.py
# Server starts at http://localhost:4000

# === FRONTEND ===
cd interviewforge-frontend

# Install dependencies
npm install

# Run development server
npm run dev
# App starts at http://localhost:3000

# Production build
npm run build
npm start
```

---

## 12. Testing Without Gemini API

The system includes mock fallbacks for all AI functions, so it works without a Gemini API key:

- **Resume Parsing**: Returns a predefined structured resume with sample projects and skills
- **Question Generation**: Returns 10 realistic questions with difficulty levels and resume anchors
- **Scoring**: Returns dimension scores, per-question feedback, and improvement summary

To use real AI, set `GEMINI_API_KEY` in `interviewforge-backend/.env`.
