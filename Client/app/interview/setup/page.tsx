'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'
import { ResumeData } from '@/types'

export default function InterviewSetupPage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [selectedResumeId, setSelectedResumeId] = useState('')
  const [mode, setMode] = useState<'resume_round' | 'technical_round'>('resume_round')
  const [loading, setLoading] = useState(true)
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    api.get('/resumes/').then((res) => {
      setResumes(res.data.resumes || [])
      if (res.data.resumes?.length > 0) {
        setSelectedResumeId(res.data.resumes[0].resume_id)
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function startInterview() {
    if (!selectedResumeId) {
      setError('Please upload a resume first')
      return
    }
    setStarting(true)
    setError('')
    try {
      const res = await api.post('/sessions/start', {
        resume_id: selectedResumeId,
        mode,
      })
      router.push(`/interview/${res.data.session_id}`)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start session')
      setStarting(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-display font-bold animate-pulse">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link href="/dashboard" className="text-nb-blue underline font-bold text-lg">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="neo-card rotate-[-0.5deg]">
        <h1 className="text-4xl font-display font-bold mb-2">
          Start Interview
        </h1>
        <p className="text-nb-darkgray font-medium mb-8">
          Configure your interview session
        </p>

        <div className="space-y-6">
          {/* Resume selection */}
          <div>
            <label className="neo-label">Select Resume</label>
            {resumes.length === 0 ? (
              <div className="bg-nb-pink text-white font-bold px-4 py-3 border-3 border-nb-black shadow-nb-sm">
                No resumes found. Upload one from the dashboard first.
              </div>
            ) : (
              <select
                className="neo-input"
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
              >
                {resumes.map((r) => (
                  <option key={r.resume_id} value={r.resume_id}>
                    {r.parsed_data.name || 'Resume'} — {r.parsed_data.skills?.length || 0} skills
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Mode selection */}
          <div>
            <label className="neo-label">Interview Mode</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMode('resume_round')}
                className={`neo-card text-center p-6 cursor-pointer transition-all ${
                  mode === 'resume_round'
                    ? 'bg-nb-blue text-white border-nb-black shadow-nb-lg'
                    : 'hover:shadow-nb'
                }`}
              >
                <h3 className="text-xl font-display font-bold mb-1">Resume Round</h3>
                <p className="text-sm font-medium">
                  Questions anchored to your project claims
                </p>
              </button>
              <button
                onClick={() => setMode('technical_round')}
                className={`neo-card text-center p-6 cursor-pointer transition-all ${
                  mode === 'technical_round'
                    ? 'bg-nb-green text-white border-nb-black shadow-nb-lg'
                    : 'hover:shadow-nb'
                }`}
              >
                <h3 className="text-xl font-display font-bold mb-1">Technical Round</h3>
                <p className="text-sm font-medium">
                  Role-specific technical questions
                </p>
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-nb-pink text-white font-bold px-4 py-3 border-3 border-nb-black shadow-nb-sm">
              {error}
            </div>
          )}

          <button
            onClick={startInterview}
            disabled={starting || resumes.length === 0}
            className="neo-btn-primary w-full text-xl py-4 disabled:opacity-50"
          >
            {starting ? 'Generating Questions...' : 'Start Interview →'}
          </button>
        </div>
      </div>
    </main>
  )
}
