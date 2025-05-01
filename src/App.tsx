
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

// Admin pages
import RoleApprovals from "./pages/admin/RoleApprovals";
import AdApprovals from "./pages/admin/AdApprovals";

// Wholesaler pages
import Shops from "./pages/wholesaler/Shops";
import Products from "./pages/wholesaler/Products";
import Advertisements from "./pages/wholesaler/Advertisements";
import SellerDashboard from "./pages/wholesaler/SellerDashboard";

// Seller pages
import BrowseShops from "./pages/seller/BrowseShops";
import ShopProducts from "./pages/seller/ShopProducts";

// Common pages
import ChatSupport from "./pages/ChatSupport";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public pages */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected pages */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Admin pages */}
            <Route path="/dashboard/role-approvals" element={<RoleApprovals />} />
            <Route path="/dashboard/ad-approvals" element={<AdApprovals />} />

            {/* Wholesaler pages */}
            <Route path="/dashboard/shops" element={<Shops />} />
            <Route path="/dashboard/products" element={<Products />} />
            <Route path="/dashboard/ads" element={<Advertisements />} />
            <Route path="/dashboard/wholesaler-orders" element={<Dashboard />} />
            <Route path="/dashboard/seller-dashboard" element={<SellerDashboard />} />

            {/* Seller pages */}
            <Route path="/dashboard/browse-shops" element={<BrowseShops />} />
            <Route path="/dashboard/browse-shops/:shopId" element={<ShopProducts />} />
            <Route path="/dashboard/orders" element={<Dashboard />} />

            {/* Common pages */}
            <Route path="/dashboard/chat" element={<ChatSupport />} />

            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
