
import React from 'react';
import Layout from '@/components/Layout';
import LiveAdUnit from '@/components/ads/LiveAdUnit';
import UrduHeroSection from '@/components/home/UrduHeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';

const Index: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen">
        <UrduHeroSection />
        
        {/* Homepage Top Ad - Live from Adsterra */}
        <div className="my-8 flex justify-center">
          <LiveAdUnit placement="homepage-top" size="leaderboard" />
        </div>
        
        <FeaturedProducts />
        
        {/* Homepage Middle Ad - Live from Adsterra */}
        <div className="my-8 flex justify-center">
          <LiveAdUnit placement="homepage-middle" size="rectangle" />
        </div>
        
        <WhyChooseUsSection />
        
        {/* Homepage Bottom Ad - Live from Adsterra */}
        <div className="my-8 flex justify-center">
          <LiveAdUnit placement="homepage-bottom" size="banner" />
        </div>
        
        <CallToActionSection />
      </div>
    </Layout>
  );
};

export default Index;
