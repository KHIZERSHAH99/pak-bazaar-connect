import React from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from '@/contexts/CartContext'
import App from './App.tsx'
import './index.css'
import './styles/urdu.css'
import { applyCSP } from './lib/security/content-security-policy'
import { HelmetProvider } from 'react-helmet-async'

// Apply CSP once at startup
applyCSP();

// Defer non-critical cleanup initialization
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    import('./lib/performance/cleanup-manager').then(m => {
      m.initializeCleanupTasks();
    });
    import('./lib/performance/cache-manager').then(m => m.registerCacheCleanup());
    import('./lib/performance/query-optimizer').then(m => m.registerQueryOptimizerCleanup());
    import('./lib/performance/query-optimizer-enhanced').then(m => m.registerEnhancedQueryCleanup());
  });
} else {
  setTimeout(() => {
    import('./lib/performance/cleanup-manager').then(m => m.initializeCleanupTasks());
    import('./lib/performance/cache-manager').then(m => m.registerCacheCleanup());
    import('./lib/performance/query-optimizer').then(m => m.registerQueryOptimizerCleanup());
    import('./lib/performance/query-optimizer-enhanced').then(m => m.registerEnhancedQueryCleanup());
  }, 3000);
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </HelmetProvider>
  </React.StrictMode>
);
