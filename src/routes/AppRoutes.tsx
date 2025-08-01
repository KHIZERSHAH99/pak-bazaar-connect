import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import FixedProtectedRoute from '@/components/FixedProtectedRoute';

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
        <Route path="/dashboard" element={<FixedProtectedRoute><Dashboard /></FixedProtectedRoute>} />
        <Route path="/profile" element={<FixedProtectedRoute><Profile /></FixedProtectedRoute>} />

        {/* Dashboard routes */}
        <Route path="/dashboard/seller-dashboard" element={<FixedProtectedRoute><DashboardSellerDashboard /></FixedProtectedRoute>} />
        <Route path="/dashboard/shops" element={<FixedProtectedRoute allowedRoles={['wholesaler']}><DashboardShops /></FixedProtectedRoute>} />
        <Route path="/dashboard/products" element={<FixedProtectedRoute allowedRoles={['wholesaler']}><DashboardProducts /></FixedProtectedRoute>} />
        <Route path="/dashboard/orders" element={<FixedProtectedRoute><DashboardOrders /></FixedProtectedRoute>} />
        <Route path="/dashboard/wholesaler-orders" element={<FixedProtectedRoute allowedRoles={['wholesaler']}><DashboardWholesalerOrders /></FixedProtectedRoute>} />
        <Route path="/dashboard/seller-orders" element={<FixedProtectedRoute allowedRoles={['seller']}><DashboardSellerOrders /></FixedProtectedRoute>} />
        <Route path="/dashboard/ads" element={<FixedProtectedRoute allowedRoles={['wholesaler']}><DashboardAds /></FixedProtectedRoute>} />
        <Route path="/dashboard/ad-approvals" element={<FixedProtectedRoute allowedRoles={['admin']}><DashboardAdApprovals /></FixedProtectedRoute>} />
        <Route path="/dashboard/admin" element={<FixedProtectedRoute allowedRoles={['admin']}><DashboardAdmin /></FixedProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<FixedProtectedRoute><DashboardAnalytics /></FixedProtectedRoute>} />
        <Route path="/dashboard/chat" element={<FixedProtectedRoute><DashboardChat /></FixedProtectedRoute>} />
        <Route path="/dashboard/browse-shops" element={<FixedProtectedRoute allowedRoles={['seller']}><DashboardBrowseShops /></FixedProtectedRoute>} />

        {/* Seller routes */}
        <Route path="/seller/orders" element={<FixedProtectedRoute allowedRoles={['seller']}><SellerOrders /></FixedProtectedRoute>} />
        <Route path="/seller/browse-shops" element={<FixedProtectedRoute allowedRoles={['seller']}><BrowseShops /></FixedProtectedRoute>} />
        <Route path="/seller/shop/:shopId" element={<FixedProtectedRoute allowedRoles={['seller']}><ShopDetails /></FixedProtectedRoute>} />
        <Route path="/seller/shop/:shopId/products" element={<FixedProtectedRoute allowedRoles={['seller']}><ShopProducts /></FixedProtectedRoute>} />

        {/* Wholesaler routes */}
        <Route path="/wholesaler/orders" element={<FixedProtectedRoute allowedRoles={['wholesaler']}><WholesalerOrders /></FixedProtectedRoute>} />
        <Route path="/wholesaler/shops" element={<FixedProtectedRoute allowedRoles={['wholesaler']}><Shops /></FixedProtectedRoute>} />
        <Route path="/wholesaler/products" element={<FixedProtectedRoute allowedRoles={['wholesaler']}><WholesalerProducts /></FixedProtectedRoute>} />
        <Route path="/wholesaler/advertisements" element={<FixedProtectedRoute allowedRoles={['wholesaler']}><Advertisements /></FixedProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<FixedProtectedRoute allowedRoles={['admin']}><AdminDashboard /></FixedProtectedRoute>} />
        <Route path="/admin/panel" element={<FixedProtectedRoute allowedRoles={['admin']}><AdminPanel /></FixedProtectedRoute>} />
        <Route path="/admin/ad-approvals" element={<FixedProtectedRoute allowedRoles={['admin']}><AdApprovals /></FixedProtectedRoute>} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
