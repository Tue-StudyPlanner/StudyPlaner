import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      // Single source of truth for shared data: the repo's backend folder.
      '@data': fileURLToPath(new URL('../backend/data', import.meta.url)),
    },
  },
  server: {
    fs: {
      // Allow serving files from outside the frontend root (see @data alias).
      allow: ['..'],
    },
  },
})
