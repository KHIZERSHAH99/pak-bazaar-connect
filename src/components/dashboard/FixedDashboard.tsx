
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import ShopsManagement from '@/components/dashboard/ShopsManagement';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import PendingDashboard from '@/components/dashboard/PendingDashboard';
import EnhancedWelcomeOnboarding from '@/components/ui/EnhancedWelcomeOnboarding';

const FixedDashboard: React.FC = () => {
  const { profile, loading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Only show tutorial for first-time users
    if (profile && (profile.role === 'wholesaler' || profile.role === 'seller')) {
      const tutorialCompleted = localStorage.getItem('tutorial_completed');
      const hasSeenTutorial = localStorage.getItem(`tutorial_seen_${profile.id}`);
      
      // Show tutorial only if it hasn't been completed globally 
      // AND user hasn't seen it before (prevents showing on every login)
      if (!tutorialCompleted && !hasSeenTutorial) {
        setShowOnboarding(true);
        // Mark that this user has seen the tutorial
        localStorage.setItem(`tutorial_seen_${profile.id}`, 'true');
      }
    }
  }, [profile]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('tutorial_completed', 'true');
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    localStorage.setItem('tutorial_completed', 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pakistani_green-700"></div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    if (!profile) return <PendingDashboard />;
    
    // Show role selection for pending users
    if (!profile.role || profile.role === 'pending') {
      return <PendingDashboard />;
    }
    
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'wholesaler':
        return (
          <div className="space-y-6 p-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-poppins">Wholesaler Dashboard</h1>
              <p className="text-muted-foreground mt-2 font-poppins">Manage your shops and products from the navigation menu</p>
            </div>
            <ShopsManagement />
          </div>
        );
      case 'seller':
        return <SellerDashboard />;
      default:
        return <PendingDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderDashboardContent()}
      
      {/* Show onboarding only for first-time users */}
      {showOnboarding && profile?.role && (profile.role === 'wholesaler' || profile.role === 'seller') && (
        <EnhancedWelcomeOnboarding
          userRole={profile.role}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
};

export default FixedDashboard;
