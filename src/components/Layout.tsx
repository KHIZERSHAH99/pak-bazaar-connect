
import React from 'react';
import { Helmet } from 'react-helmet';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

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
  const defaultTitle = 'Pak Bazaar Connect - Pakistan\'s Leading B2B Marketplace';
  const defaultDescription = 'Connect wholesalers and retailers across Pakistan. Discover quality products, build lasting business relationships, and grow your business with trusted suppliers.';
  const defaultKeywords = 'pakistan, b2b, marketplace, wholesale, retail, suppliers, products, karachi, lahore, islamabad';

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Helmet>
          <title>{title || defaultTitle}</title>
          <meta name="description" content={description || defaultDescription} />
          <meta name="keywords" content={keywords || defaultKeywords} />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta property="og:title" content={title || defaultTitle} />
          <meta property="og:description" content={description || defaultDescription} />
          <meta property="og:type" content="website" />
          <link rel="canonical" href={window.location.href} />
        </Helmet>
        
        <Navbar />
        
        <main className="flex-1 w-full">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
        
        <Footer />
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
