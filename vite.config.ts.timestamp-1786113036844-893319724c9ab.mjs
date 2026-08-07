// vite.config.ts
import { defineConfig } from "file:///C:/Invictus_Projects/invictus-admin-panel/invictus_lead_admin/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Invictus_Projects/invictus-admin-panel/invictus_lead_admin/node_modules/@vitejs/plugin-react-swc/index.mjs";
import tsconfigPaths from "file:///C:/Invictus_Projects/invictus-admin-panel/invictus_lead_admin/node_modules/vite-tsconfig-paths/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    dedupe: ["react", "react-dom", "@emotion/react", "@emotion/styled"]
  },
  optimizeDeps: {
    include: [
      "@emotion/react",
      "@emotion/styled",
      "@emotion/cache",
      "@mui/material",
      "@mui/material/styles",
      "@mui/system",
      "@mui/base",
      "@mui/utils",
      "@mui/styled-engine",
      "@mui/private-theming",
      "@mui/x-date-pickers"
    ]
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        // No manualChunks — letting Rollup resolve dependency order
        // automatically prevents circular chunk references that cause
        // "Cannot access 'X' before initialization" TDZ errors in production.
      }
    }
  },
  server: {
    host: "0.0.0.0",
    port: 4e3
  },
  preview: {
    port: 5e3
  },
  base: "/"
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxJbnZpY3R1c19Qcm9qZWN0c1xcXFxpbnZpY3R1cy1hZG1pbi1wYW5lbFxcXFxpbnZpY3R1c19sZWFkX2FkbWluXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxJbnZpY3R1c19Qcm9qZWN0c1xcXFxpbnZpY3R1cy1hZG1pbi1wYW5lbFxcXFxpbnZpY3R1c19sZWFkX2FkbWluXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9JbnZpY3R1c19Qcm9qZWN0cy9pbnZpY3R1cy1hZG1pbi1wYW5lbC9pbnZpY3R1c19sZWFkX2FkbWluL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2MnO1xyXG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcGx1Z2luczogW3JlYWN0KCksIHRzY29uZmlnUGF0aHMoKV0sXHJcblxyXG4gIHJlc29sdmU6IHtcclxuICAgIGRlZHVwZTogWydyZWFjdCcsICdyZWFjdC1kb20nLCAnQGVtb3Rpb24vcmVhY3QnLCAnQGVtb3Rpb24vc3R5bGVkJ10sXHJcbiAgfSxcclxuXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbXHJcbiAgICAgICdAZW1vdGlvbi9yZWFjdCcsXHJcbiAgICAgICdAZW1vdGlvbi9zdHlsZWQnLFxyXG4gICAgICAnQGVtb3Rpb24vY2FjaGUnLFxyXG4gICAgICAnQG11aS9tYXRlcmlhbCcsXHJcbiAgICAgICdAbXVpL21hdGVyaWFsL3N0eWxlcycsXHJcbiAgICAgICdAbXVpL3N5c3RlbScsXHJcbiAgICAgICdAbXVpL2Jhc2UnLFxyXG4gICAgICAnQG11aS91dGlscycsXHJcbiAgICAgICdAbXVpL3N0eWxlZC1lbmdpbmUnLFxyXG4gICAgICAnQG11aS9wcml2YXRlLXRoZW1pbmcnLFxyXG4gICAgICAnQG11aS94LWRhdGUtcGlja2VycycsXHJcbiAgICBdLFxyXG4gIH0sXHJcblxyXG4gIGJ1aWxkOiB7XHJcbiAgICBzb3VyY2VtYXA6IGZhbHNlLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICAvLyBObyBtYW51YWxDaHVua3MgXHUyMDE0IGxldHRpbmcgUm9sbHVwIHJlc29sdmUgZGVwZW5kZW5jeSBvcmRlclxyXG4gICAgICAgIC8vIGF1dG9tYXRpY2FsbHkgcHJldmVudHMgY2lyY3VsYXIgY2h1bmsgcmVmZXJlbmNlcyB0aGF0IGNhdXNlXHJcbiAgICAgICAgLy8gXCJDYW5ub3QgYWNjZXNzICdYJyBiZWZvcmUgaW5pdGlhbGl6YXRpb25cIiBURFogZXJyb3JzIGluIHByb2R1Y3Rpb24uXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcblxyXG4gIHNlcnZlcjoge1xyXG4gICAgaG9zdDogJzAuMC4wLjAnLFxyXG4gICAgcG9ydDogNDAwMCxcclxuICB9LFxyXG5cclxuICBwcmV2aWV3OiB7XHJcbiAgICBwb3J0OiA1MDAwLFxyXG4gIH0sXHJcblxyXG4gIGJhc2U6ICcvJyxcclxufSk7XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBaVgsU0FBUyxvQkFBb0I7QUFDOVksT0FBTyxXQUFXO0FBQ2xCLE9BQU8sbUJBQW1CO0FBRTFCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsY0FBYyxDQUFDO0FBQUEsRUFFbEMsU0FBUztBQUFBLElBQ1AsUUFBUSxDQUFDLFNBQVMsYUFBYSxrQkFBa0IsaUJBQWlCO0FBQUEsRUFDcEU7QUFBQSxFQUVBLGNBQWM7QUFBQSxJQUNaLFNBQVM7QUFBQSxNQUNQO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLE1BQ0E7QUFBQSxNQUNBO0FBQUEsTUFDQTtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsSUFDWCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUE7QUFBQTtBQUFBO0FBQUEsTUFJUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFFQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLEVBQ1I7QUFBQSxFQUVBLE1BQU07QUFDUixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
