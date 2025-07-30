
import React from 'react';
import Layout from '@/components/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';
import InContentAdBanner from '@/components/ads/InContentAdBanner';
import SidebarAdBanner from '@/components/ads/SidebarAdBanner';

const Index: React.FC = () => {
  return (
    <Layout showHeaderAd={true}>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <HeroSection />
              <InContentAdBanner className="my-12" />
              <FeaturedProducts />
              <InContentAdBanner className="my-12" />
              <WhyChooseUsSection />
              <CallToActionSection />
            </div>
            
            {/* Sidebar with Ad */}
            <div className="hidden lg:block w-80 sticky top-4 h-fit">
              <SidebarAdBanner />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
