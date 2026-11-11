import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // Playwright owns tests/e2e; Vitest only runs the unit tests.
    include: ['tests/unit/**/*.test.js'],
  },
});
