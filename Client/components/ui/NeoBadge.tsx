'use client'

import { ReactNode } from 'react'

interface NeoBadgeProps {
  children: ReactNode
  variant?: 'default' | 'yellow' | 'blue' | 'green' | 'pink'
  className?: string
}

const variants = {
  default: 'bg-nb-gray text-nb-black',
  yellow: 'bg-nb-yellow text-nb-black',
  blue: 'bg-nb-blue text-white',
  green: 'bg-nb-green text-white',
  pink: 'bg-nb-pink text-white',
}

export function NeoBadge({
  children,
  variant = 'default',
  className = '',
}: NeoBadgeProps) {
  return (
    <span
      className={`inline-block px-3 py-1 text-sm font-bold border-2 border-nb-black shadow-nb-sm ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
