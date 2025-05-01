import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  server: {
    host: true,
    port: 8080,
    allowedHosts: ['listify.digital', 'www.listify.digital'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  esbuild: {
    loader: 'tsx',
    include: /\.[jt]sx?$/,
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
      },
    },
    // Exclude backend-only modules from optimization
    exclude: ['winston', '@colors/colors', 'logform', 'triple-beam', 'winston-transport'],
  },
  build: {
    rollupOptions: {
      // Explicitly mark backend-only modules as external during build
      external: ['winston', '@colors/colors', 'logform', 'triple-beam', 'winston-transport', 'fs', 'path', 'os'],
    },
  },
})