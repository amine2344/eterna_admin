import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000, // Set your preferred port
    proxy: {
      '/api': 'http://eterna.life.app:4000/api', // Example API proxy
    },
  },
  build: {
    outDir: 'dist', // Output directory
  },
  resolve: {
    alias: {
      '@': '/src', // Set alias for src
    },
  },
});
