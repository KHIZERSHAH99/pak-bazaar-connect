
import React, { Suspense, lazy, memo } from 'react';
import Layout from '@/components/Layout';
import UrduHeroSection from '@/components/home/UrduHeroSection';

// Lazy load below-the-fold components for faster FCP
const FeaturedProducts = lazy(() => import('@/components/home/FeaturedProducts'));
const WhyChooseUsSection = lazy(() => import('@/components/home/WhyChooseUsSection'));
const CallToActionSection = lazy(() => import('@/components/home/CallToActionSection'));

// Lightweight fallback to prevent layout shift
const SimpleFallback = memo(() => <div className="h-96" />);

const Index: React.FC = memo(() => {
  return (
    <Layout>
      <div className="min-h-screen">
        <UrduHeroSection />
        <Suspense fallback={<SimpleFallback />}>
          <FeaturedProducts />
        </Suspense>
        <Suspense fallback={<SimpleFallback />}>
          <WhyChooseUsSection />
        </Suspense>
        <Suspense fallback={<SimpleFallback />}>
          <CallToActionSection />
        </Suspense>
      </div>
    </Layout>
  );
});

Index.displayName = 'Index';

export default Index;
