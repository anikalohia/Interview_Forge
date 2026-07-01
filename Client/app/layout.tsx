import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InterviewForge AI — Ace Your Interview',
  description: 'AI-powered adaptive mock interview platform that parses your resume and generates personalized questions.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-nb-yellow">
        {/* Sticky header decoration */}
        <div className="fixed top-0 left-0 w-full h-2 bg-nb-black z-50" />
        {children}
        <div className="fixed bottom-0 left-0 w-full h-2 bg-nb-black z-50" />
      </body>
    </html>
  )
}
