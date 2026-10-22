import type { Config } from 'tailwindcss'
export default { content: ['./src/**/*.{ts,tsx}'], theme: { extend: { colors: { navy: '#0a1f3d', deep: '#0b3d6b', teal: { DEFAULT: '#14b8c4', dark: '#0e8f99' } } } }, plugins: [] } satisfies Config
