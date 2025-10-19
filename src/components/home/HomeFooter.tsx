
import React from 'react';
import { Shield, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const HomeFooter: React.FC = () => {
  const { t } = useLanguage();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-pakistani_green-800 dark:bg-pakistani_green-900 text-white py-8 px-3 md:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start items-center mb-4">
              <div className="bg-pakistani_green-700 dark:bg-pakistani_green-800 rounded-xl p-2 shadow-md mr-2 md:mr-3">
                <span className="text-white text-lg font-bold">PBC</span>
              </div>
              <span className="text-lg md:text-xl font-bold font-poppins">{t('pakBazaarConnect')}</span>
            </div>
            <p className="text-pakistani_green-200 dark:text-pakistani_green-300 mb-2 md:mb-4 font-poppins">
              {t('connectingBusinesses')}
            </p>
            <div className="flex justify-center md:justify-start items-center space-x-2 md:space-x-4 text-xs md:text-sm">
              <span className="flex items-center font-poppins">
                <Shield className="h-4 w-4 mr-1" aria-hidden="true" />
                {t('trustedMarketplace')}
              </span>
            </div>
          </div>
          
          {/* Back to Top Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={scrollToTop}
            className="bg-transparent border-pakistani_green-300 text-white hover:bg-pakistani_green-700 hover:border-white transition-colors"
          >
            <ArrowUp className="w-4 h-4 mr-2" />
            {t('backToTop')}
          </Button>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
