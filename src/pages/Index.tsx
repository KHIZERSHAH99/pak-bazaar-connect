
import React from 'react';
import Layout from '@/components/Layout';
import InContentAd from '@/components/ads/InContentAd';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        
        {/* Homepage Top Ad */}
        <InContentAd slotId="homepage-top" />
        
        <FeaturedProducts />
        
        {/* Homepage Middle Ad */}
        <InContentAd slotId="homepage-middle" />
        
        <WhyChooseUsSection />
        
        {/* Homepage Bottom Ad */}
        <InContentAd slotId="homepage-bottom" />
        
        <CallToActionSection />
      </div>
    </Layout>
  );
};

export default Index;
