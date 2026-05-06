import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/xlsx') || id.includes('node_modules/file-saver')) {
            return 'export-tools';
          }
          if (id.includes('node_modules/@mui/x-data-grid')) {
            return 'mui-data-grid';
          }
          if (id.includes('node_modules/@mui')) {
            return 'mui-core';
          }
          if (id.includes('node_modules/@emotion')) {
            return 'emotion-vendor';
          }
          if (id.includes('node_modules/react-query') || id.includes('node_modules/notistack')) {
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
