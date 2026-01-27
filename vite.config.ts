import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Increase chunk size warning limit (default 500kb)
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking for large dependencies
        manualChunks(id) {
          // Three.js and 3D libraries
          if (id.includes('node_modules/three')) {
            return 'vendor-three';
          }
          // React core
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor-react';
          }
          // Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix';
          }
          // Animation
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
          // Charts/visualization  
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          // Syntax highlighting
          if (id.includes('node_modules/highlight.js') || id.includes('node_modules/react-syntax-highlighter')) {
            return 'vendor-highlight';
          }
          // Markdown
          if (id.includes('node_modules/react-markdown') || id.includes('node_modules/remark') || id.includes('node_modules/rehype')) {
            return 'vendor-markdown';
          }
        },
      },
    },
  },
}));
