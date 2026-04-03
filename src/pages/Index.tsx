import React from 'react';
import Layout from '@/components/Layout';
import UrduHeroSection from '@/components/home/UrduHeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';
import RecentlyViewedProducts from '@/components/home/RecentlyViewedProducts';

const Index: React.FC = () => {
  return (
    <Layout
      title="PakMandi - Pakistan's B2B Wholesale Marketplace"
      description="Connect with verified wholesalers and retailers across Pakistan. Browse products, place bulk orders, and grow your business on Pakistan's leading B2B platform."
    >
      <div className="min-h-screen">
        <UrduHeroSection />
        <FeaturedProducts />
        <RecentlyViewedProducts />
        <WhyChooseUsSection />
        <CallToActionSection />
      </div>
    </Layout>
  );
};

export default Index;
