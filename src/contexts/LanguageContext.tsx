
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
  'home': { en: 'Home', ur: 'ہوم' },
  'dashboard': { en: 'Dashboard', ur: 'ڈیش بورڈ' },
  'products': { en: 'Products', ur: 'پروڈکٹس' },
  'shops': { en: 'Shops', ur: 'دکانیں' },
  'orders': { en: 'Orders', ur: 'آرڈرز' },
  'profile': { en: 'Profile', ur: 'پروفائل' },
  'logout': { en: 'Logout', ur: 'لاگ آؤٹ' },
  'login': { en: 'Login', ur: 'لاگ ان' },
  'signup': { en: 'Sign Up', ur: 'سائن اپ' },
  'suppliers': { en: 'Suppliers', ur: 'سپلائرز' },
  'sellers': { en: 'Sellers', ur: 'فروش کنندگان' },
  'features': { en: 'Features', ur: 'خصوصیات' },
  
  // Search and actions
  'search': { en: 'Search', ur: 'تلاش کریں' },
  'add_to_cart': { en: 'Add to Cart', ur: 'کارٹ میں شامل کریں' },
  'price': { en: 'Price', ur: 'قیمت' },
  'category': { en: 'Category', ur: 'کیٹگری' },
  'location': { en: 'Location', ur: 'مقام' },
  'rating': { en: 'Rating', ur: 'ریٹنگ' },
  'verified': { en: 'Verified', ur: 'تصدیق شدہ' },
  
  // Business terms
  'message_seller': { en: 'Message Seller', ur: 'فروش کنندہ کو پیغام' },
  'request_quote': { en: 'Request Quote', ur: 'قیمت کی درخواست' },
  'minimum_order': { en: 'Minimum Order', ur: 'کم سے کم آرڈر' },
  'wholesale_price': { en: 'Wholesale Price', ur: 'ہول سیل قیمت' },
  'contact_seller': { en: 'Contact Seller', ur: 'فروش کنندہ سے رابطہ' },
  'save_favorite': { en: 'Save to Favorites', ur: 'پسندیدہ میں محفوظ کریں' },
  'compare_products': { en: 'Compare Products', ur: 'پروڈکٹس کا موازنہ' },
  
  // Common actions
  'settings': { en: 'Settings', ur: 'سیٹنگز' },
  'previous': { en: 'Previous', ur: 'پچھلا' },
  'continue': { en: 'Continue', ur: 'جاری رکھیں' },
  'next': { en: 'Next', ur: 'اگلا' },
  'submit': { en: 'Submit', ur: 'جمع کریں' },
  'cancel': { en: 'Cancel', ur: 'منسوخ' },
  'save': { en: 'Save', ur: 'محفوظ کریں' },
  'edit': { en: 'Edit', ur: 'ترمیم' },
  'delete': { en: 'Delete', ur: 'ڈیلیٹ' },
  'view': { en: 'View', ur: 'دیکھیں' },
  'processing': { en: 'Processing...', ur: 'پروسیسنگ...' },
  'loading': { en: 'Loading...', ur: 'لوڈ ہو رہا ہے...' },
  
  // Account related
  'create_account': { en: 'Create Account', ur: 'اکاؤنٹ بنائیں' },
  'my_account': { en: 'My Account', ur: 'میرا اکاؤنٹ' },
  'account_settings': { en: 'Account Settings', ur: 'اکاؤنٹ سیٹنگز' },
  
  // Language related
  'language': { en: 'Language', ur: 'زبان' },
  'english': { en: 'English', ur: 'انگریزی' },
  'urdu': { en: 'اردو', ur: 'اردو' },
  
  // Theme related
  'theme': { en: 'Theme', ur: 'تھیم' },
  'light_mode': { en: 'Light Mode', ur: 'لائٹ موڈ' },
  'dark_mode': { en: 'Dark Mode', ur: 'ڈارک موڈ' },
  
  // Business specific
  'wholesaler': { en: 'Wholesaler', ur: 'ہول سیلر' },
  'seller': { en: 'Seller', ur: 'فروش کنندہ' },
  'buyer': { en: 'Buyer', ur: 'خریدار' },
  'admin': { en: 'Admin', ur: 'ایڈمن' },
  'business': { en: 'Business', ur: 'کاروبار' },
  'marketplace': { en: 'Marketplace', ur: 'بازار' },
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
