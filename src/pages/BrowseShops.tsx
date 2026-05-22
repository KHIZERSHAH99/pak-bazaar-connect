import React from 'react';
import BrowseShops from '@/components/dashboard/BrowseShops';
import Layout from '@/components/Layout';

const PublicBrowseShops: React.FC = () => {
  return (
    <Layout 
      title="Browse Wholesalers - PakMandi"
      description="Discover verified wholesale suppliers across Pakistan"
    >
      <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-br from-primary/5 via-background to-primary/10 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8">
          <BrowseShops />
        </div>
      </div>
    </Layout>
  );
};

export default PublicBrowseShops;
