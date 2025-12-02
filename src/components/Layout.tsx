import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SEOHead from '@/components/ui/seo-head';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';
import SidebarAd from '@/components/ads/SidebarAd';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  showSidebarAds?: boolean;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title,
  description,
  keywords,
  showSidebarAds = false
}) => {
  // Only track analytics in production or when explicitly needed
  if (process.env.NODE_ENV === 'development') {
    usePageAnalytics();
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200 overflow-x-hidden">
      <SEOHead title={title} description={description} keywords={keywords} />
      <Navbar />
      
      {/* Sidebar ads for desktop - only on enabled pages */}
      {showSidebarAds && <SidebarAd position="right" />}
      
      <main className="flex-grow overflow-x-hidden">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;