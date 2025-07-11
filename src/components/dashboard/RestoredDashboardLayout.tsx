
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextFixed';
import Navbar from '../Navbar';
import Footer from '../Footer';
import RestoredDashboardSidebar from './RestoredDashboardSidebar';
import SEOHead from '@/components/ui/seo-head';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { LoadingScreen } from '@/contexts/AuthContextFixed';

interface RestoredDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const RestoredDashboardLayout: React.FC<RestoredDashboardLayoutProps> = ({ 
  children, 
  title = 'Dashboard - Pak Bazaar Connect',
  description = 'Manage your business operations on Pakistan\'s leading B2B marketplace platform.'
}) => {
  const { loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={title} description={description} />
      <Navbar />
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:pt-16 lg:z-30">
          <RestoredDashboardSidebar 
            sidebarOpen={true}
            setSidebarOpen={() => {}}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 flex z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
              <RestoredDashboardSidebar 
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 lg:pl-64">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 font-poppins">Dashboard</h1>
            <div className="w-8" />
          </div>

          {/* Content Area */}
          <main className="flex-1 p-4 lg:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default RestoredDashboardLayout;
