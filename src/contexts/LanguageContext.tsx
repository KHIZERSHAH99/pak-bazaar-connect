
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ur';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

interface Translations {
  [key: string]: {
    en: string;
    ur: string;
  };
}

const translations: Translations = {
  // Navigation
  'home': { en: 'Home', ur: 'گھر' },
  'dashboard': { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  'products': { en: 'Products', ur: 'پروڈکٹس' },
  'shops': { en: 'Shops', ur: 'دکانیں' },
  'orders': { en: 'Orders', ur: 'آرڈرز' },
  'profile': { en: 'Profile', ur: 'پروفائل' },
  'logout': { en: 'Logout', ur: 'لاگ آؤٹ' },
  'login': { en: 'Login', ur: 'لاگ ان' },
  'signup': { en: 'Sign Up', ur: 'سائن اپ' },
  
  // Search and actions
  'search': { en: 'Search', ur: 'تلاش' },
  'add_to_cart': { en: 'Add to Cart', ur: 'کارٹ میں شامل کریں' },
  'price': { en: 'Price', ur: 'قیمت' },
  'category': { en: 'Category', ur: 'قسم' },
  'location': { en: 'Location', ur: 'مقام' },
  'rating': { en: 'Rating', ur: 'ریٹنگ' },
  'verified': { en: 'Verified', ur: 'تصدیق شدہ' },
  
  // Business terms
  'message_seller': { en: 'Message Seller', ur: 'بیچنے والے کو پیغام' },
  'request_quote': { en: 'Request Quote', ur: 'قوٹ کی درخواست' },
  'minimum_order': { en: 'Minimum Order', ur: 'کم سے کم آرڈر' },
  'wholesale_price': { en: 'Wholesale Price', ur: 'ہول سیل قیمت' },
  'contact_seller': { en: 'Contact Seller', ur: 'بیچنے والے سے رابطہ' },
  'save_favorite': { en: 'Save to Favorites', ur: 'پسندیدہ میں محفوظ کریں' },
  'compare_products': { en: 'Compare Products', ur: 'پروڈکٹس کا موازنہ' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ur')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update document direction for RTL support
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Add CSS class for Urdu to handle specific styling
    if (lang === 'ur') {
      document.documentElement.classList.add('urdu-layout');
    } else {
      document.documentElement.classList.remove('urdu-layout');
    }
  };

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
