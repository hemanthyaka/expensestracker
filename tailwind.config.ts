import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        base:   '#07070e',
        canvas: '#0c0c17',
        card:   '#10101e',
        rim:    '#1c1c30',
        groove: '#252540',
        violet: '#8b5cf6',
        'violet-light': '#a78bfa',
        'violet-dim':   '#6d28d9',
        emerald: '#10b981',
        amber:   '#f59e0b',
        rose:    '#f43f5e',
        sky:     '#38bdf8',
        ink:     '#f1f5f9',
        'ink-2': '#94a3b8',
        'ink-3': '#64748b',
        'ink-4': '#3d4460',
      },
      fontFamily: {
        display: ['Lexend', 'sans-serif'],
        sans:    ['Lexend', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          from: { backgroundPosition: '200% 0' },
          to:   { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.4s ease forwards',
        'fade-up-1':  'fade-up 0.4s 0.05s ease forwards',
        'fade-up-2':  'fade-up 0.4s 0.10s ease forwards',
        'fade-up-3':  'fade-up 0.4s 0.15s ease forwards',
        'fade-up-4':  'fade-up 0.4s 0.20s ease forwards',
        shimmer:      'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}

export default config
