import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Eager-load critical pages only
import Index from '@/pages/Index';
import FixedLogin from '@/pages/FixedLogin';
import Signup from '@/pages/Signup';

// Lazy-load all other pages
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Products = React.lazy(() => import('@/pages/Products'));
const ProductDetail = React.lazy(() => import('@/pages/ProductDetail'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));
const Stats = React.lazy(() => import('@/pages/Stats'));
const Features = React.lazy(() => import('@/pages/Features'));
const PrivacyPolicy = React.lazy(() => import('@/pages/PrivacyPolicy'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const AboutUs = React.lazy(() => import('@/pages/AboutUs'));
const TermsOfService = React.lazy(() => import('@/pages/TermsOfService'));
const RefundPolicy = React.lazy(() => import('@/pages/RefundPolicy'));
const ShippingPolicy = React.lazy(() => import('@/pages/ShippingPolicy'));
const Blog = React.lazy(() => import('@/pages/Blog'));
const BlogPost = React.lazy(() => import('@/pages/BlogPost'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const Favorites = React.lazy(() => import('@/pages/Favorites'));
const Messages = React.lazy(() => import('@/pages/Messages'));
const Analytics = React.lazy(() => import('@/pages/Analytics'));

// Dashboard pages
const DashboardSellerDashboard = React.lazy(() => import('@/pages/dashboard/DashboardSellerDashboard'));
const DashboardShops = React.lazy(() => import('@/pages/dashboard/DashboardShops'));
const DashboardProducts = React.lazy(() => import('@/pages/dashboard/DashboardProducts'));
const DashboardShipping = React.lazy(() => import('@/pages/dashboard/DashboardShipping'));
const DashboardOrders = React.lazy(() => import('@/pages/dashboard/DashboardOrders'));
const DashboardWholesalerOrders = React.lazy(() => import('@/pages/dashboard/DashboardWholesalerOrders'));
const DashboardSellerOrders = React.lazy(() => import('@/pages/dashboard/DashboardSellerOrders'));
const DashboardAdmin = React.lazy(() => import('@/pages/dashboard/DashboardAdmin'));
const DashboardAnalytics = React.lazy(() => import('@/pages/dashboard/DashboardAnalytics'));
const DashboardBrowseShops = React.lazy(() => import('@/pages/dashboard/DashboardBrowseShops'));
const DashboardWholesalerPreview = React.lazy(() => import('@/pages/dashboard/DashboardWholesalerPreview'));
const DashboardSellerPreview = React.lazy(() => import('@/pages/dashboard/DashboardSellerPreview'));
const DashboardPayment = React.lazy(() => import('@/pages/dashboard/DashboardPayment'));
const DashboardCoupons = React.lazy(() => import('@/pages/dashboard/DashboardCoupons'));

// Seller pages
const SellerOrders = React.lazy(() => import('@/pages/seller/SellerOrders'));
const BrowseShops = React.lazy(() => import('@/pages/seller/BrowseShops'));
const SellerShopDetails = React.lazy(() => import('@/pages/seller/ShopDetails'));
const ShopProducts = React.lazy(() => import('@/pages/seller/ShopProducts'));

// Wholesaler pages
const WholesalerOrders = React.lazy(() => import('@/pages/wholesaler/WholesalerOrders'));
const Shops = React.lazy(() => import('@/pages/wholesaler/Shops'));
const WholesalerProducts = React.lazy(() => import('@/pages/wholesaler/Products'));

// Admin pages
const AdminDashboard = React.lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminPanel = React.lazy(() => import('@/pages/admin/AdminPanel'));
const PublicBrowseShops = React.lazy(() => import('@/pages/BrowseShops'));
const EmailConfirmationPending = React.lazy(() => import('@/pages/EmailConfirmationPending'));
const ShopDetails = React.lazy(() => import('@/pages/ShopDetails'));

const AppRoutes: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingSpinner /></div>}>
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
      </Suspense>
    </ErrorBoundary>
  );
};

export default AppRoutes;
