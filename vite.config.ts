import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow the dev/preview server to be reached through a public tunnel so the
  // site can be viewed in the user's own browser (which can't reach the VM's
  // localhost directly).
  server: { host: true, allowedHosts: true },
  preview: { host: true, allowedHosts: true },
})
