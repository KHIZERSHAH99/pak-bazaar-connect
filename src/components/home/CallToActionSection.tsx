
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

const CallToActionSection: React.FC = () => {
  return (
    <section className="py-14 md:py-20 px-2 md:px-6 bg-gradient-to-r from-pakistani_green-600 via-pakistani_green-700 to-green-600 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none"></div>
      <div className="container mx-auto text-center relative">
        <div className="flex justify-center mb-5 md:mb-6">
          <div className="bg-white/20 p-3 md:p-4 rounded-full backdrop-blur-sm">
            <Zap className="h-10 w-10 md:h-12 md:w-12 text-white" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-2xl xs:text-3xl md:text-4xl font-bold mb-3 md:mb-4 font-poppins">
          Ready to Transform Your Business?
        </h2>
        <p className="text-base md:text-xl mb-5 md:mb-8 max-w-2xl mx-auto font-poppins opacity-90">
          Join Pakistan's fastest-growing B2B marketplace. Get started in minutes with our simple registration process.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <Link to="/signup" aria-label="Create Free Account" tabIndex={0}>
            <Button
              size="lg"
              className="bg-white text-pakistani_green-700 hover:bg-gray-100 px-8 py-4 text-lg font-bold font-poppins shadow-2xl hover:shadow-3xl transition-all duration-300 ring-2 ring-transparent focus-visible:ring-pakistani_green-300 focus-visible:ring-4"
            >
              Create Free Account
            </Button>
          </Link>
          <Link to="/products" aria-label="Explore Marketplace" tabIndex={0}>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white hover:bg-white/10 px-8 py-4 text-lg font-poppins backdrop-blur-sm text-pakistani_green-950 ring-2 ring-transparent focus-visible:ring-pakistani_green-300 focus-visible:ring-4"
            >
              Explore Marketplace
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
export default CallToActionSection;
