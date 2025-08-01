
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SEOHead from '@/components/ui/seo-head';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';
import TallSidebarAd from './ads/TallSidebarAd';
import MobileTopBanner from './ads/MobileTopBanner';
import MobileBottomBanner from './ads/MobileBottomBanner';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title,
  description,
  keywords
}) => {
  // Only track analytics in production or when explicitly needed
  if (process.env.NODE_ENV === 'development') {
    usePageAnalytics();
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      <SEOHead 
        title={title}
        description={description}
        keywords={keywords}
      />
      <Navbar />
      <MobileTopBanner />
      
      <div className="flex flex-grow">
        {/* Left sidebar ad - desktop only */}
        <div className="hidden xl:block w-[180px] flex-shrink-0">
          <div className="p-2">
            <TallSidebarAd />
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-grow max-w-none">
          {children}
        </main>
        
        {/* Right sidebar ad - desktop only */}
        <div className="hidden xl:block w-[180px] flex-shrink-0">
          <div className="p-2">
            <TallSidebarAd />
          </div>
        </div>
      </div>
      
      <MobileBottomBanner />
      <Footer />
    </div>
  );
};

export default Layout;
