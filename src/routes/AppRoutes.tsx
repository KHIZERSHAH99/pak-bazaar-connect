
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Lazy load components for better performance
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/FixedLogin'));
const Signup = lazy(() => import('@/pages/FixedSignup'));
const Dashboard = lazy(() => import('@/pages/FixedDashboard'));
const OptimizedProfile = lazy(() => import('@/pages/OptimizedProfile'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Lazy load dashboard pages
const DashboardShops = lazy(() => import('@/pages/dashboard/DashboardShops'));
const DashboardProducts = lazy(() => import('@/pages/dashboard/DashboardProducts'));
const DashboardOrders = lazy(() => import('@/pages/dashboard/DashboardOrders'));
const DashboardAds = lazy(() => import('@/pages/dashboard/DashboardAds'));
const DashboardWholesalerOrders = lazy(() => import('@/pages/dashboard/DashboardWholesalerOrdersEnhanced'));
const DashboardSellerOrders = lazy(() => import('@/pages/dashboard/DashboardSellerOrders'));
const DashboardBrowseShops = lazy(() => import('@/pages/dashboard/DashboardBrowseShops'));
const DashboardChat = lazy(() => import('@/pages/dashboard/DashboardChat'));
const DashboardAdmin = lazy(() => import('@/pages/dashboard/DashboardAdmin'));
const DashboardAdApprovals = lazy(() => import('@/pages/dashboard/DashboardAdApprovals'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen message="Loading application..." />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <OptimizedProfile />
          </ProtectedRoute>
        } />

        {/* Dashboard Sub-routes */}
        <Route path="/dashboard/shops" element={
          <ProtectedRoute requiredRole="wholesaler">
            <DashboardShops />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/products" element={
          <ProtectedRoute requiredRole="wholesaler">
            <DashboardProducts />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/orders" element={
          <ProtectedRoute>
            <DashboardOrders />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/ads" element={
          <ProtectedRoute requiredRole="wholesaler">
            <DashboardAds />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/wholesaler-orders" element={
          <ProtectedRoute requiredRole="wholesaler">
            <DashboardWholesalerOrders />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/seller-orders" element={
          <ProtectedRoute requiredRole="seller">
            <DashboardSellerOrders />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/browse-shops" element={
          <ProtectedRoute requiredRole="seller">
            <DashboardBrowseShops />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/chat" element={
          <ProtectedRoute>
            <DashboardChat />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/admin" element={
          <ProtectedRoute requiredRole="admin">
            <DashboardAdmin />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard/ad-approvals" element={
          <ProtectedRoute requiredRole="admin">
            <DashboardAdApprovals />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
