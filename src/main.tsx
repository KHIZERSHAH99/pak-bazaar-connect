import React from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from '@/contexts/CartContext'
import App from './App.tsx'
import './index.css'
import './styles/urdu.css'
import { applyCSP } from './lib/security/content-security-policy'

// Render app first, then apply CSP to avoid blocking initial resources
const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);

// Apply CSP after React renders to prevent blocking initial load
setTimeout(() => {
  try {
    applyCSP();
  } catch (error) {
    console.error('CSP application error:', error);
  }
}, 0);
