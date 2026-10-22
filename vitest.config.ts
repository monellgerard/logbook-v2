import { defineConfig } from 'vitest/config'
import { loadEnv } from 'vite'
export default defineConfig(({ mode }) => ({ test: { env: loadEnv(mode, process.cwd(), ''), include: ['tests/**/*.test.ts'], testTimeout: 30000, hookTimeout: 90000 } }))
