'use client'

import { ReactNode } from 'react'

interface NeoCardProps {
  children: ReactNode
  className?: string
  color?: 'white' | 'gray'
  rotate?: string
}

export function NeoCard({
  children,
  className = '',
  color = 'white',
  rotate = '0',
}: NeoCardProps) {
  return (
    <div
      className={`border-3 border-nb-black shadow-nb p-6 ${
        color === 'gray' ? 'bg-nb-gray' : 'bg-nb-white'
      } ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  )
}
