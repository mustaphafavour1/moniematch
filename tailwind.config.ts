import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold:   '#948661',
        'gold-l': '#b5a882',
        amber:  '#E5A04A',
        terra:  '#B45A3C',
        ink:    '#1c1813',
        'ink-mid': '#26211A',
        'ink-2': '#2e2720',
        cream:  '#F7F1E8',
        'cream-d': '#ece5d8',
        snow:   '#fafaf8',
      },
      fontFamily: {
        sans: ['Host Grotesk', 'sans-serif'],
      },
      animation: {
        blink:  'blink 2s infinite',
        tick:   'tick 32s linear infinite',
        ringIn: 'ringIn 1.5s cubic-bezier(.16,1,.3,1) forwards',
        float:  'float 4s ease-in-out infinite',
        barA:   'barA 2s ease-in-out infinite alternate',
      },
      keyframes: {
        blink:  { '0%,100%': { opacity: '1', transform: 'scale(1)' }, '50%': { opacity: '.4', transform: 'scale(1.6)' } },
        tick:   { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        ringIn: { from: { strokeDashoffset: '188' } },
        float:  { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        barA:   { '0%': { opacity: '.4' }, '100%': { opacity: '.9' } },
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(.16,1,.3,1)',
        ease:   'cubic-bezier(.25,.46,.45,.94)',
      },
    },
  },
  plugins: [],
}
export default config
