
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Stats from '@/pages/Stats';
import Chat from '@/pages/Chat';
import Products from '@/pages/Products';
import Sellers from '@/pages/Sellers';
import Features from '@/pages/Features';
import WholesalerProducts from '@/pages/WholesalerProducts';
import ProductDetail from '@/pages/ProductDetail';
import SellerProfile from '@/pages/SellerProfile';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import RefundPolicy from '@/pages/RefundPolicy';
import ShippingPolicy from '@/pages/ShippingPolicy';
import NotFound from '@/pages/NotFound';
import Messages from '@/pages/Messages';
import Analytics from '@/pages/Analytics';
import Favorites from '@/pages/Favorites';

// Admin pages
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Dashboard pages
import DashboardShops from '@/pages/dashboard/DashboardShops';
import DashboardProducts from '@/pages/dashboard/DashboardProducts';
import DashboardAds from '@/pages/dashboard/DashboardAds';
import DashboardOrders from '@/pages/dashboard/DashboardOrders';
import DashboardChat from '@/pages/dashboard/DashboardChat';
import DashboardAdApprovals from '@/pages/dashboard/DashboardAdApprovals';
import DashboardBrowseShops from '@/pages/dashboard/DashboardBrowseShops';
import DashboardSellerOrders from '@/pages/dashboard/DashboardSellerOrders';
import DashboardWholesalerOrders from '@/pages/dashboard/DashboardWholesalerOrders';
import DashboardSellerDashboard from '@/pages/dashboard/DashboardSellerDashboard';
import DashboardAdmin from '@/pages/dashboard/DashboardAdmin';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/stats" element={<Stats />} />
      <Route path="/chat" element={<Chat />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/favorites" element={<Favorites />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      
      {/* Marketplace Pages */}
      <Route path="/products" element={<Products />} />
      <Route path="/sellers" element={<Sellers />} />
      <Route path="/features" element={<Features />} />
      <Route path="/wholesaler-products" element={<WholesalerProducts />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/seller/:id" element={<SellerProfile />} />
      
      {/* Dashboard Sub-Routes */}
      <Route path="/dashboard/shops" element={<DashboardShops />} />
      <Route path="/dashboard/products" element={<DashboardProducts />} />
      <Route path="/dashboard/ads" element={<DashboardAds />} />
      <Route path="/dashboard/orders" element={<DashboardOrders />} />
      <Route path="/dashboard/chat" element={<DashboardChat />} />
      <Route path="/dashboard/ad-approvals" element={<DashboardAdApprovals />} />
      <Route path="/dashboard/browse-shops" element={<DashboardBrowseShops />} />
      <Route path="/dashboard/seller-orders" element={<DashboardSellerOrders />} />
      <Route path="/dashboard/wholesaler-orders" element={<DashboardWholesalerOrders />} />
      <Route path="/dashboard/seller-dashboard" element={<DashboardSellerDashboard />} />
      <Route path="/dashboard/admin" element={<DashboardAdmin />} />
      
      {/* Policy Pages */}
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/shipping-policy" element={<ShippingPolicy />} />
      
      {/*  Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
