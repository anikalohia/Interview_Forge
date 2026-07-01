'use client'

import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'

export default function Home() {
  const loggedIn = isAuthenticated()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center">
        <div className="inline-block neo-badge bg-nb-pink text-white text-sm mb-6 rotate-[-2deg]">
          AI-POWERED MOCK INTERVIEWS
        </div>

        <h1 className="text-6xl md:text-8xl font-display font-bold leading-tight mb-4">
          Interview
          <span className="bg-nb-black text-nb-white px-4 ml-2 inline-block rotate-[1deg]">
            Forge
          </span>
        </h1>

        <p className="text-xl md:text-2xl font-sans font-medium mb-2">
          Stop reading theory. Start <span className="bg-nb-pink px-2 rotate-[-1deg] inline-block">practicing</span>.
        </p>
        <p className="text-lg md:text-xl text-nb-darkgray font-medium mb-10 max-w-xl mx-auto">
          Upload your resume. Get grilled by AI on your own projects. Get a detailed scoring report with actionable feedback.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {loggedIn ? (
            <Link href="/dashboard" className="neo-btn-primary text-xl px-10 py-4">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/signup" className="neo-btn-primary text-xl px-10 py-4">
                Get Started Free
              </Link>
              <Link href="/login" className="neo-btn text-xl px-10 py-4">
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features grid */}
      <div className="max-w-5xl w-full mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="neo-card-colored bg-nb-pink text-white border-nb-black rotate-[-1deg]">
          <h3 className="text-2xl mb-3 text-nb-black">📄 Resume-Personalized</h3>
          <p className="text-nb-black font-medium">
            Every question is anchored to something you actually wrote on your resume. No generic question banks.
          </p>
        </div>
        <div className="neo-card-colored bg-nb-blue text-white border-nb-black rotate-[1deg]">
          <h3 className="text-2xl mb-3">🎯 Adaptive Scoring</h3>
          <p className="font-medium">
            5-dimension scoring with specific, actionable feedback. Know exactly where you stand.
          </p>
        </div>
        <div className="neo-card-colored bg-nb-green text-white border-nb-black rotate-[-0.5deg]">
          <h3 className="text-2xl mb-3">⚡ Real Pressure</h3>
          <p className="font-medium">
            Structured interview flow. No skipping. No going back. Just like the real thing.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-3xl w-full mt-20">
        <h2 className="text-4xl font-display font-bold text-center mb-10">
          How It <span className="bg-nb-black text-nb-white px-3">Works</span>
        </h2>

        <div className="space-y-6">
          {[
            { step: '01', title: 'Upload Resume', desc: 'Upload your resume (PDF or DOCX). Our AI parses it and extracts your skills, projects, and experience.' },
            { step: '02', title: 'Start Interview', desc: 'Choose Resume Round (questions on your projects) or Technical Round (role-specific questions).' },
            { step: '03', title: 'Answer Questions', desc: '8-10 questions, one at a time. No skipping. AI challenges you on your claims — just like a real interviewer.' },
            { step: '04', title: 'Get Your Report', desc: 'Detailed scoring across 5 dimensions with per-question feedback and a model answer. See your top 3 improvement areas.' },
          ].map((item) => (
            <div key={item.step} className="neo-card flex items-start gap-6">
              <span className="text-3xl font-display font-bold text-nb-blue min-w-[60px]">
                {item.step}
              </span>
              <div>
                <h3 className="text-xl font-display font-bold mb-1">{item.title}</h3>
                <p className="text-nb-darkgray font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-20 text-center text-nb-darkgray font-medium pb-8">
        <p>Built with 💪 for engineers who want to be prepared</p>
      </footer>
    </main>
  )
}
