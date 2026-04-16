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
    <section className="relative py-16 md:py-28 lg:py-36 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-5xl mx-auto" dir={isRtl ? 'rtl' : 'ltr'}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-4 md:mb-6 leading-tight font-poppins tracking-tight">
            {isRtl ? (
              <>پاکستان کا سب سے بڑا<br />
              <span className="text-primary">B2B ای کامرس</span> پلیٹ فارم</>
            ) : (
              <>Pakistan's Largest<br />
              <span className="text-primary">B2B E-Commerce</span> Platform</>
            )}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 font-poppins max-w-2xl mx-auto">
            {isRtl 
              ? 'ہول سیلرز اور ریٹیلرز کو جوڑیں، اپنے کاروبار کو آگے بڑھائیں'
              : 'Connect wholesalers and retailers, accelerate your business growth'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12 md:mb-16 px-2 sm:px-0">
            <Link to={user ? "/dashboard" : "/signup"}>
              <Button 
                size="lg" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 sm:px-10 py-6 sm:py-7 text-lg sm:text-xl font-poppins font-semibold shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto min-h-[52px] rounded-xl"
              >
                {user ? t('dashboard') : t('signup')}
                <ArrowRight className={`${isRtl ? 'mr-2' : 'ml-2'} h-5 w-5`} />
              </Button>
            </Link>
            <Link to="/products">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-primary text-primary hover:bg-primary/10 px-8 sm:px-10 py-6 sm:py-7 text-lg sm:text-xl font-poppins font-semibold w-full sm:w-auto min-h-[52px] rounded-xl"
              >
                {t('browseProducts')}
              </Button>
            </Link>
          </div>
          
          {/* Trust signals */}
          <div className="flex flex-row items-center justify-center gap-8 sm:gap-16 max-w-2xl mx-auto">
            <div className="flex items-center gap-2.5">
              <Shield className="h-6 sm:h-7 w-6 sm:w-7 text-primary flex-shrink-0" />
              <span className="text-sm sm:text-base text-muted-foreground font-poppins whitespace-nowrap">
                {isRtl ? 'محفوظ لین دین' : 'Secure Transactions'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <Users className="h-6 sm:h-7 w-6 sm:w-7 text-primary flex-shrink-0" />
              <span className="text-sm sm:text-base text-muted-foreground font-poppins whitespace-nowrap">
                {isRtl ? 'تصدیق شدہ سیلرز' : 'Verified Sellers'}
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-6 sm:h-7 w-6 sm:w-7 text-primary flex-shrink-0" />
              <span className="text-sm sm:text-base text-muted-foreground font-poppins whitespace-nowrap">
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
