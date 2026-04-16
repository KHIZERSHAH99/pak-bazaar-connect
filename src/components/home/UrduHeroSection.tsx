import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const UrduHeroSection = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isRtl = language === 'ur';

  return (
    <section className="relative py-14 md:py-20 lg:py-28 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-foreground mb-3 md:mb-5 leading-[1.1] font-poppins tracking-tight">
            {isRtl ? (
              <>پاکستان کا سب سے بڑا<br />
              <span className="text-primary">B2B ای کامرس</span> پلیٹ فارم</>
            ) : (
              <>Pakistan's Largest<br />
              <span className="text-primary">B2B E-Commerce</span> Platform</>
            )}
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 font-poppins max-w-xl mx-auto">
            {isRtl 
              ? 'ہول سیلرز اور ریٹیلرز کو جوڑیں، اپنے کاروبار کو آگے بڑھائیں'
              : 'Connect wholesalers and retailers, accelerate your business growth'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10 md:mb-14 px-2 sm:px-0">
            <Link to={user ? "/dashboard" : "/signup"}>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 sm:px-8 py-5 text-base font-poppins font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto min-h-[48px] rounded-lg"
              >
                {user ? t('dashboard') : t('signup')}
                <ArrowRight className={`${isRtl ? 'mr-2' : 'ml-2'} h-4 w-4`} />
              </Button>
            </Link>
            <Link to="/products">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-primary hover:bg-primary/10 px-6 sm:px-8 py-5 text-base font-poppins font-semibold w-full sm:w-auto min-h-[48px] rounded-lg"
              >
                {t('browseProducts')}
              </Button>
            </Link>
          </div>
          
          {/* Trust signals */}
          <div className="flex flex-row items-center justify-center gap-6 sm:gap-12">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground font-poppins">
                {isRtl ? 'محفوظ لین دین' : 'Secure Transactions'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground font-poppins">
                {isRtl ? 'تصدیق شدہ سیلرز' : 'Verified Sellers'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground font-poppins">
                {isRtl ? 'بہترین قیمتیں' : 'Best Prices'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UrduHeroSection;
