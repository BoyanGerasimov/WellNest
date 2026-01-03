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
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'chart.js', 'react-chartjs-2'],
    force: false, // Don't force re-optimization
  },
  build: {
    // Optimize build output
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['chart.js', 'react-chartjs-2'],
          'utils': ['axios'],
        },
      },
    },
    // Enable minification (using esbuild - faster and included with Vite)
    minify: 'esbuild',
    // Note: esbuild doesn't support drop_console, but it's faster
    // For production, you can use terser if you need drop_console
    // Source maps for production (optional, can disable for smaller builds)
    sourcemap: false,
    // Optimize asset handling
    assetsInlineLimit: 4096, // Inline small assets (< 4kb)
  },
})

