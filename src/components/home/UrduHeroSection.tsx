import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const UrduHeroSection = () => {
  const { t, language } = useLanguage();
  
  return (
    <section className="relative py-16 md:py-24 lg:py-32 bg-gradient-to-b from-pakistani_green-50 to-white dark:from-pakistani_green-900/20 dark:to-gray-950 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight font-poppins">
            {language === 'ur' ? (
              <>پاکستان کا سب سے بڑا<br />
              <span className="text-pakistani_green-700 dark:text-pakistani_green-400">B2B ای کامرس</span> پلیٹ فارم</>
            ) : (
              <>Pakistan's Largest<br />
              <span className="text-pakistani_green-700 dark:text-pakistani_green-400">B2B E-Commerce</span> Platform</>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 font-poppins">
            {language === 'ur' 
              ? 'ہول سیلرز اور خوردہ فروشوں کو جوڑیں، اپنی کاروباری ترقی کو تیز کریں'
              : 'Connect wholesalers and retailers, accelerate your business growth'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-pakistani_green-700 hover:bg-pakistani_green-800 text-white px-8 py-6 text-lg font-poppins shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              >
                {t('signup')}
                <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-pakistani_green-700 text-pakistani_green-700 hover:bg-pakistani_green-50 dark:border-pakistani_green-400 dark:text-pakistani_green-400 dark:hover:bg-pakistani_green-900/20 px-8 py-6 text-lg font-poppins w-full sm:w-auto"
              >
                {t('browseProducts')}
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <Shield className="h-8 w-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
              <span className="text-gray-700 dark:text-gray-300 font-poppins">
                {language === 'ur' ? 'محفوظ لین دین' : 'Secure Transactions'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Users className="h-8 w-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
              <span className="text-gray-700 dark:text-gray-300 font-poppins">
                {language === 'ur' ? 'تصدیق شدہ فروخت کنندگان' : 'Verified Sellers'}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <TrendingUp className="h-8 w-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
              <span className="text-gray-700 dark:text-gray-300 font-poppins">
                {language === 'ur' ? 'بہترین قیمتیں' : 'Best Prices'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrduHeroSection;