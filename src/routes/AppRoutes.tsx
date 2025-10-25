import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';

// Import all existing pages
import Index from '@/pages/Index';
import FixedLogin from '@/pages/FixedLogin';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';

import NotFound from '@/pages/NotFound';
import Stats from '@/pages/Stats';

import Features from '@/pages/Features';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Contact from '@/pages/Contact';
import AboutUs from '@/pages/AboutUs';
import TermsOfService from '@/pages/TermsOfService';
import RefundPolicy from '@/pages/RefundPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Checkout from '@/pages/Checkout';
import Favorites from '@/pages/Favorites';
import Messages from '@/pages/Messages';
import Analytics from '@/pages/Analytics';

// Dashboard pages
import DashboardSellerDashboard from '@/pages/dashboard/DashboardSellerDashboard';
import DashboardShops from '@/pages/dashboard/DashboardShops';
import DashboardProducts from '@/pages/dashboard/DashboardProducts';
import DashboardShipping from '@/pages/dashboard/DashboardShipping';
import DashboardOrders from '@/pages/dashboard/DashboardOrders';
import DashboardWholesalerOrders from '@/pages/dashboard/DashboardWholesalerOrders';
import DashboardSellerOrders from '@/pages/dashboard/DashboardSellerOrders';
import DashboardAdmin from '@/pages/dashboard/DashboardAdmin';
import DashboardAnalytics from '@/pages/dashboard/DashboardAnalytics';

import DashboardBrowseShops from '@/pages/dashboard/DashboardBrowseShops';
import DashboardWholesalerPreview from '@/pages/dashboard/DashboardWholesalerPreview';
import DashboardSellerPreview from '@/pages/dashboard/DashboardSellerPreview';
import DashboardPayment from '@/pages/dashboard/DashboardPayment';
import DashboardCoupons from '@/pages/dashboard/DashboardCoupons';

// Seller pages
import SellerOrders from '@/pages/seller/SellerOrders';
import BrowseShops from '@/pages/seller/BrowseShops';
import SellerShopDetails from '@/pages/seller/ShopDetails';
import ShopProducts from '@/pages/seller/ShopProducts';

// Wholesaler pages
import WholesalerOrders from '@/pages/wholesaler/WholesalerOrders';
import Shops from '@/pages/wholesaler/Shops';
import WholesalerProducts from '@/pages/wholesaler/Products';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPanel from '@/pages/admin/AdminPanel';
import PublicBrowseShops from '@/pages/BrowseShops';
import EmailConfirmationPending from '@/pages/EmailConfirmationPending';
import VerifyEmail from '@/pages/VerifyEmail';
import ShopDetails from '@/pages/ShopDetails';

const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<FixedLogin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        
        <Route path="/features" element={<Features />} />
        <Route path="/stats" element={<Stats />} />
        
        {/* Public shops and confirmation */}
        <Route path="/shops" element={<PublicBrowseShops />} />
        <Route path="/shop/:shopId" element={<ShopDetails />} />
        <Route path="/email-confirmation-pending" element={<EmailConfirmationPending />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Legal pages */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
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
        <Route path="/dashboard/shipping" element={<ProtectedRoute requiredRole="wholesaler"><DashboardShipping /></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute><DashboardOrders /></ProtectedRoute>} />
        <Route path="/dashboard/seller-orders" element={<ProtectedRoute requiredRole="seller"><DashboardSellerOrders /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler-orders" element={<ProtectedRoute requiredRole="wholesaler"><DashboardWholesalerOrders /></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><DashboardAdmin /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><DashboardAnalytics /></ProtectedRoute>} />
        <Route path="/dashboard/payment" element={<ProtectedRoute requiredRole="wholesaler"><DashboardPayment /></ProtectedRoute>} />
        <Route path="/dashboard/coupons" element={<ProtectedRoute requiredRole="wholesaler"><DashboardCoupons /></ProtectedRoute>} />
        <Route path="/dashboard/browse-shops" element={<ProtectedRoute requiredRole="seller"><DashboardBrowseShops /></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler-preview" element={<ProtectedRoute requiredRole="admin"><DashboardWholesalerPreview /></ProtectedRoute>} />
        <Route path="/dashboard/seller-preview" element={<ProtectedRoute requiredRole="admin"><DashboardSellerPreview /></ProtectedRoute>} />
        
        {/* Redirect old chat route to dashboard */}
        <Route path="/dashboard/chat" element={<Navigate to="/dashboard" replace />} />

        {/* Seller routes */}
        <Route path="/seller/orders" element={<ProtectedRoute requiredRole="seller"><SellerOrders /></ProtectedRoute>} />
        <Route path="/seller/browse-shops" element={<ProtectedRoute requiredRole="seller"><BrowseShops /></ProtectedRoute>} />
        <Route path="/seller/shop/:shopId" element={<ProtectedRoute requiredRole="seller"><SellerShopDetails /></ProtectedRoute>} />
        <Route path="/seller/shop/:shopId/products" element={<ProtectedRoute requiredRole="seller"><ShopProducts /></ProtectedRoute>} />

        {/* Wholesaler routes */}
        <Route path="/wholesaler/orders" element={<ProtectedRoute requiredRole="wholesaler"><WholesalerOrders /></ProtectedRoute>} />
        <Route path="/wholesaler/shops" element={<ProtectedRoute requiredRole="wholesaler"><Shops /></ProtectedRoute>} />
        <Route path="/wholesaler/products" element={<ProtectedRoute requiredRole="wholesaler"><WholesalerProducts /></ProtectedRoute>} />
        

        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/panel" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
