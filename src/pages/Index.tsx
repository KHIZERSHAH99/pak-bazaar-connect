
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import TopBanner from '@/components/home/TopBanner';
import HeroSection from '@/components/home/HeroSection';
import WhyChooseUsSection from '@/components/home/WhyChooseUsSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CallToActionSection from '@/components/home/CallToActionSection';

const Index = () => {
  const { user } = useAuth();

  return (
    <Layout
      title="Pak Bazaar Connect - Pakistan's Leading B2B Marketplace"
      description="Connect wholesalers and retailers across Pakistan. Discover quality products, build lasting business relationships, and grow your business with trusted suppliers."
      keywords="pakistan, b2b, marketplace, wholesale, retail, suppliers, products, karachi, lahore, islamabad, faisalabad, sialkot"
    >
      <div className="min-h-screen bg-gradient-to-b from-background via-green-50/20 dark:via-green-950/20 to-pakistani_green-50/20 dark:to-pakistani_green-950/30">
        <TopBanner />
        <HeroSection />
        <WhyChooseUsSection />
        <FeaturedProducts />
        <CallToActionSection />
      </div>
    </Layout>
  );
};

export default Index;
