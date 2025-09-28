
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Import pages
import Index from '@/pages/Index';
import FixedLogin from '@/pages/FixedLogin';
import FixedSignup from '@/pages/FixedSignup';
import Profile from '@/pages/Profile';
import Stats from '@/pages/Stats';

import Products from '@/pages/Products';

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
import AdminDashboard from '@/pages/admin/AdminDashboard';

// Dashboard pages
import DashboardShops from '@/pages/dashboard/DashboardShops';
import DashboardProducts from '@/pages/dashboard/DashboardProducts';
import DashboardOrders from '@/pages/dashboard/DashboardOrders';

import DashboardBrowseShops from '@/pages/dashboard/DashboardBrowseShops';
import DashboardSellerOrders from '@/pages/dashboard/DashboardSellerOrders';
import DashboardWholesalerOrders from '@/pages/dashboard/DashboardWholesalerOrders';
import DashboardSellerDashboard from '@/pages/dashboard/DashboardSellerDashboard';
import DashboardAdmin from '@/pages/dashboard/DashboardAdmin';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import FixedDashboard from '@/components/dashboard/FixedDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="light" 
        enableSystem
        disableTransitionOnChange={false}
        storageKey="pak-bazaar-theme"
      >
        <LanguageProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <div className="min-h-screen bg-background text-foreground transition-colors duration-200 font-poppins">
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <AuthProvider>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<FixedLogin />} />
                      <Route path="/signup" element={<FixedSignup />} />
                      
                      {/* Protected Routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <FixedDashboard />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/stats" element={
                        <ProtectedRoute>
                          <Stats />
                        </ProtectedRoute>
                      } />
                      
                      
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <Messages />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/analytics" element={
                        <ProtectedRoute>
                          <Analytics />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/favorites" element={
                        <ProtectedRoute>
                          <Favorites />
                        </ProtectedRoute>
                      } />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </ProtectedRoute>
                      } />
                      
                      {/* Marketplace Pages */}
                      <Route path="/products" element={<Products />} />
                      
                      <Route path="/features" element={<Features />} />
                      <Route path="/wholesaler-products" element={<WholesalerProducts />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/seller/:id" element={<SellerProfile />} />
                      
                      {/* Dashboard Sub-Routes */}
                      <Route path="/dashboard/shops" element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                          <DashboardShops />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/products" element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                          <DashboardProducts />
                        </ProtectedRoute>
                      } />
                      
                      
                      <Route path="/dashboard/orders" element={
                        <ProtectedRoute>
                          <DashboardOrders />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/browse-shops" element={
                        <ProtectedRoute allowedRoles={['seller']}>
                          <DashboardBrowseShops />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/seller-orders" element={
                        <ProtectedRoute allowedRoles={['seller']}>
                          <DashboardSellerOrders />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/wholesaler-orders" element={
                        <ProtectedRoute allowedRoles={['wholesaler']}>
                          <DashboardWholesalerOrders />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/seller-dashboard" element={
                        <ProtectedRoute allowedRoles={['seller']}>
                          <DashboardSellerDashboard />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                          <DashboardAdmin />
                        </ProtectedRoute>
                      } />
                      
                      {/* Policy Pages */}
                      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                      <Route path="/terms-of-service" element={<TermsOfService />} />
                      <Route path="/refund-policy" element={<RefundPolicy />} />
                      <Route path="/shipping-policy" element={<ShippingPolicy />} />
                      
                      {/* Fallback */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AuthProvider>
                </BrowserRouter>
              </div>
            </ErrorBoundary>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
