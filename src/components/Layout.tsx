
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SEOHead from '@/components/ui/seo-head';
import PerformanceMonitor from '@/components/ui/performance-monitor';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  showHeaderAd?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title,
  description,
  keywords,
  showHeaderAd = false
}) => {
  usePageAnalytics();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200">
      <SEOHead 
        title={title}
        description={description}
        keywords={keywords}
      />
      <Navbar />
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
      <PerformanceMonitor />
    </div>
  );
};

export default Layout;
