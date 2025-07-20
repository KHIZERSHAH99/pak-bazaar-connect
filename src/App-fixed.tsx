
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextFixed";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

// Import pages
import Index from '@/pages/Index';
import FixedLogin from '@/pages/FixedLogin';
import FixedSignup from '@/pages/FixedSignup';
import Profile from '@/pages/Profile';
import Stats from '@/pages/Stats';
import Chat from '@/pages/Chat';
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
import DashboardAds from '@/pages/dashboard/DashboardAds';
import DashboardOrders from '@/pages/dashboard/DashboardOrders';
import DashboardChat from '@/pages/dashboard/DashboardChat';
import DashboardAdApprovals from '@/pages/dashboard/DashboardAdApprovals';
import DashboardBrowseShops from '@/pages/dashboard/DashboardBrowseShops';
import DashboardSellerOrders from '@/pages/dashboard/DashboardSellerOrders';
import DashboardWholesalerOrders from '@/pages/dashboard/DashboardWholesalerOrders';
import DashboardSellerDashboard from '@/pages/dashboard/DashboardSellerDashboard';
import DashboardAdmin from '@/pages/dashboard/DashboardAdmin';

// Components
import FixedProtectedRoute from '@/components/FixedProtectedRoute';
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
                        <FixedProtectedRoute>
                          <FixedDashboard />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/profile" element={
                        <FixedProtectedRoute>
                          <Profile />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/stats" element={
                        <FixedProtectedRoute>
                          <Stats />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/chat" element={
                        <FixedProtectedRoute>
                          <Chat />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/messages" element={
                        <FixedProtectedRoute>
                          <Messages />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/analytics" element={
                        <FixedProtectedRoute>
                          <Analytics />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/favorites" element={
                        <FixedProtectedRoute>
                          <Favorites />
                        </FixedProtectedRoute>
                      } />
                      
                      {/* Admin Routes */}
                      <Route path="/admin" element={
                        <FixedProtectedRoute allowedRoles={['admin']}>
                          <AdminDashboard />
                        </FixedProtectedRoute>
                      } />
                      
                      {/* Marketplace Pages */}
                      <Route path="/products" element={<Products />} />
                      
                      <Route path="/features" element={<Features />} />
                      <Route path="/wholesaler-products" element={<WholesalerProducts />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/seller/:id" element={<SellerProfile />} />
                      
                      {/* Dashboard Sub-Routes */}
                      <Route path="/dashboard/shops" element={
                        <FixedProtectedRoute allowedRoles={['wholesaler']}>
                          <DashboardShops />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/products" element={
                        <FixedProtectedRoute allowedRoles={['wholesaler']}>
                          <DashboardProducts />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/ads" element={
                        <FixedProtectedRoute allowedRoles={['wholesaler']}>
                          <DashboardAds />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/orders" element={
                        <FixedProtectedRoute>
                          <DashboardOrders />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/chat" element={
                        <FixedProtectedRoute>
                          <DashboardChat />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/ad-approvals" element={
                        <FixedProtectedRoute allowedRoles={['admin']}>
                          <DashboardAdApprovals />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/browse-shops" element={
                        <FixedProtectedRoute allowedRoles={['seller']}>
                          <DashboardBrowseShops />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/seller-orders" element={
                        <FixedProtectedRoute allowedRoles={['seller']}>
                          <DashboardSellerOrders />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/wholesaler-orders" element={
                        <FixedProtectedRoute allowedRoles={['wholesaler']}>
                          <DashboardWholesalerOrders />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/seller-dashboard" element={
                        <FixedProtectedRoute allowedRoles={['seller']}>
                          <DashboardSellerDashboard />
                        </FixedProtectedRoute>
                      } />
                      
                      <Route path="/dashboard/admin" element={
                        <FixedProtectedRoute allowedRoles={['admin']}>
                          <DashboardAdmin />
                        </FixedProtectedRoute>
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
