'use client'

import { useState, KeyboardEvent } from 'react'

interface AnswerInputProps {
  onSubmit: (answer: string) => Promise<void>
  disabled?: boolean
  minLength?: number
}

export function AnswerInput({
  onSubmit,
  disabled = false,
  minLength = 30,
}: AnswerInputProps) {
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    const trimmed = answer.trim()
    if (trimmed.length < minLength) {
      setError(`Answer must be at least ${minLength} characters (${trimmed.length}/${minLength})`)
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await onSubmit(trimmed)
      setAnswer('')
    } catch (err) {
      setError('Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit()
    }
  }

  return (
    <div className="neo-card rotate-[0.3deg]">
      <label className="neo-label">Your Answer</label>
      <textarea
        className="neo-input min-h-[180px] resize-y"
        placeholder="Type your answer here... Be specific. Include technical details, tradeoffs, and reasoning."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled || submitting}
      />
      <p className="text-sm text-nb-darkgray font-medium mt-2 mb-3">
        {answer.length} / {minLength} min characters
        {answer.length >= minLength && ' ✅'}
      </p>

      {error && (
        <div className="bg-nb-pink text-white font-bold px-4 py-3 border-3 border-nb-black shadow-nb-sm mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={disabled || submitting || answer.trim().length < minLength}
        className="neo-btn-green w-full text-lg py-3 disabled:opacity-50"
      >
        {submitting ? 'Submitting...' : 'Submit Answer →'}
      </button>

      <p className="text-xs text-nb-darkgray font-medium mt-2 text-center">
        Press Ctrl+Enter to submit
      </p>
    </div>
  )
}
