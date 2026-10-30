import type { Config } from 'tailwindcss'
export default {
  darkMode: 'class', content: ['./src/**/*.{ts,tsx}'],
  theme: { extend: { colors: { navy: '#0b2545', deep: '#1e3a5f', teal: { DEFAULT: '#2f80c4', dark: '#0b4f7d' } }, borderColor: { DEFAULT: 'var(--line)' } } }, plugins: [],
} satisfies Config
