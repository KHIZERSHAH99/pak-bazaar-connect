
import React, { Suspense, lazy } from 'react';
import Layout from '@/components/Layout';
import UrduHeroSection from '@/components/home/UrduHeroSection';

// Lazy load below-the-fold components for faster FCP
const FeaturedProducts = lazy(() => import('@/components/home/FeaturedProducts'));
const WhyChooseUsSection = lazy(() => import('@/components/home/WhyChooseUsSection'));
const CallToActionSection = lazy(() => import('@/components/home/CallToActionSection'));

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <UrduHeroSection />
        <Suspense fallback={<div className="h-96" />}>
          <FeaturedProducts />
        </Suspense>
        <Suspense fallback={<div className="h-96" />}>
          <WhyChooseUsSection />
        </Suspense>
        <Suspense fallback={<div className="h-64" />}>
          <CallToActionSection />
        </Suspense>
      </div>
    </Layout>
  );
};

export default Index;
