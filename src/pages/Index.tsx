
import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';
import InlineContentAd from '@/components/ads/InlineContentAd';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        <InlineContentAd />
        <FeaturedProducts />
        <InlineContentAd />
        <WhyChooseUsSection />
        <CallToActionSection />
      </div>
    </Layout>
  );
};

export default Index;
