
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import WholesalerDashboard from '@/components/dashboard/WholesalerDashboard';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import WelcomeOnboarding from '@/components/ui/WelcomeOnboarding';
import DashboardLayout from '@/components/DashboardLayout';

const Dashboard: React.FC = () => {
  const { user, profile, loading } = useAuth();
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
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-pakistani_green-600 mx-auto mb-4" />
            <p className="text-gray-600 font-poppins">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !profile) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 font-poppins">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4 font-poppins">
              Please log in to access your dashboard
            </p>
            <button
              onClick={() => window.location.href = '/login'}
              className="bg-pakistani_green-600 text-white px-4 py-2 rounded-lg hover:bg-pakistani_green-700 font-poppins"
            >
              Go to Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'wholesaler':
        return <WholesalerDashboard />;
      case 'seller':
        return <SellerDashboard />;
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2 font-poppins">
              Role Not Assigned
            </h2>
            <p className="text-gray-600 font-poppins">
              Please contact support to get your role assigned.
            </p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout>
      {renderDashboard()}
      
      {showOnboarding && (
        <WelcomeOnboarding
          userRole={profile.role}
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
