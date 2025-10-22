import React from 'react'
import { createRoot } from 'react-dom/client'
import { CartProvider } from '@/contexts/CartContext'
import App from './App.tsx'
import './index.css'
import './styles/urdu.css'

// Defer CSP application to not block initial render
setTimeout(() => {
  import('./lib/security/content-security-policy').then(({ applyCSP }) => {
    applyCSP();
  });
}, 100);

const rootElement = document.getElementById("root")!;

// Hydrate instead of render if there's already content (from static HTML)
const hasChildren = rootElement.hasChildNodes();

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </React.StrictMode>
);
