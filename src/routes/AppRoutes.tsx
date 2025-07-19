
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Import all existing pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import Chat from '@/pages/Chat';
import NotFound from '@/pages/NotFound';
import Stats from '@/pages/Stats';
import Sellers from '@/pages/Sellers';
import Features from '@/pages/Features';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import Contact from '@/pages/Contact';
import TermsOfService from '@/pages/TermsOfService';
import RefundPolicy from '@/pages/RefundPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import Checkout from '@/pages/Checkout';
import Favorites from '@/pages/Favorites';
import Messages from '@/pages/Messages';

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
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/sellers" element={<Sellers />} />
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

        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        {/* Dashboard routes */}
        <Route path="/dashboard/seller-dashboard" element={<DashboardSellerDashboard />} />
        <Route path="/dashboard/shops" element={<DashboardShops />} />
        <Route path="/dashboard/products" element={<DashboardProducts />} />
        <Route path="/dashboard/orders" element={<DashboardOrders />} />
        <Route path="/dashboard/wholesaler-orders" element={<DashboardWholesalerOrders />} />
        <Route path="/dashboard/seller-orders" element={<DashboardSellerOrders />} />
        <Route path="/dashboard/ads" element={<DashboardAds />} />
        <Route path="/dashboard/ad-approvals" element={<DashboardAdApprovals />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
        <Route path="/dashboard/chat" element={<DashboardChat />} />
        <Route path="/dashboard/browse-shops" element={<DashboardBrowseShops />} />

        {/* Seller routes */}
        <Route path="/seller/orders" element={<SellerOrders />} />
        <Route path="/seller/browse-shops" element={<BrowseShops />} />
        <Route path="/seller/shop/:shopId" element={<ShopDetails />} />
        <Route path="/seller/shop/:shopId/products" element={<ShopProducts />} />

        {/* Wholesaler routes */}
        <Route path="/wholesaler/orders" element={<WholesalerOrders />} />
        <Route path="/wholesaler/shops" element={<Shops />} />
        <Route path="/wholesaler/products" element={<WholesalerProducts />} />
        <Route path="/wholesaler/advertisements" element={<Advertisements />} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/panel" element={<AdminPanel />} />
        <Route path="/admin/ad-approvals" element={<AdApprovals />} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
