import React, { memo } from 'react';
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

const Layout: React.FC<LayoutProps> = memo(({ 
  children, 
  title,
  description,
  keywords
}) => {
  // Only track analytics in production - deferred to not block render
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      const timer = setTimeout(() => {
        usePageAnalytics();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-200 overflow-x-hidden">
      <SEOHead 
        title={title}
        description={description}
        keywords={keywords}
      />
      <Navbar />
      
      <main className="flex-grow overflow-x-hidden">
        {children}
      </main>
      
      <Footer />
    </div>
  );
});

Layout.displayName = 'Layout';

export default Layout;
