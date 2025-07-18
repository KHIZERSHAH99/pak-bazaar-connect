
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Products from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';
import NotFound from '@/pages/NotFound';
import CheckoutPage from '@/pages/checkout/CheckoutPage';
import DashboardProducts from '@/pages/dashboard/DashboardProducts';
import DashboardShops from '@/pages/dashboard/DashboardShops';
import DashboardOrders from '@/pages/dashboard/DashboardOrders';
import DashboardWholesalerOrders from '@/pages/dashboard/DashboardWholesalerOrders';
import DashboardWholesalerOrdersEnhanced from '@/pages/dashboard/DashboardWholesalerOrdersEnhanced';
import WholesalerOrders from '@/pages/wholesaler/WholesalerOrders';
import DashboardAnalytics from '@/pages/dashboard/DashboardAnalytics';
import DashboardAds from '@/pages/dashboard/DashboardAds';
import DashboardSellerOrders from '@/pages/dashboard/DashboardSellerOrders';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/checkout/:shopId" element={<CheckoutPage />} />
      <Route path="/dashboard/*" element={<Dashboard />} />
      
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/products" element={<DashboardProducts />} />
      <Route path="/dashboard/shops" element={<DashboardShops />} />
      <Route path="/dashboard/orders" element={<DashboardOrders />} />
      <Route path="/dashboard/wholesaler-orders" element={<DashboardWholesalerOrders />} />
      <Route path="/dashboard/wholesaler-orders-enhanced" element={<DashboardWholesalerOrdersEnhanced />} />
      <Route path="/wholesaler/orders" element={<WholesalerOrders />} />
      <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
      <Route path="/dashboard/ads" element={<DashboardAds />} />
      <Route path="/dashboard/seller-orders" element={<DashboardSellerOrders />} />
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
