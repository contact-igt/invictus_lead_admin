import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  resolve: {
    // Force single instances of emotion so MUI's internal circular deps
    // don't create duplicate module graphs that trigger TDZ crashes.
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },

  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@emotion/cache',
      '@mui/material',
      '@mui/material/styles',
      '@mui/system',
      '@mui/base',
      '@mui/utils',
      '@mui/styled-engine',
      '@mui/private-theming',
      '@mui/x-date-pickers',
    ],
  },

  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        // No manualChunks — letting Rollup resolve dependency order
        // automatically prevents circular chunk references that cause
        // "Cannot access 'X' before initialization" TDZ errors in production.
      },
    },
  },

  server: {
    host: '0.0.0.0',
    port: 4000,
  },

  preview: {
    port: 5000,
  },

  base: '/',
});
