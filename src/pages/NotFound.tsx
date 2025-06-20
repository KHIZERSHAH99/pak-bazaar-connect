
import React from 'react';
import Layout from '@/components/Layout';
import NotFound from '@/components/ui/NotFound';

const NotFoundPage: React.FC = () => {
  return (
    <Layout>
      <NotFound 
        showSearchButton={true}
        title="Page Not Found"
        description="The page you're looking for doesn't exist. You can browse our products or return to the home page."
      />
    </Layout>
  );
};

export default NotFoundPage;
