import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // In development the Vite dev server proxies /api requests to the local
    // Cloudflare Worker (see the worker/ directory, `npx wrangler dev`).
    proxy: {
      "/api": {
        target: process.env.VITE_API_URL || "http://127.0.0.1:8787",
        changeOrigin: true,
      },
      "/media": {
        target: process.env.VITE_API_URL || "http://127.0.0.1:8787",
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "query": ["@tanstack/react-query"],
          "ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
          ],
          "charts": ["recharts"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
}));
