'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { setTokens, setUser } from '@/lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [expLevel, setExpLevel] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/auth/signup', {
        name,
        email,
        password,
        target_role: targetRole,
        experience_level: expLevel,
      })
      setTokens(res.data.access_token, res.data.refresh_token)
      setUser({ id: res.data.user_id, name: res.data.name, email: res.data.email })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-display font-bold hover:underline">
            InterviewForge
          </Link>
        </div>

        <div className="neo-card rotate-[0.5deg]">
          <h1 className="text-3xl font-display font-bold mb-2">Create Account</h1>
          <p className="text-nb-darkgray font-medium mb-6">
            Get started with personalized mock interviews
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="neo-label">Name *</label>
              <input
                type="text"
                className="neo-input"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="neo-label">Email *</label>
              <input
                type="email"
                className="neo-input"
                placeholder="priya@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="neo-label">Password *</label>
              <input
                type="password"
                className="neo-input"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="neo-label">Target Role</label>
              <select
                className="neo-input"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="">Select your target role</option>
                <option value="SDE">SDE / Software Engineer</option>
                <option value="Full-Stack">Full-Stack Developer</option>
                <option value="Frontend">Frontend Engineer</option>
                <option value="AI/ML">AI / ML Engineer</option>
                <option value="Python">Python Developer</option>
                <option value="DevOps">DevOps Engineer</option>
              </select>
            </div>

            <div>
              <label className="neo-label">Experience Level</label>
              <select
                className="neo-input"
                value={expLevel}
                onChange={(e) => setExpLevel(e.target.value)}
              >
                <option value="">Select experience level</option>
                <option value="fresher">Fresher / Student</option>
                <option value="junior">Junior (1-2 years)</option>
                <option value="mid">Mid (3-5 years)</option>
              </select>
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
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p className="mt-6 text-center font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-nb-blue underline font-bold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
