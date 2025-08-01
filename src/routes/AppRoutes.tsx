import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Import all existing pages
import Index from '@/pages/Index';
import FixedLogin from '@/pages/FixedLogin';
import FixedSignup from '@/pages/FixedSignup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Chat from '@/pages/Chat';
import NotFound from '@/pages/NotFound';
import Stats from '@/pages/Stats';

import Features from '@/pages/Features';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Contact from '@/pages/Contact';
import TermsOfService from '@/pages/TermsOfService';
import RefundPolicy from '@/pages/RefundPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import Checkout from '@/pages/Checkout';
import Favorites from '@/pages/Favorites';
import Messages from '@/pages/Messages';
import Analytics from '@/pages/Analytics';

// Dashboard pages
import DashboardSellerDashboard from '@/pages/dashboard/DashboardSellerDashboard';
import DashboardShops from '@/pages/dashboard/DashboardShops';
import DashboardProducts from '@/pages/dashboard/DashboardProducts';
import DashboardOrders from '@/pages/dashboard/DashboardOrders';
import DashboardWholesalerOrders from '@/pages/dashboard/DashboardWholesalerOrders';
import DashboardSellerOrders from '@/pages/dashboard/DashboardSellerOrders';
import DashboardAds from '@/pages/dashboard/DashboardAds';
import DashboardAdApprovals from '@/pages/dashboard/DashboardAdApprovals';
import DashboardAdmin from '@/pages/dashboard/DashboardAdmin';
import DashboardAnalytics from '@/pages/dashboard/DashboardAnalytics';
import DashboardChat from '@/pages/dashboard/DashboardChat';
import DashboardBrowseShops from '@/pages/dashboard/DashboardBrowseShops';

// Seller pages
import SellerOrders from '@/pages/seller/SellerOrders';
import BrowseShops from '@/pages/seller/BrowseShops';
import ShopDetails from '@/pages/seller/ShopDetails';
import ShopProducts from '@/pages/seller/ShopProducts';

// Wholesaler pages
import WholesalerOrders from '@/pages/wholesaler/WholesalerOrders';
import Shops from '@/pages/wholesaler/Shops';
import WholesalerProducts from '@/pages/wholesaler/Products';
import Advertisements from '@/pages/wholesaler/Advertisements';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPanel from '@/pages/admin/AdminPanel';
import AdApprovals from '@/pages/admin/AdApprovals';

const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<FixedLogin />} />
        <Route path="/signup" element={<FixedSignup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        
        <Route path="/features" element={<Features />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/stats" element={<Stats />} />
        
        {/* Legal pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        
        {/* Additional routes */}
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/analytics" element={<Analytics />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Dashboard routes */}
        <Route path="/dashboard/seller-dashboard" element={<ProtectedRoute><DashboardSellerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/shops" element={<ProtectedRoute requiredRole="wholesaler"><DashboardShops /></ProtectedRoute>} />
        <Route path="/dashboard/products" element={<ProtectedRoute requiredRole="wholesaler"><DashboardProducts /></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute><DashboardOrders /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler-orders" element={<ProtectedRoute requiredRole="wholesaler"><DashboardWholesalerOrders /></ProtectedRoute>} />
        <Route path="/dashboard/seller-orders" element={<ProtectedRoute requiredRole="seller"><DashboardSellerOrders /></ProtectedRoute>} />
        <Route path="/dashboard/ads" element={<ProtectedRoute requiredRole="wholesaler"><DashboardAds /></ProtectedRoute>} />
        <Route path="/dashboard/ad-approvals" element={<ProtectedRoute requiredRole="admin"><DashboardAdApprovals /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><DashboardAdmin /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><DashboardAnalytics /></ProtectedRoute>} />
        <Route path="/dashboard/chat" element={<ProtectedRoute><DashboardChat /></ProtectedRoute>} />
        <Route path="/dashboard/browse-shops" element={<ProtectedRoute requiredRole="seller"><DashboardBrowseShops /></ProtectedRoute>} />

        {/* Seller routes */}
        <Route path="/seller/orders" element={<ProtectedRoute requiredRole="seller"><SellerOrders /></ProtectedRoute>} />
        <Route path="/seller/browse-shops" element={<ProtectedRoute requiredRole="seller"><BrowseShops /></ProtectedRoute>} />
        <Route path="/seller/shop/:shopId" element={<ProtectedRoute requiredRole="seller"><ShopDetails /></ProtectedRoute>} />
        <Route path="/seller/shop/:shopId/products" element={<ProtectedRoute requiredRole="seller"><ShopProducts /></ProtectedRoute>} />

        {/* Wholesaler routes */}
        <Route path="/wholesaler/orders" element={<ProtectedRoute requiredRole="wholesaler"><WholesalerOrders /></ProtectedRoute>} />
        <Route path="/wholesaler/shops" element={<ProtectedRoute requiredRole="wholesaler"><Shops /></ProtectedRoute>} />
        <Route path="/wholesaler/products" element={<ProtectedRoute requiredRole="wholesaler"><WholesalerProducts /></ProtectedRoute>} />
        <Route path="/wholesaler/advertisements" element={<ProtectedRoute requiredRole="wholesaler"><Advertisements /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/panel" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/ad-approvals" element={<ProtectedRoute requiredRole="admin"><AdApprovals /></ProtectedRoute>} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
