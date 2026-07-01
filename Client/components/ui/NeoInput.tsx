'use client'

import { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface NeoInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function NeoInput({ label, className = '', ...props }: NeoInputProps) {
  return (
    <div>
      {label && <label className="font-display font-bold text-lg block mb-2">{label}</label>}
      <input
        className={`w-full px-4 py-3 border-3 border-nb-black bg-nb-white
          text-nb-black font-sans text-base
          focus:outline-none focus:shadow-nb focus:translate-x-[1px] focus:translate-y-[1px]
          transition-all duration-100 ${className}`}
        {...props}
      />
    </div>
  )
}

interface NeoTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function NeoTextarea({ label, className = '', ...props }: NeoTextareaProps) {
  return (
    <div>
      {label && <label className="font-display font-bold text-lg block mb-2">{label}</label>}
      <textarea
        className={`w-full px-4 py-3 border-3 border-nb-black bg-nb-white
          text-nb-black font-sans text-base resize-y min-h-[120px]
          focus:outline-none focus:shadow-nb focus:translate-x-[1px] focus:translate-y-[1px]
          transition-all duration-100 ${className}`}
        {...props}
      />
    </div>
  )
}
