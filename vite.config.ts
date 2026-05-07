import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],

  // Force emotion + MUI to be pre-bundled together so their
  // initialization order is deterministic in both dev and prod.
  optimizeDeps: {
    include: [
      '@emotion/react',
      '@emotion/styled',
      '@mui/material',
      '@mui/material/styles',
      '@mui/x-date-pickers',
    ],
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // @emotion and all @mui/* (except x-data-grid) must live in the
          // same chunk. Splitting them apart creates cross-chunk circular
          // references that Rollup resolves in the wrong order, causing the
          // "Cannot access 'x' before initialization" TDZ error in production.
          if (
            id.includes('node_modules/@emotion') ||
            id.includes('node_modules/@mui/material') ||
            id.includes('node_modules/@mui/system') ||
            id.includes('node_modules/@mui/base') ||
            id.includes('node_modules/@mui/utils') ||
            id.includes('node_modules/@mui/styled-engine') ||
            id.includes('node_modules/@mui/private-theming') ||
            id.includes('node_modules/@mui/x-date-pickers')
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
