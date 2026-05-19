import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const UrduHeroSection = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  return (
    <section className="relative py-8 md:py-24 lg:py-32 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-[26px] leading-[1.15] sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-6 sm:leading-tight font-poppins">
            {language === 'ur' ? (
              <>پاکستان کا سب سے بڑا<br />
              <span className="text-primary">B2B ای کامرس</span> پلیٹ فارم</>
            ) : (
              <>Pakistan's Largest<br />
              <span className="text-primary">B2B E-Commerce</span> Platform</>
            )}
          </h1>
          
          <p className="text-sm sm:text-base md:text-xl text-muted-foreground mb-5 md:mb-8 font-poppins px-2">
            {language === 'ur' 
              ? 'ہول سیلرز اور خوردہ فروشوں کو جوڑیں، اپنی کاروباری ترقی کو تیز کریں'
              : 'Connect wholesalers and retailers, accelerate your business growth'}
          </p>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 sm:gap-4 justify-center mb-6 md:mb-12 px-2 sm:px-0">
            <Link to={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto">
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-8 h-11 sm:py-6 text-sm sm:text-lg font-poppins shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
              >
                {user ? t('dashboard') : t('signup')}
                <ArrowRight className="ml-1.5 sm:ml-2 rtl:ml-0 rtl:mr-1.5 sm:rtl:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Link to="/products" className="w-full sm:w-auto">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10 px-4 sm:px-8 h-11 sm:py-6 text-sm sm:text-lg font-poppins w-full sm:w-auto"
              >
                {t('browseProducts')}
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-3 gap-2 sm:gap-6 max-w-2xl mx-auto px-2">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
              <Shield className="h-4 w-4 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <span className="text-[11px] sm:text-base text-muted-foreground font-poppins text-center">
                {language === 'ur' ? 'محفوظ لین دین' : 'Secure Transactions'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
              <Users className="h-4 w-4 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <span className="text-[11px] sm:text-base text-muted-foreground font-poppins text-center">
                {language === 'ur' ? 'تصدیق شدہ فروخت کنندگان' : 'Verified Sellers'}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3">
              <TrendingUp className="h-4 w-4 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              <span className="text-[11px] sm:text-base text-muted-foreground font-poppins text-center">
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
