
import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';
import HeaderAdBanner from '@/components/ads/HeaderAdBanner';
import InContentAdBanner from '@/components/ads/InContentAdBanner';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <HeaderAdBanner />
        <HeroSection />
        <InContentAdBanner className="my-12" />
        <FeaturedProducts />
        <InContentAdBanner className="my-12" />
        <WhyChooseUsSection />
        <CallToActionSection />
      </div>
    </Layout>
  );
};

export default Index;
