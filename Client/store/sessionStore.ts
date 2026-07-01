import { create } from 'zustand'
import { InterviewQuestion } from '@/types'

interface SessionState {
  sessionId: string | null
  mode: 'resume_round' | 'technical_round' | null
  questions: InterviewQuestion[]
  currentIndex: number
  isComplete: boolean
  reportId: string | null
  isLoading: boolean
  error: string | null

  setSession: (id: string, mode: 'resume_round' | 'technical_round', questions: InterviewQuestion[]) => void
  nextQuestion: () => void
  setComplete: (reportId: string) => void
  reset: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useSessionStore = create<SessionState>((set) => ({
  sessionId: null,
  mode: null,
  questions: [],
  currentIndex: 0,
  isComplete: false,
  reportId: null,
  isLoading: false,
  error: null,

  setSession: (id, mode, questions) =>
    set({ sessionId: id, mode, questions, currentIndex: 0, isComplete: false, reportId: null, error: null }),

  nextQuestion: () =>
    set((state) => ({
      currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1),
    })),

  setComplete: (reportId) =>
    set({ isComplete: true, reportId }),

  reset: () =>
    set({
      sessionId: null,
      mode: null,
      questions: [],
      currentIndex: 0,
      isComplete: false,
      reportId: null,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
