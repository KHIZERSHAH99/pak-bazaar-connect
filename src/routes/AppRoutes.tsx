import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import LazyLoadFallback from '@/components/ui/LazyLoadFallback';

// Critical pages - load immediately
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// Lazy load all other pages for better initial load performance
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Profile = lazy(() => import('@/pages/Profile'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Stats = lazy(() => import('@/pages/Stats'));
const Features = lazy(() => import('@/pages/Features'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Contact = lazy(() => import('@/pages/Contact'));
const AboutUs = lazy(() => import('@/pages/AboutUs'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'));
const ShippingPolicy = lazy(() => import('@/pages/ShippingPolicy'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Messages = lazy(() => import('@/pages/Messages'));
const Analytics = lazy(() => import('@/pages/Analytics'));

// Dashboard pages - lazy load
const DashboardSellerDashboard = lazy(() => import('@/pages/dashboard/DashboardSellerDashboard'));
const DashboardShops = lazy(() => import('@/pages/dashboard/DashboardShops'));
const DashboardProducts = lazy(() => import('@/pages/dashboard/DashboardProducts'));
const DashboardShipping = lazy(() => import('@/pages/dashboard/DashboardShipping'));
const DashboardOrders = lazy(() => import('@/pages/dashboard/DashboardOrders'));
const DashboardWholesalerOrders = lazy(() => import('@/pages/dashboard/DashboardWholesalerOrders'));
const DashboardSellerOrders = lazy(() => import('@/pages/dashboard/DashboardSellerOrders'));
const DashboardAdmin = lazy(() => import('@/pages/dashboard/DashboardAdmin'));
const DashboardAnalytics = lazy(() => import('@/pages/dashboard/DashboardAnalytics'));
const DashboardBrowseShops = lazy(() => import('@/pages/dashboard/DashboardBrowseShops'));
const DashboardWholesalerPreview = lazy(() => import('@/pages/dashboard/DashboardWholesalerPreview'));
const DashboardSellerPreview = lazy(() => import('@/pages/dashboard/DashboardSellerPreview'));
const DashboardPayment = lazy(() => import('@/pages/dashboard/DashboardPayment'));
const DashboardCoupons = lazy(() => import('@/pages/dashboard/DashboardCoupons'));

// Seller pages - lazy load
const SellerOrders = lazy(() => import('@/pages/seller/SellerOrders'));
const BrowseShops = lazy(() => import('@/pages/seller/BrowseShops'));
const SellerShopDetails = lazy(() => import('@/pages/seller/ShopDetails'));
const ShopProducts = lazy(() => import('@/pages/seller/ShopProducts'));

// Wholesaler pages - lazy load
const WholesalerOrders = lazy(() => import('@/pages/wholesaler/WholesalerOrders'));
const Shops = lazy(() => import('@/pages/wholesaler/Shops'));
const WholesalerProducts = lazy(() => import('@/pages/wholesaler/Products'));

// Admin pages - lazy load
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminPanel = lazy(() => import('@/pages/admin/AdminPanel'));

// Public pages - lazy load
const PublicBrowseShops = lazy(() => import('@/pages/BrowseShops'));
const EmailConfirmationPending = lazy(() => import('@/pages/EmailConfirmationPending'));
const ShopDetails = lazy(() => import('@/pages/ShopDetails'));

// Wrapper component for lazy loaded routes
const LazyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LazyLoadFallback />}>
    {children}
  </Suspense>
);

const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes - Index loads immediately */}
        <Route path="/" element={<Index />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LazyRoute><Login /></LazyRoute>} />
        <Route path="/signup" element={<LazyRoute><Signup /></LazyRoute>} />
        
        {/* Product routes */}
        <Route path="/products" element={<LazyRoute><Products /></LazyRoute>} />
        <Route path="/product/:id" element={<LazyRoute><ProductDetail /></LazyRoute>} />
        
        {/* Info pages */}
        <Route path="/features" element={<LazyRoute><Features /></LazyRoute>} />
        <Route path="/stats" element={<LazyRoute><Stats /></LazyRoute>} />
        
        {/* Public shops and confirmation */}
        <Route path="/shops" element={<LazyRoute><PublicBrowseShops /></LazyRoute>} />
        <Route path="/shop/:shopId" element={<LazyRoute><ShopDetails /></LazyRoute>} />
        <Route path="/email-confirmation-pending" element={<LazyRoute><EmailConfirmationPending /></LazyRoute>} />
        
        {/* Legal pages */}
        <Route path="/contact" element={<LazyRoute><Contact /></LazyRoute>} />
        <Route path="/about" element={<LazyRoute><AboutUs /></LazyRoute>} />
        <Route path="/blog" element={<LazyRoute><Blog /></LazyRoute>} />
        <Route path="/blog/:id" element={<LazyRoute><BlogPost /></LazyRoute>} />
        <Route path="/privacy-policy" element={<LazyRoute><PrivacyPolicy /></LazyRoute>} />
        <Route path="/terms-of-service" element={<LazyRoute><TermsOfService /></LazyRoute>} />
        <Route path="/refund-policy" element={<LazyRoute><RefundPolicy /></LazyRoute>} />
        <Route path="/shipping-policy" element={<LazyRoute><ShippingPolicy /></LazyRoute>} />
        
        {/* Additional routes */}
        <Route path="/favorites" element={<LazyRoute><Favorites /></LazyRoute>} />
        <Route path="/messages" element={<LazyRoute><Messages /></LazyRoute>} />
        <Route path="/checkout" element={<LazyRoute><Checkout /></LazyRoute>} />
        <Route path="/analytics" element={<LazyRoute><Analytics /></LazyRoute>} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><LazyRoute><Dashboard /></LazyRoute></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><LazyRoute><Profile /></LazyRoute></ProtectedRoute>} />

        {/* Dashboard routes */}
        <Route path="/dashboard/seller-dashboard" element={<ProtectedRoute><LazyRoute><DashboardSellerDashboard /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/shops" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardShops /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/products" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardProducts /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/shipping" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardShipping /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute><LazyRoute><DashboardOrders /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/seller-orders" element={<ProtectedRoute requiredRole="seller"><LazyRoute><DashboardSellerOrders /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler-orders" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardWholesalerOrders /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardAdmin /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><LazyRoute><DashboardAnalytics /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/payment" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardPayment /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/coupons" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardCoupons /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/browse-shops" element={<ProtectedRoute requiredRole="seller"><LazyRoute><DashboardBrowseShops /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler-preview" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardWholesalerPreview /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/seller-preview" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardSellerPreview /></LazyRoute></ProtectedRoute>} />
        
        {/* Redirect old chat route to dashboard */}
        <Route path="/dashboard/chat" element={<Navigate to="/dashboard" replace />} />

        {/* Seller routes */}
        <Route path="/seller/orders" element={<ProtectedRoute requiredRole="seller"><LazyRoute><SellerOrders /></LazyRoute></ProtectedRoute>} />
        <Route path="/seller/browse-shops" element={<ProtectedRoute requiredRole="seller"><LazyRoute><BrowseShops /></LazyRoute></ProtectedRoute>} />
        <Route path="/seller/shop/:shopId" element={<ProtectedRoute requiredRole="seller"><LazyRoute><SellerShopDetails /></LazyRoute></ProtectedRoute>} />
        <Route path="/seller/shop/:shopId/products" element={<ProtectedRoute requiredRole="seller"><LazyRoute><ShopProducts /></LazyRoute></ProtectedRoute>} />

        {/* Wholesaler routes */}
        <Route path="/wholesaler/orders" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><WholesalerOrders /></LazyRoute></ProtectedRoute>} />
        <Route path="/wholesaler/shops" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><Shops /></LazyRoute></ProtectedRoute>} />
        <Route path="/wholesaler/products" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><WholesalerProducts /></LazyRoute></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><LazyRoute><AdminDashboard /></LazyRoute></ProtectedRoute>} />
        <Route path="/admin/panel" element={<ProtectedRoute requiredRole="admin"><LazyRoute><AdminPanel /></LazyRoute></ProtectedRoute>} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
