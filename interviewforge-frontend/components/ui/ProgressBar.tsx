'use client'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  color?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = 'bg-nb-green',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100))

  return (
    <div>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="font-bold text-sm">{label}</span>}
          {showPercentage && (
            <span className="font-bold text-sm">{pct}%</span>
          )}
        </div>
      )}
      <div className="w-full h-4 border-3 border-nb-black bg-nb-white">
        <div
          className={`h-full ${color} border-r-3 border-nb-black transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
