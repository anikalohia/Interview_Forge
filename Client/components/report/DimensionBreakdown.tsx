'use client'

import { DIMENSION_LABELS, DIMENSION_COLORS } from '@/types'

interface DimensionBreakdownProps {
  dimensionScores: Record<string, number>
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-nb-green text-white'
  if (score >= 60) return 'bg-nb-yellow text-nb-black'
  if (score >= 40) return 'bg-nb-orange text-white'
  return 'bg-nb-pink text-white'
}

export function DimensionBreakdown({ dimensionScores }: DimensionBreakdownProps) {
  return (
    <div>
      <h2 className="text-3xl font-display font-bold mb-4">
        Score <span className="bg-nb-black text-nb-white px-2">Breakdown</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
          const score = dimensionScores[key] || 0
          const color = DIMENSION_COLORS[key] || 'bg-nb-blue'
          return (
            <div key={key} className="neo-card">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold">{label}</h3>
                <span className={`neo-badge text-lg ${getScoreColor(score)}`}>
                  {score}
                </span>
              </div>
              <div className="w-full h-3 border-3 border-nb-black bg-nb-gray">
                <div
                  className={`h-full ${color} border-r-3 border-nb-black transition-all duration-500`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
