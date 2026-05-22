import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import WelcomeOnboarding from '@/components/ui/WelcomeOnboarding';
import DashboardLayout from '@/components/DashboardLayout';
import ShopsManagement from '@/components/dashboard/ShopsManagement';
import WholesalerSummaryStats from '@/components/dashboard/WholesalerSummaryStats';
const Dashboard: React.FC = () => {
  const {
    user,
    profile,
    loading
  } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    // Check if user is new (created in last 24 hours) and hasn't seen onboarding
    if (user && profile && !loading) {
      const userCreated = new Date(user.created_at);
      const now = new Date();
      const hoursSinceCreation = (now.getTime() - userCreated.getTime()) / (1000 * 60 * 60);
      const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.id}`);
      if (hoursSinceCreation < 24 && !hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user, profile, loading]);
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'true');
    }
  };
  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    if (user) {
      localStorage.setItem(`onboarding_${user.id}`, 'true');
    }
  };
  if (loading) {
    return <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground font-poppins">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>;
  }
  if (!user || !profile) {
    return <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 font-poppins">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4 font-poppins">
              Please log in to access your dashboard
            </p>
            <button onClick={() => window.location.href = '/login'} className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 font-poppins">
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>;
  }

  // Redirect all users except admin and existing wholesalers to seller dashboard
  if (profile.role !== 'admin' && profile.role !== 'wholesaler') {
    return <Navigate to="/dashboard/seller-dashboard" replace />;
  }
  const renderDashboard = () => {
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'wholesaler':
        return <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-foreground font-poppins">Wholesaler Dashboard</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2 font-poppins">Manage your shops from the navigation menu</p>
            </div>
            <WholesalerSummaryStats />
            <ShopsManagement />
          </div>;
      case 'seller':
        return <SellerDashboard />;
      default:
        return <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 font-poppins">
              Role Not Assigned
            </h2>
            <p className="text-gray-600 font-poppins">
              Please contact support to get your role assigned.
            </p>
          </div>;
    }
  };
  return <DashboardLayout>
      {renderDashboard()}
      
      {showOnboarding && <WelcomeOnboarding userRole={profile.role} onComplete={handleOnboardingComplete} onSkip={handleSkipOnboarding} />}
    </DashboardLayout>;
};
export default Dashboard;