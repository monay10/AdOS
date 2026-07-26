import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// AdOS corporate website — static build, no backend.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssMinify: true,
  },
});
