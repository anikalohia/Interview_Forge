'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { setTokens, setUser } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      setTokens(res.data.access_token, res.data.refresh_token)
      setUser({ id: res.data.user_id, name: res.data.name, email: res.data.email })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-display font-bold hover:underline">
            InterviewForge
          </Link>
        </div>

        <div className="neo-card rotate-[-0.5deg]">
          <h1 className="text-3xl font-display font-bold mb-6">Sign In</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="neo-label">Email</label>
              <input
                type="email"
                className="neo-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="neo-label">Password</label>
              <input
                type="password"
                className="neo-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="bg-nb-pink text-white font-bold px-4 py-3 border-3 border-nb-black shadow-nb-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="neo-btn-primary w-full text-xl py-4 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <p className="mt-6 text-center font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-nb-blue underline font-bold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
