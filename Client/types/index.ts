export interface User {
  id: string
  email: string
  name: string
  target_role?: string
  experience_level?: string
  created_at?: string
}

export interface ParsedResume {
  name: string
  skills: string[]
  tech_stack: string[]
  projects: Project[]
  experience: Experience[]
  education: Education[]
}

export interface Project {
  name: string
  description: string
  tech: string[]
  key_claims: string[]
}

export interface Experience {
  role: string
  company: string
  duration: string
  description: string
}

export interface Education {
  degree: string
  institution: string
  year: string
}

export interface ResumeData {
  resume_id: string
  parsed_data: ParsedResume
  created_at: string
}

export interface InterviewQuestion {
  id: string
  text: string
  order: number
  difficulty?: string
  resume_anchor?: string | null
  answered?: boolean
  answer_text?: string | null
}

export interface InterviewSession {
  id: string
  mode: 'resume_round' | 'technical_round'
  status: 'active' | 'completed' | 'abandoned'
  started_at: string
  completed_at?: string
  questions: InterviewQuestion[]
  has_report?: boolean
}

export interface QuestionFeedback {
  question_id: string
  scores: {
    technical_depth: number
    clarity: number
    relevance: number
    communication: number
    problem_solving: number
  }
  strength: string
  weakness: string
  model_answer: string
}

export interface Report {
  id: string
  session_id: string
  overall_score: number
  dimension_scores: {
    technical_depth: number
    clarity: number
    relevance: number
    communication: number
    problem_solving: number
  }
  question_feedback: QuestionFeedback[]
  summary: string
  created_at: string
}

export interface AuthResponse {
  user_id: string
  access_token: string
  refresh_token: string
  name: string
  email: string
}

export interface SessionListItem {
  id: string
  mode: string
  status: string
  started_at: string | null
  completed_at: string | null
  has_report: boolean
}

export const DIMENSION_LABELS: Record<string, string> = {
  technical_depth: 'Technical Depth',
  clarity: 'Clarity',
  relevance: 'Relevance',
  communication: 'Communication',
  problem_solving: 'Problem Solving',
}

export const DIMENSION_COLORS: Record<string, string> = {
  technical_depth: 'bg-nb-blue',
  clarity: 'bg-nb-green',
  relevance: 'bg-nb-orange',
  communication: 'bg-nb-pink',
  problem_solving: 'bg-nb-purple',
}
