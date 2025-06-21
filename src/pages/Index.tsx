
import React from 'react';
import { useAuth } from '@/contexts/AuthContextOptimized';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import CallToActionSection from '@/components/home/CallToActionSection';
import TopBanner from '@/components/home/TopBanner';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <TopBanner />
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <FeaturedProducts />
        <WhyChooseUsSection />
        <CallToActionSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
