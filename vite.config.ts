import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: '/Premier-Rentals/',
  envPrefix: ['DEMO_', 'APP_', 'REACT_APP_', 'VITE_'],
  server: {
    host: "::",
    port: 8080,

    // 🔥 ADD THIS BLOCK
    proxy: {
      '/api': {
        target: 'http://localhost/grocery-pos-backend/api',
        changeOrigin: true,
        secure: false,
      }
    }
  },

  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));