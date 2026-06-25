const resolvedMode = String(import.meta.env.VITE_MODE || 'local')
  .trim()
  .toLowerCase();

export const ApiEnvironmentConfig = {
  baseUrl:
    resolvedMode === 'production'
      ? import.meta.env.VITE_PRODUCTION_API_URL
      : resolvedMode === 'ngrok'
        ? import.meta.env.VITE_NGROK_API_URL || import.meta.env.VITE_LOCALHOST_API_URL
        : import.meta.env.VITE_LOCALHOST_API_URL,
};
