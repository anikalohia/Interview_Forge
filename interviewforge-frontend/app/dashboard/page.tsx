'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { getUser, clearAuth, isAuthenticated } from '@/lib/auth'
import { SessionListItem, ResumeData } from '@/types'

export default function DashboardPage() {
  const router = useRouter()
  const user = getUser()
  const [resumes, setResumes] = useState<ResumeData[]>([])
  const [sessions, setSessions] = useState<SessionListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [resRes, sessRes] = await Promise.all([
        api.get('/resumes/'),
        api.get('/sessions/'),
      ])
      setResumes(resRes.data.resumes || [])
      setSessions(sessRes.data.sessions || [])
    } catch (err) {
      console.error('Failed to load data', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadError('')
    const formData = new FormData()
    formData.append('file', file)

    try {
      await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setShowUpload(false)
      loadData()
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleLogout() {
    clearAuth()
    router.push('/')
  }

  function getModeLabel(mode: string) {
    return mode === 'resume_round' ? 'Resume Round' : 'Technical Round'
  }

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      active: 'bg-nb-yellow text-nb-black',
      completed: 'bg-nb-green text-white',
      abandoned: 'bg-nb-pink text-white',
    }
    return (
      <span className={`neo-badge ${colors[status] || 'bg-nb-gray text-nb-black'}`}>
        {status}
      </span>
    )
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-display font-bold animate-pulse">
          Loading...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/" className="text-2xl font-display font-bold">
          InterviewForge
        </Link>
        <div className="flex items-center gap-4">
          <span className="font-bold hidden sm:block">Hi, {user?.name}</span>
          <button onClick={handleLogout} className="neo-btn-small bg-nb-pink text-white">
            Logout
          </button>
        </div>
      </div>

      <div className="neo-divider" />

      {/* Resume section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-display font-bold">
            Your <span className="bg-nb-black text-nb-white px-2">Resumes</span>
          </h2>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="neo-btn-small bg-nb-blue text-white"
          >
            + Upload New
          </button>
        </div>

        {showUpload && (
          <div className="neo-card mb-6 bg-nb-gray">
            <h3 className="text-xl font-display font-bold mb-3">Upload Resume</h3>
            <p className="text-nb-darkgray font-medium mb-3">
              PDF or DOCX, max 5MB
            </p>
            <input
              type="file"
              accept=".pdf,.docx"
              onChange={handleUpload}
              className="block w-full text-sm font-medium mb-3"
              disabled={uploading}
            />
            {uploading && <p className="font-bold text-nb-blue">Parsing resume...</p>}
            {uploadError && (
              <div className="bg-nb-pink text-white font-bold px-3 py-2 border-3 border-nb-black shadow-nb-sm mt-2">
                {uploadError}
              </div>
            )}
          </div>
        )}

        {resumes.length === 0 ? (
          <div className="neo-card text-center py-10">
            <p className="text-xl font-bold mb-2">No resumes yet</p>
            <p className="text-nb-darkgray font-medium">
              Upload your resume to get started with personalized interviews
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resumes.map((r) => (
              <div key={r.resume_id} className="neo-card">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-display font-bold">
                    {r.parsed_data.name || 'Resume'}
                  </h3>
                  <span className="neo-badge bg-nb-green text-white text-xs">
                    {r.parsed_data.skills?.length || 0} skills
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {(r.parsed_data.skills || []).slice(0, 5).map((s: string) => (
                    <span key={s} className="neo-tag text-xs py-0.5">
                      {s}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-nb-darkgray font-medium">
                  Uploaded {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sessions section */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-3xl font-display font-bold">
            Interview <span className="bg-nb-black text-nb-white px-2">History</span>
          </h2>
          <Link
            href={resumes.length > 0 ? '/interview/setup' : '#'}
            className={`neo-btn bg-nb-yellow text-nb-black ${resumes.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}
          >
            + New Interview
          </Link>
        </div>

        {resumes.length === 0 && (
          <p className="text-nb-darkgray font-medium mb-4">
            Upload a resume first to start an interview
          </p>
        )}

        {sessions.length === 0 ? (
          <div className="neo-card text-center py-10">
            <p className="text-xl font-bold mb-2">No sessions yet</p>
            <p className="text-nb-darkgray font-medium">
              Start your first mock interview session
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="neo-card flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-display font-bold text-lg">
                      {getModeLabel(s.mode)}
                    </h3>
                    {s.status === 'completed' && s.has_report && (
                      <Link
                        href={`/report/session/${s.id}`}
                        className="text-sm text-nb-blue underline font-bold"
                      >
                        View Report
                      </Link>
                    )}
                    {getStatusBadge(s.status)}
                  </div>
                  <p className="text-sm text-nb-darkgray font-medium">
                    {s.started_at
                      ? new Date(s.started_at).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : ''}
                  </p>
                </div>
                {s.status === 'active' && (
                  <Link
                    href={`/interview/${s.id}`}
                    className="neo-btn-small bg-nb-green text-white"
                  >
                    Continue
                  </Link>
                )}
                {s.status === 'completed' && s.has_report && (
                  <Link
                    href={`/report/session/${s.id}`}
                    className="neo-btn-small bg-nb-blue text-white"
                  >
                    Report
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
