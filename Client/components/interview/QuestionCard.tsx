'use client'

import { InterviewQuestion } from '@/types'

interface QuestionCardProps {
  question: InterviewQuestion
  questionNumber: number
  totalQuestions: number
}

export function QuestionCard({ question, questionNumber, totalQuestions }: QuestionCardProps) {
  const difficultyColor =
    question.difficulty === 'hard'
      ? 'bg-nb-pink text-white'
      : question.difficulty === 'medium'
      ? 'bg-nb-orange text-white'
      : 'bg-nb-green text-white'

  return (
    <div className="neo-card rotate-[-0.3deg]">
      <div className="flex items-center gap-2 mb-4">
        <span className="neo-badge bg-nb-black text-white">
          Q{questionNumber}/{totalQuestions}
        </span>
        {question.difficulty && (
          <span className={`neo-badge text-xs ${difficultyColor}`}>
            {question.difficulty}
          </span>
        )}
        {question.resume_anchor && (
          <span className="neo-badge bg-nb-yellow text-nb-black text-xs">
            Resume-based
          </span>
        )}
      </div>
      <h2 className="text-2xl font-display font-bold leading-relaxed">
        {question.text}
      </h2>
    </div>
  )
}
