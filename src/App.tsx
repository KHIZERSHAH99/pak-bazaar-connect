import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Toaster } from './components/ui/toaster';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Public marketplace pages
import Products from "./pages/Products";
import Sellers from "./pages/Sellers";
import ProductDetail from "./pages/ProductDetail";
import SellerProfile from "./pages/SellerProfile";
import InquiryForm from "./pages/InquiryForm";

// Admin pages
import AdApprovals from "./pages/admin/AdApprovals";
import AdminPanel from "./pages/admin/AdminPanel";

// Wholesaler pages
import Shops from "./pages/wholesaler/Shops";
import ShopDetails from "./pages/wholesaler/ShopDetails";
import WholesalerProductsManagement from "./pages/wholesaler/Products";
import Advertisements from "./pages/wholesaler/Advertisements";
import SellerDashboard from "./pages/wholesaler/SellerDashboard";
import WholesalerOrders from "./pages/wholesaler/WholesalerOrders";

// Seller pages
import BrowseShops from "./pages/seller/BrowseShops";
import ShopProducts from "./pages/seller/ShopProducts";
import SellerOrders from "./pages/seller/SellerOrders";

// Common pages
import ChatSupport from "./pages/ChatSupport";

// Favorites
import Favorites from './pages/Favorites';

// Messages
import Messages from './pages/Messages';

// Analytics
import Analytics from './pages/Analytics';

// Wholesaler marketplace page
import WholesalerProducts from './pages/WholesalerProducts';

// Policy Pages
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import RefundPolicy from './pages/RefundPolicy';
import ShippingPolicy from './pages/ShippingPolicy'; // New Policy Page

// Import the new Features page
import Features from './pages/Features';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-background text-foreground">
                <Routes>
                  {/* Public pages */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* Public marketplace pages */}
                  <Route path="/products" element={<Products />} />
                  <Route path="/sellers" element={<Sellers />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/seller/:id" element={<SellerProfile />} />
                  <Route path="/inquiry" element={<InquiryForm />} />

                  {/* Features showcase page */}
                  <Route path="/features" element={<Features />} />

                  {/* Policy Pages */}
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />

                  {/* Protected pages */}
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />

                  {/* Admin pages */}
                  <Route path="/dashboard/ad-approvals" element={<AdApprovals />} />
                  <Route path="/admin" element={<AdminPanel />} />

                  {/* Wholesaler pages */}
                  <Route path="/dashboard/shops" element={<Shops />} />
                  <Route path="/dashboard/shops/:shopId" element={<ShopDetails />} />
                  <Route path="/dashboard/products" element={<WholesalerProductsManagement />} />
                  <Route path="/dashboard/ads" element={<Advertisements />} />
                  <Route path="/dashboard/wholesaler-orders" element={<WholesalerOrders />} />
                  <Route path="/dashboard/seller-dashboard" element={<SellerDashboard />} />

                  {/* Seller pages */}
                  <Route path="/dashboard/browse-shops" element={<BrowseShops />} />
                  <Route path="/dashboard/browse-shops/:shopId" element={<ShopProducts />} />
                  <Route path="/dashboard/seller-orders" element={<SellerOrders />} />

                  {/* Common pages */}
                  <Route path="/dashboard/chat" element={<ChatSupport />} />
                  
                  {/* Favorites */}
                  <Route path="/favorites" element={
                    <ProtectedRoute allowedRoles={['seller', 'wholesaler']}>
                      <Favorites />
                    </ProtectedRoute>
                  } />

                  {/* Messages */}
                  <Route path="/messages" element={
                    <ProtectedRoute allowedRoles={['seller', 'wholesaler']}>
                      <Messages />
                    </ProtectedRoute>
                  } />

                  {/* Analytics */}
                  <Route path="/analytics" element={
                    <ProtectedRoute allowedRoles={['wholesaler']}>
                      <Analytics />
                    </ProtectedRoute>
                  } />
                  
                  {/* Wholesaler products marketplace */}
                  <Route path="/wholesaler-products" element={<WholesalerProducts />} />

                  {/* 404 page */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
