import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import LazyLoadFallback from '@/components/ui/LazyLoadFallback';

// Critical pages - load immediately
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';

// Lazy load all other pages
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
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
const Checkout = lazy(() => import('@/pages/Checkout'));
const Favorites = lazy(() => import('@/pages/Favorites'));
const Messages = lazy(() => import('@/pages/Messages'));
const Analytics = lazy(() => import('@/pages/Analytics'));

// Dashboard pages
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
const DashboardTutorials = lazy(() => import('@/pages/dashboard/DashboardTutorials'));
const DashboardTutorialDetail = lazy(() => import('@/pages/dashboard/DashboardTutorialDetail'));
const DashboardTutorialManager = lazy(() => import('@/pages/dashboard/DashboardTutorialManager'));
const DashboardAdminUsers = lazy(() => import('@/pages/dashboard/DashboardAdminUsers'));
const DashboardAdminOrders = lazy(() => import('@/pages/dashboard/DashboardAdminOrders'));
const DashboardAdminModeration = lazy(() => import('@/pages/dashboard/DashboardAdminModeration'));
const DashboardAdminAnalytics = lazy(() => import('@/pages/dashboard/DashboardAdminAnalytics'));
const DashboardInventory = lazy(() => import('@/pages/dashboard/DashboardInventory'));

// Public pages
const PublicBrowseShops = lazy(() => import('@/pages/BrowseShops'));
const ShopDetails = lazy(() => import('@/pages/ShopDetails'));
const PublicTutorials = lazy(() => import('@/pages/Tutorials'));
const TermsAndConditions = lazy(() => import('@/pages/TermsAndConditions'));

// Seller sub-pages (used by /seller/ routes, now redirected)
const SellerShopDetails = lazy(() => import('@/pages/seller/ShopDetails'));
const ShopProducts = lazy(() => import('@/pages/seller/ShopProducts'));

const LazyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense fallback={<LazyLoadFallback />}>
    {children}
  </Suspense>
);

const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Index />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LazyRoute><Login /></LazyRoute>} />
        <Route path="/signup" element={<LazyRoute><Signup /></LazyRoute>} />
        <Route path="/forgot-password" element={<LazyRoute><ForgotPassword /></LazyRoute>} />
        <Route path="/auth/callback" element={<LazyRoute><AuthCallback /></LazyRoute>} />
        
        {/* Product routes */}
        <Route path="/products" element={<LazyRoute><Products /></LazyRoute>} />
        <Route path="/product/:id" element={<LazyRoute><ProductDetail /></LazyRoute>} />
        
        {/* Info pages */}
        <Route path="/features" element={<LazyRoute><Features /></LazyRoute>} />
        <Route path="/stats" element={<LazyRoute><Stats /></LazyRoute>} />
        
        {/* Public shops */}
        <Route path="/shops" element={<LazyRoute><PublicBrowseShops /></LazyRoute>} />
        <Route path="/shop/:shopId" element={<LazyRoute><ShopDetails /></LazyRoute>} />
        
        {/* Public tutorials */}
        <Route path="/tutorials" element={<LazyRoute><PublicTutorials /></LazyRoute>} />

        {/* Legal pages */}
        <Route path="/contact" element={<LazyRoute><Contact /></LazyRoute>} />
        <Route path="/about" element={<LazyRoute><AboutUs /></LazyRoute>} />
        <Route path="/privacy-policy" element={<LazyRoute><PrivacyPolicy /></LazyRoute>} />
        <Route path="/terms-of-service" element={<LazyRoute><TermsOfService /></LazyRoute>} />
        <Route path="/refund-policy" element={<LazyRoute><RefundPolicy /></LazyRoute>} />
        <Route path="/shipping-policy" element={<LazyRoute><ShippingPolicy /></LazyRoute>} />
        <Route path="/terms-and-conditions" element={<LazyRoute><TermsAndConditions /></LazyRoute>} />
        
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
        <Route path="/dashboard/admin/users" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardAdminUsers /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/admin/orders" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardAdminOrders /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/admin/moderation" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardAdminModeration /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/admin/analytics" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardAdminAnalytics /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute><LazyRoute><DashboardAnalytics /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/payment" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardPayment /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/coupons" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardCoupons /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/browse-shops" element={<ProtectedRoute requiredRole="seller"><LazyRoute><DashboardBrowseShops /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/wholesaler-preview" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardWholesalerPreview /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/seller-preview" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardSellerPreview /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/tutorials" element={<ProtectedRoute><LazyRoute><DashboardTutorials /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/tutorials/:id" element={<ProtectedRoute><LazyRoute><DashboardTutorialDetail /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/tutorial-manager" element={<ProtectedRoute requiredRole="admin"><LazyRoute><DashboardTutorialManager /></LazyRoute></ProtectedRoute>} />
        <Route path="/dashboard/inventory" element={<ProtectedRoute requiredRole="wholesaler"><LazyRoute><DashboardInventory /></LazyRoute></ProtectedRoute>} />

        {/* Seller sub-pages (kept for shop detail navigation) */}
        <Route path="/seller/shop/:shopId" element={<ProtectedRoute requiredRole="seller"><LazyRoute><SellerShopDetails /></LazyRoute></ProtectedRoute>} />
        <Route path="/seller/shop/:shopId/products" element={<ProtectedRoute requiredRole="seller"><LazyRoute><ShopProducts /></LazyRoute></ProtectedRoute>} />

        {/* Redirect old routes to dashboard equivalents */}
        <Route path="/seller/orders" element={<Navigate to="/dashboard/seller-orders" replace />} />
        <Route path="/seller/browse-shops" element={<Navigate to="/dashboard/browse-shops" replace />} />
        <Route path="/wholesaler/orders" element={<Navigate to="/dashboard/wholesaler-orders" replace />} />
        <Route path="/wholesaler/shops" element={<Navigate to="/dashboard/shops" replace />} />
        <Route path="/wholesaler/products" element={<Navigate to="/dashboard/products" replace />} />
        <Route path="/admin/dashboard" element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="/admin/panel" element={<Navigate to="/dashboard/admin" replace />} />
        <Route path="/dashboard/chat" element={<Navigate to="/dashboard" replace />} />
        <Route path="/blog" element={<Navigate to="/" replace />} />
        <Route path="/blog/:id" element={<Navigate to="/" replace />} />
        <Route path="/email-confirmation-pending" element={<Navigate to="/login" replace />} />

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;
