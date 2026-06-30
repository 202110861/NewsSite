import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// @ts-expect-error — Vite build plugin (plain ESM, no types)
import prerenderOgPlugin from './scripts/prerender-og-plugin.mjs'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), prerenderOgPlugin()],
  server: {
    watch: {
      usePolling: true,
    },
  },
})
