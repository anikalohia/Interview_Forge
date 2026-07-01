'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { Report, DIMENSION_LABELS, DIMENSION_COLORS } from '@/types'

export default function ReportPage() {
  const router = useRouter()
  const params = useParams()
  const reportId = params.reportId as string
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadReport()
  }, [reportId])

  async function loadReport() {
    try {
      const res = await api.get(`/reports/${reportId}`)
      setReport(res.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load report')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-display font-bold animate-pulse">Loading report...</div>
      </main>
    )
  }

  if (error || !report) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="neo-card text-center">
          <h1 className="text-2xl font-bold mb-4">Report not found</h1>
          <p className="text-nb-darkgray mb-4">{error || 'Could not load report'}</p>
          <Link href="/dashboard" className="neo-btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </main>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-nb-green text-white'
    if (score >= 60) return 'bg-nb-yellow text-nb-black'
    if (score >= 40) return 'bg-nb-orange text-white'
    return 'bg-nb-pink text-white'
  }

  return (
    <main className="min-h-screen px-4 py-8 max-4xl mx-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-nb-blue underline font-bold text-lg">
            ← Dashboard
          </Link>
        </div>

        {/* Overall score hero */}
        <div className="neo-card text-center mb-8 rotate-[-0.5deg]">
          <p className="text-sm font-bold text-nb-darkgray mb-2 uppercase tracking-wide">
            Overall Score
          </p>
          <div className="text-8xl font-display font-bold mb-2">
            <span className={`inline-block px-6 py-2 border-3 border-nb-black shadow-nb-lg ${getScoreColor(report.overall_score)}`}>
              {report.overall_score}
            </span>
          </div>
          <p className="text-lg font-medium text-nb-darkgray">
            out of 100
          </p>
        </div>

        {/* Dimension breakdown */}
        <div className="mb-8">
          <h2 className="text-3xl font-display font-bold mb-4">
            Score <span className="bg-nb-black text-nb-white px-2">Breakdown</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(DIMENSION_LABELS).map(([key, label]) => {
              const score = (report.dimension_scores as any)[key] || 0
              const colorClass = DIMENSION_COLORS[key] || 'bg-nb-blue'
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
                      className={`h-full ${colorClass} border-r-3 border-nb-black transition-all duration-500`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="neo-card mb-8 rotate-[0.3deg] bg-nb-gray">
          <h2 className="text-2xl font-display font-bold mb-3">
            Top Improvement Areas
          </h2>
          <p className="text-lg font-medium leading-relaxed">{report.summary}</p>
        </div>

        {/* Per-question feedback */}
        <div className="mb-10">
          <h2 className="text-3xl font-display font-bold mb-4">
            Question <span className="bg-nb-black text-nb-white px-2">Feedback</span>
          </h2>
          <div className="space-y-6">
            {(report.question_feedback || []).map((qf, idx) => (
              <div key={qf.question_id} className="neo-card rotate-[(idx % 2 === 0 ? '-0.3' : '0.3') + 'deg']">
                <div className="flex items-center gap-2 mb-3">
                  <span className="neo-badge bg-nb-black text-white">
                    Q{idx + 1}
                  </span>
                  <span className="text-sm font-bold text-nb-darkgray">
                    Scores:
                  </span>
                  {Object.entries(DIMENSION_LABELS).map(([key, label]) => (
                    <span
                      key={key}
                      className={`neo-badge text-xs ${getScoreColor((qf.scores as any)[key] || 0)}`}
                      title={label}
                    >
                      {label.split(' ')[0]}: {(qf.scores as any)[key] || 0}
                    </span>
                  ))}
                </div>

                <div className="mb-3">
                  <span className="text-sm font-bold text-nb-green block mb-1">✅ Strength</span>
                  <p className="font-medium">{qf.strength}</p>
                </div>

                <div className="mb-3">
                  <span className="text-sm font-bold text-nb-pink block mb-1">⚠️ Weakness</span>
                  <p className="font-medium">{qf.weakness}</p>
                </div>

                <div>
                  <span className="text-sm font-bold text-nb-blue block mb-1">💡 Model Answer</span>
                  <div className="bg-nb-gray border-2 border-nb-black p-4">
                    <p className="font-medium">{qf.model_answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center mb-12">
          <Link href="/dashboard" className="neo-btn-primary text-lg px-8">
            Back to Dashboard
          </Link>
          <Link href="/interview/setup" className="neo-btn text-lg px-8">
            Take Another Interview
          </Link>
        </div>
      </div>
    </main>
  )
}
