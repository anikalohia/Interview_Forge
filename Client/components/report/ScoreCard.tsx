'use client'

interface ScoreCardProps {
  score: number
  label?: string
  size?: 'sm' | 'lg'
}

function getScoreColor(score: number) {
  if (score >= 80) return 'bg-nb-green text-white'
  if (score >= 60) return 'bg-nb-yellow text-nb-black'
  if (score >= 40) return 'bg-nb-orange text-white'
  return 'bg-nb-pink text-white'
}

export function ScoreCard({ score, label, size = 'sm' }: ScoreCardProps) {
  const color = getScoreColor(score)
  const textSize = size === 'lg' ? 'text-6xl' : 'text-3xl'
  const padding = size === 'lg' ? 'px-8 py-4' : 'px-4 py-2'

  return (
    <div className="text-center">
      {label && (
        <p className="text-sm font-bold text-nb-darkgray mb-1 uppercase tracking-wide">
          {label}
        </p>
      )}
      <span
        className={`inline-block font-display font-bold border-3 border-nb-black shadow-nb ${color} ${textSize} ${padding}`}
      >
        {score}
      </span>
      {size === 'lg' && <p className="text-lg font-medium text-nb-darkgray mt-1">out of 100</p>}
    </div>
  )
}
