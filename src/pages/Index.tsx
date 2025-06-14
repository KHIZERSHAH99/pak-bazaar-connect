
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TopBanner from '@/components/home/TopBanner';
import HomeHeader from '@/components/home/HomeHeader';
import HeroSection from '@/components/home/HeroSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CallToActionSection from '@/components/home/CallToActionSection';
import HomeFooter from '@/components/home/HomeFooter';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-green-50 to-pakistani_green-50 dark:from-background dark:via-gray-900 dark:to-gray-800">
      <TopBanner />
      <HomeHeader user={user} />
      <HeroSection />
      <WhyChooseUsSection />
      <FeaturedProducts />
      <CallToActionSection />
      <HomeFooter />
    </div>
  );
};

export default Index;
