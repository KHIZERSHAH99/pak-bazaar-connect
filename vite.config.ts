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
    // Optimize chunk splitting for better caching
    rollupOptions: {
      output: {
        // Use content hashes for long-term caching
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks: {
          // Core vendor libraries
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          // UI framework - split into smaller chunks
          'vendor-radix-dialog': ['@radix-ui/react-dialog'],
          'vendor-radix-dropdown': ['@radix-ui/react-dropdown-menu'],
          'vendor-radix-popover': ['@radix-ui/react-popover'],
          'vendor-radix-select': ['@radix-ui/react-select'],
          'vendor-radix-tabs': ['@radix-ui/react-tabs'],
          'vendor-radix-toast': ['@radix-ui/react-toast'],
          'vendor-radix-tooltip': ['@radix-ui/react-tooltip'],
          // Form and validation
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // Data fetching
          'vendor-query': ['@tanstack/react-query'],
          // Charts (heavy, rarely needed on first load)
          'vendor-charts': ['recharts'],
        },
      },
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 600,
    // Use esbuild for minification (built-in, no extra dependency)
    minify: mode === 'production' ? 'esbuild' : false,
    // Enable CSS code splitting
    cssCodeSplit: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
    ],
  },
}));
