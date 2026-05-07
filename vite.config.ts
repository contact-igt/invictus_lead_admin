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
    rollupOptions: {
      output: {
        hoistTransitiveImports: false,
        manualChunks(id) {
          // x-date-pickers is in its own chunk — bundling it with emotion
          // core creates a three-way MUI→emotion→MUI cycle that Rollup
          // linearises in the wrong order, causing TDZ in production.
          if (id.includes('node_modules/@mui/x-date-pickers')) {
            return 'mui-pickers';
          }

          // emotion + MUI core stay together to avoid cross-chunk cycles.
          if (
            id.includes('node_modules/@emotion') ||
            id.includes('node_modules/@mui/material') ||
            id.includes('node_modules/@mui/system') ||
            id.includes('node_modules/@mui/base') ||
            id.includes('node_modules/@mui/utils') ||
            id.includes('node_modules/@mui/styled-engine') ||
            id.includes('node_modules/@mui/private-theming')
          ) {
            return 'mui-vendor';
          }

          if (id.includes('node_modules/@mui/x-data-grid')) {
            return 'mui-data-grid';
          }

          if (
            id.includes('node_modules/xlsx') ||
            id.includes('node_modules/file-saver')
          ) {
            return 'export-tools';
          }

          if (
            id.includes('node_modules/react-query') ||
            id.includes('node_modules/notistack')
          ) {
            return 'query-vendor';
          }

          if (id.includes('node_modules')) {
            return 'vendor';
          }

          return undefined;
        },
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
