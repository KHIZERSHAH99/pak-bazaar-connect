
import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <HeroSection />
        <FeaturedProducts />
        <WhyChooseUsSection />
        <CallToActionSection />
      </div>
    </Layout>
  );
};

export default Index;
