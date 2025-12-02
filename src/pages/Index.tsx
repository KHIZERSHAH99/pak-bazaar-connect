
import React from 'react';
import Layout from '@/components/Layout';
import UrduHeroSection from '@/components/home/UrduHeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';
import InContentAd from '@/components/ads/InContentAd';
import NativeAd from '@/components/ads/NativeAd';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <UrduHeroSection />
        
        {/* Ad after hero - high visibility */}
        <InContentAd variant="horizontal" />
        
        <FeaturedProducts />
        
        {/* Native ad blends with content */}
        <div className="container mx-auto px-4">
          <NativeAd />
        </div>
        
        <WhyChooseUsSection />
        
        {/* Square ad - good CPM */}
        <div className="flex justify-center py-4">
          <InContentAd variant="square" />
        </div>
        
        <CallToActionSection />
      </div>
    </Layout>
  );
};

export default Index;
