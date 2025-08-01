
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import SEOHead from '@/components/ui/seo-head';
import { usePageAnalytics } from '@/hooks/usePageAnalytics';

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
      
      <main className="flex-grow">
        {children}
      </main>
      
      <Footer />
    </div>
  );
};

export default Layout;
