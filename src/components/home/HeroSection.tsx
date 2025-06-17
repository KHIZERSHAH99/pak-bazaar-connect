
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, Users, TrendingUp, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

const HeroSection = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <section className="relative py-20 bg-gradient-to-br from-pakistani_green-50 via-green-50 to-pakistani_green-100 dark:from-pakistani_green-950 dark:via-green-950 dark:to-pakistani_green-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-pakistani_green-100 dark:bg-pakistani_green-900/50 border border-pakistani_green-200 dark:border-pakistani_green-800 mb-8">
            <Shield className="h-4 w-4 text-pakistani_green-700 dark:text-pakistani_green-300 mr-2" />
            <span className="text-sm font-medium text-pakistani_green-800 dark:text-pakistani_green-200 font-poppins">
              Pakistan's Leading B2B Marketplace
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 font-poppins">
            <span className="text-pakistani_green-700 dark:text-pakistani_green-400">Connect, Trade & Grow</span>
            <br />
            <span className="text-gray-900 dark:text-white">Your Business</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed font-poppins">
            Join thousands of Pakistani businesses trading on our secure platform. 
            Verified sellers, and instant payments.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button size="lg" className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 font-poppins">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" size="lg" className="border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 dark:border-pakistani_green-400 dark:text-pakistani_green-400 dark:hover:bg-pakistani_green-950/50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 font-poppins">
                    Browse Products
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link to="/signup">
                  <Button size="lg" className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 font-poppins">
                    Start Trading Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/products">
                  <Button variant="outline" size="lg" className="border-pakistani_green-600 text-pakistani_green-600 hover:bg-pakistani_green-50 dark:border-pakistani_green-400 dark:text-pakistani_green-400 dark:hover:bg-pakistani_green-950/50 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 font-poppins">
                    Browse Products
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">10,000+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Active Businesses</div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center mb-3">
                <div className="h-8 w-8 rounded-full bg-pakistani_green-100 dark:bg-pakistani_green-900 flex items-center justify-center">
                  <span className="text-pakistani_green-600 dark:text-pakistani_green-400 text-sm font-bold">🌍</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">500+</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Cities Covered</div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="h-8 w-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">2.5%</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Low Commission</div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 dark:border-gray-700/20">
              <div className="flex items-center justify-center mb-3">
                <Shield className="h-8 w-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">24/7</div>
              <div className="text-sm text-gray-600 dark:text-gray-300 font-poppins">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
