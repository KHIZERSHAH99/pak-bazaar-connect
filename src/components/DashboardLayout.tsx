
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContextFixed';
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardSidebar from './dashboard/DashboardSidebar';
import SEOHead from '@/components/ui/seo-head';
import PerformanceMonitor from '@/components/ui/performance-monitor';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { LoadingScreen } from '@/contexts/AuthContextFixed';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title = 'Dashboard - Pak Bazaar Connect',
  description = 'Manage your business operations on Pakistan\'s leading B2B marketplace platform.'
}) => {
  const { loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  usePageAnalytics();

  if (loading) {
    return <LoadingScreen />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-white via-emerald-50/30 to-emerald-100/20 dark:from-emerald-950 dark:via-emerald-900/50 dark:to-emerald-800/30">
      <SEOHead title={title} description={description} />
      <Navbar />
      <div className="flex flex-grow relative">
        {/* Mobile sidebar toggle button - improved positioning */}
        <div className="md:hidden fixed bottom-6 right-6 z-30">
          <Button 
            className="rounded-full w-12 h-12 flex items-center justify-center bg-pakistani_green-700 hover:bg-pakistani_green-800 shadow-xl border-2 border-white/20 dark:border-emerald-100/20 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <DashboardSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Improved overlay with blur effect */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-10 md:hidden backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)} 
            aria-hidden="true"
          />
        )}

        <main className="flex-grow p-4 md:p-6 bg-transparent overflow-auto">
          <div className="container mx-auto max-w-7xl">
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <PerformanceMonitor />
    </div>
  );
};

export default DashboardLayout;
