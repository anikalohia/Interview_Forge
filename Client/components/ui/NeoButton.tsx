'use client'

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface NeoButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'green'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variants = {
  default: 'bg-nb-white text-nb-black',
  primary: 'bg-nb-blue text-nb-white',
  secondary: 'bg-nb-pink text-nb-white',
  green: 'bg-nb-green text-nb-white',
}

const sizes = {
  sm: 'px-4 py-2 text-base neo-btn-small',
  md: 'px-6 py-3 text-lg neo-btn',
  lg: 'px-10 py-4 text-xl neo-btn',
}

export function NeoButton({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: NeoButtonProps) {
  return (
    <button
      className={`font-bold border-3 border-nb-black shadow-nb 
        hover:shadow-nb-hover hover:translate-x-[2px] hover:translate-y-[2px]
        transition-all duration-100 active:translate-x-[4px] active:translate-y-[4px]
        active:shadow-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
