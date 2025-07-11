
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextFixed';
import { Loader2 } from 'lucide-react';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import RestoredWholesalerDashboard from '@/components/dashboard/RestoredWholesalerDashboard';
import RestoredSellerDashboard from '@/components/dashboard/RestoredSellerDashboard';
import WelcomeOnboarding from '@/components/ui/WelcomeOnboarding';
import RestoredDashboardLayout from '@/components/dashboard/RestoredDashboardLayout';

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
      <RestoredDashboardLayout>
        <div className="flex justify-center items-center min-h-96">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-pakistani_green-600 mx-auto mb-4" />
            <p className="text-gray-600 font-poppins">Loading your dashboard...</p>
          </div>
        </div>
      </RestoredDashboardLayout>
    );
  }

  if (!user || !profile) {
    return (
      <RestoredDashboardLayout>
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
      </RestoredDashboardLayout>
    );
  }

  const renderDashboard = () => {
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'wholesaler':
        return <RestoredWholesalerDashboard />;
      case 'seller':
        return <RestoredSellerDashboard />;
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
    <RestoredDashboardLayout>
      {renderDashboard()}
      
      {showOnboarding && (
        <WelcomeOnboarding
          userRole={profile.role}
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
        />
      )}
    </RestoredDashboardLayout>
  );
};

export default Dashboard;
