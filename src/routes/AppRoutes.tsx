
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingScreen } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import Sellers from '@/pages/Sellers';
import Features from '@/pages/Features';
import Profile from '@/pages/Profile';
import Favorites from '@/pages/Favorites';
import Messages from '@/pages/Messages';
import Analytics from '@/pages/Analytics';
import AdminPanel from '@/pages/admin/AdminPanel';
import BrowseShops from '@/components/dashboard/BrowseShops';

// Dashboard pages
import DashboardChat from '@/pages/dashboard/DashboardChat';
import DashboardAds from '@/pages/dashboard/DashboardAds';
import DashboardShops from '@/pages/dashboard/DashboardShops';
import DashboardProducts from '@/pages/dashboard/DashboardProducts';
import DashboardAdApprovals from '@/pages/dashboard/DashboardAdApprovals';
import DashboardWholesalerOrders from '@/pages/dashboard/DashboardWholesalerOrders';
import DashboardSellerOrders from '@/pages/dashboard/DashboardSellerOrders';
import DashboardAnalytics from '@/pages/dashboard/DashboardAnalytics';

const AppRoutes: React.FC = () => {
  const { loading, user, profile } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<Products />} />
      <Route path="/sellers" element={<Sellers />} />
      <Route path="/features" element={<Features />} />
      
      {/* Auth Routes */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/signup" 
        element={user ? <Navigate to="/dashboard" replace /> : <Signup />} 
      />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/profile" 
        element={user ? <Profile /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/favorites" 
        element={user ? <Favorites /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/messages" 
        element={user ? <Messages /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/analytics" 
        element={
          user && (profile?.role === 'wholesaler' || profile?.role === 'admin') ? 
          <Analytics /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      
      {/* Dashboard Sub-routes */}
      <Route 
        path="/dashboard/browse-shops" 
        element={user ? <BrowseShops /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/dashboard/chat" 
        element={user ? <DashboardChat /> : <Navigate to="/login" replace />} 
      />
      <Route 
        path="/dashboard/ads" 
        element={
          user && profile?.role === 'wholesaler' ? 
          <DashboardAds /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/dashboard/shops" 
        element={
          user && profile?.role === 'wholesaler' ? 
          <DashboardShops /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/dashboard/products" 
        element={
          user && profile?.role === 'wholesaler' ? 
          <DashboardProducts /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/dashboard/ad-approvals" 
        element={
          user && profile?.role === 'admin' ? 
          <DashboardAdApprovals /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/dashboard/wholesaler-orders" 
        element={
          user && profile?.role === 'wholesaler' ? 
          <DashboardWholesalerOrders /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/dashboard/seller-orders" 
        element={
          user && profile?.role === 'seller' ? 
          <DashboardSellerOrders /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/dashboard/seller-dashboard" 
        element={
          user && profile?.role === 'wholesaler' ? 
          <DashboardAnalytics /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      <Route 
        path="/dashboard/analytics" 
        element={
          user && (profile?.role === 'wholesaler' || profile?.role === 'admin') ? 
          <DashboardAnalytics /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          user && profile?.role === 'admin' ? 
          <AdminPanel /> : 
          <Navigate to="/dashboard" replace />
        } 
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
