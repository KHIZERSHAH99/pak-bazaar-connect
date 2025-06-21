
import React from 'react';
import { useAuth } from '@/contexts/AuthContextEnhanced';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import WholesalerDashboard from '@/components/dashboard/WholesalerDashboard';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import PendingDashboard from '@/components/dashboard/PendingDashboard';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FixedDashboard: React.FC = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pakistani_green-700"></div>
      </div>
    );
  }

  const renderDashboardContent = () => {
    if (!profile || profile.role === 'pending') {
      return <PendingDashboard />;
    }
    
    switch (profile.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'wholesaler':
        return <WholesalerDashboard />;
      case 'seller':
        return <SellerDashboard />;
      default:
        return <PendingDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {renderDashboardContent()}
      </main>
      <Footer />
    </div>
  );
};

export default FixedDashboard;
