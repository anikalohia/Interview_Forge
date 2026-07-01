'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { InterviewQuestion } from '@/types'

export default function InterviewSessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [reportId, setReportId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadSession()
  }, [sessionId])

  async function loadSession() {
    try {
      const res = await api.get(`/sessions/${sessionId}`)
      setQuestions(res.data.questions || [])
      // Find first unanswered question
      const unansweredIdx = (res.data.questions || []).findIndex((q: any) => !q.answered)
      if (unansweredIdx >= 0) {
        setCurrentIndex(unansweredIdx)
      } else {
        // All answered - need to complete
        setSessionComplete(true)
        if (res.data.status === 'completed') {
          // Already completed - go to report
          const reportRes = await api.get(`/reports/session/${sessionId}`)
          setReportId(reportRes.data.id)
        }
      }
    } catch (err) {
      setError('Failed to load session')
    } finally {
      setLoading(false)
    }
  }

  function formatTime(): string {
    const elapsed = Math.floor((Date.now() - startTime) / 1000)
    const mins = Math.floor(elapsed / 60)
    const secs = elapsed % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (answer.trim().length < 30) {
      setError('Answer must be at least 30 characters')
      return
    }

    setSubmitting(true)
    setError('')
    try {
      const currentQ = questions[currentIndex]
      const res = await api.post(`/sessions/${sessionId}/answer`, {
        question_id: currentQ.id,
        answer_text: answer,
      })

      if (res.data.session_complete) {
        setSessionComplete(true)
        // Complete the session
        const completeRes = await api.post(`/sessions/${sessionId}/complete`)
        setReportId(completeRes.data.report_id)
      } else {
        setCurrentIndex((prev) => prev + 1)
        setAnswer('')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit answer')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-display font-bold animate-pulse">Loading session...</div>
      </main>
    )
  }

  if (sessionComplete && reportId) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="neo-card text-center max-w-md rotate-[0.5deg]">
          <h1 className="text-3xl font-display font-bold mb-4">🎉 Session Complete!</h1>
          <p className="text-lg font-medium mb-6 text-nb-darkgray">
            Your answers have been scored. View your detailed report now.
          </p>
          <Link
            href={`/report/${reportId}`}
            className="neo-btn-primary text-xl px-10 py-4 inline-block"
          >
            View Report →
          </Link>
        </div>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-bold">No questions found in this session.</div>
      </main>
    )
  }

  const currentQ = questions[currentIndex]
  const progress = ((currentIndex) / questions.length) * 100

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/dashboard" className="text-nb-blue underline font-bold">
          ← Dashboard
        </Link>
        <span className="font-mono font-bold text-lg">{formatTime()}</span>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <span className="neo-badge bg-nb-blue text-white">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-4 border-3 border-nb-black bg-nb-white">
          <div
            className="h-full bg-nb-green border-r-3 border-nb-black transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="neo-card mb-6 rotate-[-0.3deg]">
        <div className="flex items-start gap-3 mb-4">
          {currentQ.difficulty && (
            <span
              className={`neo-badge text-xs ${
                currentQ.difficulty === 'hard'
                  ? 'bg-nb-pink text-white'
                  : currentQ.difficulty === 'medium'
                  ? 'bg-nb-orange text-white'
                  : 'bg-nb-green text-white'
              }`}
            >
              {currentQ.difficulty}
            </span>
          )}
          {currentQ.resume_anchor && (
            <span className="neo-badge bg-nb-yellow text-nb-black text-xs">
              Resume-based
            </span>
          )}
        </div>
        <h2 className="text-2xl font-display font-bold leading-relaxed">
          {currentQ.text}
        </h2>
      </div>

      {currentQ.resume_anchor && (
        <div className="neo-card bg-nb-gray mb-6 py-3 px-5 rotate-[0.2deg]">
          <span className="text-sm font-bold text-nb-darkgray">
            This question references: &ldquo;{currentQ.resume_anchor}&rdquo;
          </span>
        </div>
      )}

      {/* Answer input */}
      <form onSubmit={handleSubmit} className="neo-card rotate-[0.3deg]">
        <label className="neo-label">Your Answer</label>
        <textarea
          className="neo-input min-h-[180px] resize-y font-sans"
          placeholder="Type your answer here... Be specific. Include technical details, tradeoffs, and reasoning."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={submitting}
        />
        <p className="text-sm text-nb-darkgray font-medium mt-2 mb-4">
          {answer.length} characters (minimum 30)
        </p>

        {error && (
          <div className="bg-nb-pink text-white font-bold px-4 py-3 border-3 border-nb-black shadow-nb-sm mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || answer.trim().length < 30}
          className="neo-btn-green w-full text-lg py-3 disabled:opacity-50"
        >
          {submitting
            ? 'Submitting...'
            : currentIndex === questions.length - 1
            ? 'Submit Final Answer →'
            : 'Submit & Continue →'}
        </button>
      </form>
    </main>
  )
}
