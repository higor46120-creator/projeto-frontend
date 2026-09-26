import { defineConfig } from 'vite';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Precisa ser a porta 3000: é o valor fixo em app.oauth2.redirect-uri e
    // app.cors.allowed-origin do backend (application.yml).
    port: 3000,
  },
});
