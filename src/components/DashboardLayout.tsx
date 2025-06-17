
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import DashboardSidebar from './dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { LoadingScreen } from '@/contexts/AuthContext';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return <LoadingScreen />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-grow">
        {/* Mobile sidebar toggle button - positioned better for accessibility */}
        <div className="md:hidden fixed bottom-6 right-6 z-30">
          <Button 
            className="rounded-full w-14 h-14 flex items-center justify-center bg-primary hover:bg-primary/90 shadow-xl border-2 border-background"
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        <DashboardSidebar 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Improved overlay with better backdrop blur */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-10 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)} 
            aria-hidden="true"
          />
        )}

        <main className="flex-grow p-4 md:p-6 bg-background">
          <div className="container mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
