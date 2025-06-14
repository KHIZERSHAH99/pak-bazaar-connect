
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Award } from 'lucide-react';
import StatsDisplay from './StatsDisplay';

const HeroSection: React.FC = () => {
  return (
    <section className="relative py-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-pakistani_green-600/10 via-transparent to-green-600/10"></div>
      <div className="container mx-auto text-center relative">
        <Badge className="mb-6 px-4 py-2 bg-gradient-to-r from-pakistani_green-100 to-green-100 text-pakistani_green-800 border-pakistani_green-200 font-poppins">
          <Award className="w-4 h-4 mr-2" />
          Pakistan's Leading B2B Marketplace
        </Badge>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-poppins">
          <span className="bg-gradient-to-r from-pakistani_green-800 via-pakistani_green-600 to-green-600 bg-clip-text text-transparent">
            Connect, Trade & Grow
          </span>
          <br />
          <span className="text-gray-800">Your Business</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed font-poppins">
          Join thousands of Pakistani businesses trading on our secure platform. Verified sellers, and instant payments.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link to="/signup">
            <Button size="lg" className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 text-white px-8 py-4 text-lg font-poppins shadow-2xl hover:shadow-3xl transition-all duration-300 group">
              Start Trading Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link to="/products">
            <Button variant="outline" size="lg" className="border-2 border-pakistani_green-600 text-pakistani_green-700 hover:bg-pakistani_green-50 px-8 py-4 text-lg font-poppins">
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
