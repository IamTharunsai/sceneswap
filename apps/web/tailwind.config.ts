import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Brand accent
        lime: {
          DEFAULT: '#C8FF00',
          dark:    '#9DCC00',
          '3':  'rgba(200,255,0,0.03)',
          '5':  'rgba(200,255,0,0.05)',
          '10': 'rgba(200,255,0,0.1)',
          '20': 'rgba(200,255,0,0.2)',
          '30': 'rgba(200,255,0,0.3)',
        },
        violet: {
          DEFAULT: '#7C3AED',
          light:   '#A78BFA',
          '10': 'rgba(124,58,237,0.1)',
          '20': 'rgba(124,58,237,0.2)',
        },
        cyan: {
          DEFAULT: '#00D9FF',
          '10': 'rgba(0,217,255,0.1)',
          '20': 'rgba(0,217,255,0.2)',
        },
        // Surfaces — aurora violet-tinted dark
        'surface-1': '#0D0829',
        'surface-2': '#110E30',
        'surface-3': '#17144A',
        // Text
        'text-primary':   '#F0EEFF',
        'text-secondary': '#A8A8CC',
        'text-muted':     '#6A6A9A',
        // Border
        'border': 'rgba(255,255,255,0.08)',
        // Semantic
        'success': '#22C55E',
        'warning': '#F59E0B',
        'error':   '#EF4444',
      },
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        dm:   ['DM Sans', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      fontSize: {
        hero:      ['80px', { lineHeight: '1.03', fontWeight: '800', letterSpacing: '-0.03em' }],
        h1:        ['52px', { lineHeight: '1.08', fontWeight: '700' }],
        h2:        ['36px', { lineHeight: '1.2',  fontWeight: '600' }],
        h3:        ['22px', { lineHeight: '1.3',  fontWeight: '600' }],
        metric:    ['44px', { lineHeight: '1',    fontWeight: '700' }],
        'metric-sm': ['22px', { lineHeight: '1', fontWeight: '700' }],
      },
      borderRadius: {
        DEFAULT: '14px',
        sm: '8px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        lime:    '0 0 30px rgba(200,255,0,0.25), 0 0 60px rgba(200,255,0,0.1)',
        violet:  '0 0 30px rgba(124,58,237,0.35), 0 0 60px rgba(124,58,237,0.15)',
        cyan:    '0 0 30px rgba(0,217,255,0.25)',
        card:    '0 4px 24px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'gradient-lime-violet': 'linear-gradient(135deg, #C8FF00 0%, #7C3AED 100%)',
        'gradient-aurora':      'linear-gradient(135deg, #7C3AED 0%, #00D9FF 50%, #C8FF00 100%)',
        'gradient-radial':      'radial-gradient(var(--tw-gradient-stops))',
      },
      animation: {
        'aurora':      'aurora-drift 18s ease-in-out infinite alternate',
        'float':       'float 6s ease-in-out infinite',
        'pulse-lime':  'pulse-lime 2.5s ease-in-out infinite',
        'fade-in':     'fade-in 0.4s cubic-bezier(0.16,1,0.3,1) forwards',
        'blob':        'blob-drift 10s ease-in-out infinite',
        'shimmer':     'shimmer 1.4s ease infinite',
        'spin-slow':   'spin 8s linear infinite',
      },
      keyframes: {
        'aurora-drift': {
          '0%':   { transform: 'translate(0,0) scale(1)' },
          '33%':  { transform: 'translate(4%,3%) scale(1.04)' },
          '66%':  { transform: 'translate(-3%,5%) scale(0.97)' },
          '100%': { transform: 'translate(2%,-4%) scale(1.02)' },
        },
        'float': {
          '0%,100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%':     { transform: 'translateY(-12px) rotate(1deg)' },
          '66%':     { transform: 'translateY(-6px) rotate(-1deg)' },
        },
        'pulse-lime': {
          '0%,100%': { boxShadow: '0 0 10px rgba(200,255,0,0.15)' },
          '50%':     { boxShadow: '0 0 30px rgba(200,255,0,0.4), 0 0 60px rgba(200,255,0,0.15)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'blob-drift': {
          '0%,100%': { transform: 'translate(0,0) scale(1)' },
          '33%':     { transform: 'translate(24px,-24px) scale(1.08)' },
          '66%':     { transform: 'translate(-18px,18px) scale(0.94)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
