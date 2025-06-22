
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Basic translations
const translations = {
  en: {
    'nav.home': 'Home',
    'nav.products': 'Products',
    'nav.sellers': 'Sellers',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Logout',
    'footer.rights': '© 2024 Pak Bazaar Connect. All rights reserved.',
    'footer.tagline': 'Build Successful, API Keys Secured',
    'banner.message': 'Join Now! Free Ads for First 10 Wholesalers!',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  ur: {
    'nav.home': 'ہوم',
    'nav.products': 'پروڈکٹس',
    'nav.sellers': 'فروش کار',
    'nav.login': 'لاگ ان',
    'nav.signup': 'سائن اپ',
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.logout': 'لاگ آؤٹ',
    'footer.rights': '© 2024 پاک بازار کنیکٹ۔ تمام حقوق محفوظ ہیں۔',
    'footer.tagline': 'کامیاب تعمیر، API کیز محفوظ',
    'banner.message': 'ابھی شامل ہوں! پہلے 10 ہول سیلرز کے لیے مفت اشتہارات!',
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.error': 'خرابی',
    'common.success': 'کامیابی',
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  const value = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
