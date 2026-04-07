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
    <section className="relative py-12 md:py-24 lg:py-32 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Urdu headline - big, bold, instantly understandable */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-3 md:mb-5 leading-tight font-poppins" dir="rtl">
            {language === 'ur' ? (
              <>تھوک کا سامان،<br />
              <span className="text-primary">آن لائن منگوائیں</span></>
            ) : (
              <>Wholesale Products,<br />
              <span className="text-primary">Order Online</span></>
            )}
          </h1>
          
          {/* Simple subtitle */}
          <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8 font-poppins px-2">
            {language === 'ur' 
              ? 'پاکستان بھر کے ہول سیلرز سے سیدھا خریدیں'
              : 'Buy directly from wholesalers across Pakistan'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 md:mb-12 px-2 sm:px-0">
            <Link to={user ? "/dashboard" : "/signup"}>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-poppins shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto min-h-[48px]"
              >
                {user ? t('dashboard') : t('signup')}
                <ArrowRight className="ml-2 rtl:ml-0 rtl:mr-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-primary text-primary hover:bg-primary/10 px-6 sm:px-8 py-5 sm:py-6 text-base sm:text-lg font-poppins w-full sm:w-auto min-h-[48px]"
              >
                {t('browseProducts')}
              </Button>
            </Link>
          </div>
          
          {/* Trust signals - kept but simplified */}
          <div className="grid grid-cols-3 gap-4 sm:gap-6 max-w-md mx-auto px-2">
            <div className="flex flex-col items-center gap-1.5">
              <Shield className="h-7 sm:h-8 w-7 sm:w-8 text-primary" />
              <span className="text-xs sm:text-sm text-muted-foreground font-poppins text-center">
                {language === 'ur' ? 'محفوظ' : 'Secure'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <Users className="h-7 sm:h-8 w-7 sm:w-8 text-primary" />
              <span className="text-xs sm:text-sm text-muted-foreground font-poppins text-center">
                {language === 'ur' ? 'تصدیق شدہ' : 'Verified'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <TrendingUp className="h-7 sm:h-8 w-7 sm:w-8 text-primary" />
              <span className="text-xs sm:text-sm text-muted-foreground font-poppins text-center">
                {language === 'ur' ? 'بہترین قیمت' : 'Best Price'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrduHeroSection;
