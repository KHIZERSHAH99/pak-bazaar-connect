import React, { useState } from 'react';
import { useAuth, LoadingScreen } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardSidebar from './dashboard/DashboardSidebar';
import SEOHead from '@/components/ui/seo-head';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import MadadButton from '@/components/common/MadadButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title = 'Dashboard - PakMandi',
  description = 'Manage your business operations on Pakistan\'s leading B2B marketplace platform.'
}) => {
  const { loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEOHead title={title} description={description} />
      <Navbar />
      <div className="flex flex-grow relative">
        <div className="md:hidden fixed top-[4.5rem] left-2 z-30">
          <Button 
            className="rounded-lg w-10 h-10 flex items-center justify-center bg-card border border-border shadow-lg hover:bg-accent transition-all duration-200 hover:scale-105" 
            onClick={toggleSidebar} 
            size="icon"
            variant="outline"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        <DashboardSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setSidebarOpen(false)} 
            aria-hidden="true" 
          />
        )}

        <main className="flex-grow p-2 sm:p-3 md:p-6 overflow-auto bg-background">
          <div className="container mx-auto max-w-7xl md:pl-0">
            <div className="animate-fadeIn">
              {children}
            </div>
          </div>
        </main>
      </div>
      <MadadButton />
    </div>
  );
};

export default DashboardLayout;