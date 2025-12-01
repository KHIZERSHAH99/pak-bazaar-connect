import React from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from '@/contexts/CartContext'
import App from './App.tsx'
import './index.css'
import './styles/urdu.css'
import { applyCSP } from './lib/security/content-security-policy'
import { HelmetProvider } from 'react-helmet-async'
import { initializeCleanupTasks } from './lib/performance/cleanup-manager'
import { registerCacheCleanup } from './lib/performance/cache-manager'
import { registerQueryOptimizerCleanup } from './lib/performance/query-optimizer'
import { registerEnhancedQueryCleanup } from './lib/performance/query-optimizer-enhanced'

// Apply Content Security Policy headers for security
applyCSP();

// Initialize centralized cleanup manager to prevent memory leaks
initializeCleanupTasks();
registerCacheCleanup();
registerQueryOptimizerCleanup();
registerEnhancedQueryCleanup();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </HelmetProvider>
  </React.StrictMode>
);
