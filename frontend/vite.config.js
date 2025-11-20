import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    open: true,
    host: true,
    watch: {
      // Reduce file watching overhead
      usePolling: false,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
  optimizeDeps: {
    // Pre-bundle dependencies for faster startup
    include: ['react', 'react-dom', 'react-router-dom', 'axios'],
    force: false, // Don't force re-optimization
  },
  build: {
    // Reduce build overhead
    chunkSizeWarningLimit: 1000,
  },
})

