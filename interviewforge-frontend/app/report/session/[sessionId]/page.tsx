'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import api from '@/lib/api'
import { isAuthenticated } from '@/lib/auth'

export default function ReportBySessionPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  const [reportId, setReportId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
      return
    }
    api.get(`/reports/session/${sessionId}`)
      .then((res) => setReportId(res.data.id))
      .catch(() => router.push('/dashboard'))
      .finally(() => setLoading(false))
  }, [sessionId])

  useEffect(() => {
    if (reportId) {
      router.replace(`/report/${reportId}`)
    }
  }, [reportId])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-display font-bold animate-pulse">Loading...</div>
      </main>
    )
  }

  return null
}
