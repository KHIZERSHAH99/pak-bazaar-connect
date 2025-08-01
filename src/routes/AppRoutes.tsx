import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import FixedProtectedRoute from '@/components/FixedProtectedRoute';
import GuestProtectedRoute from '@/components/GuestProtectedRoute';

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

// Guest pages
import GuestBrowseShops from '@/pages/guest/GuestBrowseShops';

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
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/browse-shops" element={<GuestBrowseShops />} />
        
        <Route path="/features" element={<Features />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/stats" element={<Stats />} />
        
        {/* Legal pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />
        
        {/* Additional routes - allow guest access */}
        <Route path="/favorites" element={<GuestProtectedRoute allowGuest><Favorites /></GuestProtectedRoute>} />
        <Route path="/messages" element={<GuestProtectedRoute allowGuest><Messages /></GuestProtectedRoute>} />
        <Route path="/checkout" element={<GuestProtectedRoute allowGuest><Checkout /></GuestProtectedRoute>} />
        <Route path="/analytics" element={<GuestProtectedRoute allowGuest><Analytics /></GuestProtectedRoute>} />

        {/* Wholesaler-only authentication routes */}
        <Route path="/login" element={<FixedLogin />} />
        <Route path="/signup" element={<FixedSignup />} />

        {/* Wholesaler-only protected routes */}
        <Route path="/dashboard" element={<GuestProtectedRoute wholesalerOnly><Dashboard /></GuestProtectedRoute>} />
        <Route path="/profile" element={<GuestProtectedRoute wholesalerOnly><Profile /></GuestProtectedRoute>} />

        {/* Dashboard routes - wholesaler only */}
        <Route path="/dashboard/shops" element={<GuestProtectedRoute wholesalerOnly><DashboardShops /></GuestProtectedRoute>} />
        <Route path="/dashboard/products" element={<GuestProtectedRoute wholesalerOnly><DashboardProducts /></GuestProtectedRoute>} />
        <Route path="/dashboard/orders" element={<GuestProtectedRoute wholesalerOnly><DashboardOrders /></GuestProtectedRoute>} />
        <Route path="/dashboard/wholesaler-orders" element={<GuestProtectedRoute wholesalerOnly><DashboardWholesalerOrders /></GuestProtectedRoute>} />
        <Route path="/dashboard/ads" element={<GuestProtectedRoute wholesalerOnly><DashboardAds /></GuestProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<GuestProtectedRoute wholesalerOnly><DashboardAnalytics /></GuestProtectedRoute>} />
        <Route path="/dashboard/chat" element={<GuestProtectedRoute wholesalerOnly><DashboardChat /></GuestProtectedRoute>} />

        {/* Wholesaler routes */}
        <Route path="/wholesaler/orders" element={<GuestProtectedRoute wholesalerOnly><WholesalerOrders /></GuestProtectedRoute>} />
        <Route path="/wholesaler/shops" element={<GuestProtectedRoute wholesalerOnly><Shops /></GuestProtectedRoute>} />
        <Route path="/wholesaler/products" element={<GuestProtectedRoute wholesalerOnly><WholesalerProducts /></GuestProtectedRoute>} />
        <Route path="/wholesaler/advertisements" element={<GuestProtectedRoute wholesalerOnly><Advertisements /></GuestProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<GuestProtectedRoute allowedRoles={['admin']}><AdminDashboard /></GuestProtectedRoute>} />
        <Route path="/admin/panel" element={<GuestProtectedRoute allowedRoles={['admin']}><AdminPanel /></GuestProtectedRoute>} />
        <Route path="/admin/ad-approvals" element={<GuestProtectedRoute allowedRoles={['admin']}><AdApprovals /></GuestProtectedRoute>} />
        <Route path="/dashboard/ad-approvals" element={<GuestProtectedRoute allowedRoles={['admin']}><DashboardAdApprovals /></GuestProtectedRoute>} />
        <Route path="/dashboard/admin" element={<GuestProtectedRoute allowedRoles={['admin']}><DashboardAdmin /></GuestProtectedRoute>} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
