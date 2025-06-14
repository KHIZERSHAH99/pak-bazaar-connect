
import React, { useState } from 'react';
import { useAuth, LoadingScreen } from '@/contexts/AuthContext'; // Combined imports
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardSidebar from './dashboard/layout/DashboardSidebar';
import MobileBottomToggle from './dashboard/layout/MobileBottomToggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { profile, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLinkClick = () => {
    setSidebarOpen(false); // Close sidebar on link click for mobile
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex flex-grow">
        <MobileBottomToggle isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

        <DashboardSidebar
          profile={profile}
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          onLinkClick={handleLinkClick}
        />

        {/* Semi-transparent overlay on mobile when sidebar is open */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        <main className="flex-grow p-4 md:p-6 bg-gray-50 dark:bg-slate-950">
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
