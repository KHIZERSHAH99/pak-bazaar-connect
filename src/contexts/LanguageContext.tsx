
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
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

const translations = {
  en: {
    'welcome': 'Welcome',
    'login': 'Login',
    'signup': 'Sign Up',
    'dashboard': 'Dashboard',
    'products': 'Products',
    'orders': 'Orders',
    'profile': 'Profile',
    'logout': 'Logout'
  },
  ur: {
    'welcome': 'خوش آمدید',
    'login': 'لاگ ان',
    'signup': 'سائن اپ',
    'dashboard': 'ڈیش بورڈ',
    'products': 'مصنوعات',
    'orders': 'آرڈرز',
    'profile': 'پروفائل',
    'logout': 'لاگ آؤٹ'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
