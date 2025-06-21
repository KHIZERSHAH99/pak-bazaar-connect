
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContextFixed";
import ErrorBoundary from "@/components/ui/ErrorBoundary";

// Lazy load components
const Index = lazy(() => import("@/pages/Index"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Products = lazy(() => import("@/pages/Products"));
const Sellers = lazy(() => import("@/pages/Sellers"));
const Profile = lazy(() => import("@/pages/Profile"));
const AdminPanel = lazy(() => import("@/pages/AdminPanel"));

// Dashboard pages
const DashboardShops = lazy(() => import("@/pages/dashboard/DashboardShops"));
const DashboardProducts = lazy(() => import("@/pages/dashboard/DashboardProducts"));
const DashboardAds = lazy(() => import("@/pages/dashboard/DashboardAds"));
const DashboardBrowseShops = lazy(() => import("@/pages/dashboard/DashboardBrowseShops"));
const ShopProducts = lazy(() => import("@/pages/dashboard/ShopProducts"));

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sellers" element={<Sellers />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/dashboard/shops" element={<DashboardShops />} />
                <Route path="/dashboard/products" element={<DashboardProducts />} />
                <Route path="/dashboard/ads" element={<DashboardAds />} />
                <Route path="/dashboard/browse-shops" element={<DashboardBrowseShops />} />
                <Route path="/dashboard/shop/:shopId/products" element={<ShopProducts />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
