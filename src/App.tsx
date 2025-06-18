
import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { LoadingScreen } from '@/contexts/AuthContext';
import './App.css';

// Lazy load components for better performance
const Home = lazy(() => import('@/pages/Home'));
const Login = lazy(() => import('@/pages/Login'));
const Signup = lazy(() => import('@/pages/Signup'));
const Profile = lazy(() => import('@/pages/Profile'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const AdminPanel = lazy(() => import('@/pages/admin/AdminPanel'));

// Dashboard components
const DashboardShops = lazy(() => import('@/pages/dashboard/DashboardShops'));
const DashboardProducts = lazy(() => import('@/pages/dashboard/DashboardProducts'));
const DashboardAds = lazy(() => import('@/pages/dashboard/DashboardAds'));
const DashboardOrders = lazy(() => import('@/pages/dashboard/DashboardOrders'));
const DashboardChat = lazy(() => import('@/pages/dashboard/DashboardChat'));
const DashboardAdApprovals = lazy(() => import('@/pages/dashboard/DashboardAdApprovals'));
const DashboardBrowseShops = lazy(() => import('@/pages/dashboard/DashboardBrowseShops'));
const DashboardSellerOrders = lazy(() => import('@/pages/dashboard/DashboardSellerOrders'));
const DashboardWholesalerOrders = lazy(() => import('@/pages/dashboard/DashboardWholesalerOrders'));
const DashboardSellerDashboard = lazy(() => import('@/pages/dashboard/DashboardSellerDashboard'));

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <LanguageProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/dashboard/ad-approvals" element={<DashboardAdApprovals />} />
                  
                  {/* Wholesaler Routes */}
                  <Route path="/dashboard/shops" element={<DashboardShops />} />
                  <Route path="/dashboard/products" element={<DashboardProducts />} />
                  <Route path="/dashboard/ads" element={<DashboardAds />} />
                  <Route path="/dashboard/wholesaler-orders" element={<DashboardWholesalerOrders />} />
                  
                  {/* Seller Routes */}
                  <Route path="/dashboard/browse-shops" element={<DashboardBrowseShops />} />
                  <Route path="/dashboard/seller-orders" element={<DashboardSellerOrders />} />
                  <Route path="/dashboard/seller-dashboard" element={<DashboardSellerDashboard />} />
                  
                  {/* Common Routes */}
                  <Route path="/dashboard/chat" element={<DashboardChat />} />
                  <Route path="/dashboard/orders" element={<DashboardOrders />} />
                </Routes>
              </Suspense>
              <Toaster />
            </div>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
