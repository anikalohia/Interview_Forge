'use client'

import { QuestionFeedback as QF, DIMENSION_LABELS } from '@/types'

interface QuestionFeedbackProps {
  feedback: QF
  index: number
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-nb-green text-white'
  if (score >= 60) return 'bg-nb-yellow text-nb-black'
  if (score >= 40) return 'bg-nb-orange text-white'
  return 'bg-nb-pink text-white'
}

export function QuestionFeedbackCard({ feedback, index }: QuestionFeedbackProps) {
  return (
    <div className="neo-card">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="neo-badge bg-nb-black text-white">Q{index + 1}</span>
        {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
          <span
            key={key}
            className={`neo-badge text-xs ${getScoreColor((feedback.scores as any)[key] || 0)}`}
          >
            {label.split(' ')[0]}: {(feedback.scores as any)[key] || 0}
          </span>
        ))}
      </div>

      <div className="mb-3">
        <span className="text-sm font-bold text-nb-green block mb-1">✅ Strength</span>
        <p className="font-medium">{feedback.strength}</p>
      </div>

      <div className="mb-3">
        <span className="text-sm font-bold text-nb-pink block mb-1">⚠️ Weakness</span>
        <p className="font-medium">{feedback.weakness}</p>
      </div>

      <div>
        <span className="text-sm font-bold text-nb-blue block mb-1">💡 Model Answer</span>
        <div className="bg-nb-gray border-2 border-nb-black p-4">
          <p className="font-medium">{feedback.model_answer}</p>
        </div>
      </div>
    </div>
  )
}
