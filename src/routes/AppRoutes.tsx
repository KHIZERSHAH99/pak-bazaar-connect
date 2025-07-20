
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Lazy load pages for better performance
const Index = React.lazy(() => import('@/pages/Index'));
const Login = React.lazy(() => import('@/pages/Login'));
const Signup = React.lazy(() => import('@/pages/Signup'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Products = React.lazy(() => import('@/pages/Products'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Chat = React.lazy(() => import('@/pages/Chat'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

// Dashboard pages
const DashboardShops = React.lazy(() => import('@/pages/dashboard/DashboardShops'));
const DashboardProducts = React.lazy(() => import('@/pages/dashboard/DashboardProducts'));
const DashboardOrders = React.lazy(() => import('@/pages/dashboard/DashboardOrders'));
const DashboardAds = React.lazy(() => import('@/pages/dashboard/DashboardAds'));
const DashboardAdmin = React.lazy(() => import('@/pages/dashboard/DashboardAdmin'));

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/products" element={<Products />} />
        <Route path="/chat" element={<Chat />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/shops" element={<DashboardShops />} />
        <Route path="/dashboard/products" element={<DashboardProducts />} />
        <Route path="/dashboard/orders" element={<DashboardOrders />} />
        <Route path="/dashboard/ads" element={<DashboardAds />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
