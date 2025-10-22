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
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    // Enable module preloading to reduce network chain depth
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core React and routing
          if (id.includes('react-dom') || id.includes('react/')) {
            return 'react-core';
          }
          if (id.includes('react-router')) {
            return 'react-router';
          }
          
          // TanStack Query
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }
          
          // Supabase
          if (id.includes('@supabase/supabase-js')) {
            return 'supabase-vendor';
          }
          
          // Split Radix UI into smaller chunks by category
          if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-alert-dialog')) {
            return 'ui-dialog';
          }
          if (id.includes('@radix-ui/react-dropdown') || id.includes('@radix-ui/react-select') || id.includes('@radix-ui/react-popover')) {
            return 'ui-menu';
          }
          if (id.includes('@radix-ui/react-tabs') || id.includes('@radix-ui/react-accordion') || id.includes('@radix-ui/react-collapsible')) {
            return 'ui-layout';
          }
          if (id.includes('@radix-ui')) {
            return 'ui-misc';
          }
          
          // Chart libraries (often unused on initial load)
          if (id.includes('recharts')) {
            return 'charts';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform')) {
            return 'forms';
          }
          
          // Date libraries
          if (id.includes('date-fns') || id.includes('react-day-picker')) {
            return 'date-utils';
          }
          
          // Other large node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
    // Increase chunk size warning limit for vendor chunks
    chunkSizeWarningLimit: 1000,
    // Enable minification with esbuild for faster builds
    minify: 'esbuild',
    // Target modern browsers for smaller output
    target: 'esnext',
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize chunk loading
    assetsInlineLimit: 4096,
  },
}));
