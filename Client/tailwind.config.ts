import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        nb: {
          black: '#1a1a1a',
          white: '#fefefe',
          yellow: '#ffd803',
          pink: '#ff6b6b',
          blue: '#3b82f6',
          green: '#10b981',
          orange: '#f97316',
          purple: '#8b5cf6',
          red: '#ef4444',
          gray: '#f0f0f0',
          darkgray: '#888888',
        },
      },
      boxShadow: {
        nb: '4px 4px 0px 0px #1a1a1a',
        'nb-sm': '3px 3px 0px 0px #1a1a1a',
        'nb-lg': '6px 6px 0px 0px #1a1a1a',
        'nb-hover': '6px 6px 0px 0px #1a1a1a',
        'nb-colored': '4px 4px 0px 0px #ff6b6b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      borderWidth: {
        '3': '3px',
      },
      rotate: {
        '-2': '-2deg',
        '2': '2deg',
        '-1': '-1deg',
        '1': '1deg',
      },
    },
  },
  plugins: [],
}

export default config
