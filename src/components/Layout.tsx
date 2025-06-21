
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

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
  // Set document title if provided
  React.useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  // Set meta description if provided
  React.useEffect(() => {
    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
    }
  }, [description]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
