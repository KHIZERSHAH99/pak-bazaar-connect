import React from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from '@/contexts/CartContext'
import App from './App.tsx'
import './index.css'
import './styles/urdu.css'
import { applyCSP } from './lib/security/content-security-policy'
import { HelmetProvider } from 'react-helmet-async'

// Apply Content Security Policy headers for security
applyCSP();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <CartProvider>
        <App />
      </CartProvider>
    </HelmetProvider>
  </React.StrictMode>
);
