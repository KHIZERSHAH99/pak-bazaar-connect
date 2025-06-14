
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Award } from 'lucide-react';
import StatsDisplay from './StatsDisplay';

const HeroSection: React.FC = () => {
  return (
    <section className="relative py-16 px-3 md:py-20 md:px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-pakistani_green-600/10 via-transparent to-green-600/10 pointer-events-none" />
      <div className="container mx-auto text-center relative">
        <Badge className="mb-5 md:mb-6 px-4 py-2 bg-gradient-to-r from-pakistani_green-100 to-green-100 dark:from-pakistani_green-900/50 dark:to-green-900/50 text-pakistani_green-800 dark:text-pakistani_green-200 border-pakistani_green-200 dark:border-pakistani_green-700 font-poppins">
          <Award className="w-4 h-4 mr-2 inline-block" aria-hidden="true" />
          Pakistan's Leading B2B Marketplace
        </Badge>
        <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-6xl font-bold mb-5 md:mb-6 font-poppins leading-tight md:leading-snug text-balance">
          <span className="bg-gradient-to-r from-pakistani_green-800 via-pakistani_green-600 to-green-600 bg-clip-text text-transparent block">
            Connect, Trade & Grow
          </span>
          <span className="text-foreground block">Your Business</span>
        </h1>
        <p className="text-base xs:text-lg md:text-2xl text-muted-foreground mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed font-poppins">
          Join thousands of Pakistani businesses trading on our secure platform. Verified sellers, and instant payments.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center mb-8 md:mb-12">
          <Link to="/signup" tabIndex={0} aria-label="Start Trading Now – Sign up" className="group focus:outline-none">
            <Button
              size="lg"
              className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 text-white px-8 py-4 text-lg font-poppins shadow-2xl hover:shadow-3xl transition-all duration-300 ring-2 ring-transparent focus-visible:ring-pakistani_green-300 focus-visible:ring-4"
            >
              Start Trading Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Button>
          </Link>
          <Link to="/products" tabIndex={0} aria-label="Browse Products" className="group focus:outline-none">
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-pakistani_green-600 text-pakistani_green-700 hover:bg-pakistani_green-50 dark:border-pakistani_green-400 dark:text-pakistani_green-400 dark:hover:bg-pakistani_green-950/50 px-8 py-4 text-lg font-poppins ring-2 ring-transparent focus-visible:ring-pakistani_green-300 focus-visible:ring-4"
            >
              Browse Products
            </Button>
          </Link>
        </div>
        <StatsDisplay />
      </div>
    </section>
  );
};
export default HeroSection;
