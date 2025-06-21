
import React, { createContext, useContext, useState, useEffect } from 'react';

interface UrduTranslations {
  [key: string]: string;
}

interface LanguageContextType {
  language: 'en' | 'ur';
  setLanguage: (lang: 'en' | 'ur') => void;
  t: (key: string) => string;
  isUrdu: boolean;
}

const translations: { [key: string]: UrduTranslations } = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.products': 'Products',
    'nav.orders': 'Orders',
    'nav.shops': 'Shops',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.create': 'Create',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.total': 'Total',
    'common.price': 'Price',
    'common.quantity': 'Quantity',
    'common.name': 'Name',
    'common.description': 'Description',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back',
    'dashboard.stats': 'Statistics',
    'dashboard.quickActions': 'Quick Actions',
    
    // Products
    'products.title': 'Products',
    'products.addProduct': 'Add Product',
    'products.editProduct': 'Edit Product',
    'products.productName': 'Product Name',
    'products.productPrice': 'Product Price',
    'products.minimumOrderQuantity': 'Minimum Order Quantity',
    
    // Orders
    'orders.title': 'Orders',
    'orders.newOrder': 'New Order',
    'orders.orderHistory': 'Order History',
    'orders.orderStatus': 'Order Status',
    'orders.pending': 'Pending',
    'orders.confirmed': 'Confirmed',
    'orders.completed': 'Completed',
    'orders.rejected': 'Rejected',
    
    // Profile
    'profile.title': 'Profile',
    'profile.personalInfo': 'Personal Information',
    'profile.businessInfo': 'Business Information',
    'profile.contactInfo': 'Contact Information',
    'profile.email': 'Email',
    'profile.phone': 'Phone',
    'profile.address': 'Address',
    'profile.businessName': 'Business Name',
    'profile.contactName': 'Contact Name',
    
    // Auth
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.dontHaveAccount': "Don't have an account?",
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.signInHere': 'Sign in here',
    'auth.signUpHere': 'Sign up here',
    
    // Roles
    'role.admin': 'Admin',
    'role.wholesaler': 'Wholesaler',
    'role.seller': 'Seller',
    'role.pending': 'Pending',
    
    // Messages
    'message.success': 'Success',
    'message.error': 'Error',
    'message.warning': 'Warning',
    'message.info': 'Information',
    
    // Shops
    'shops.title': 'Shops',
    'shops.createShop': 'Create Shop',
    'shops.shopName': 'Shop Name',
    'shops.shopAddress': 'Shop Address',
    'shops.contact': 'Contact',
    'shops.postalCode': 'Postal Code',
    
    // Quick Actions
    'quickActions.createShop': 'Create Shop',
    'quickActions.addProducts': 'Add Products',
    'quickActions.viewOrders': 'View Orders',
    'quickActions.browseProducts': 'Browse Products',
    'quickActions.manageUsers': 'Manage Users',
    'quickActions.approveAds': 'Approve Ads'
  },
  ur: {
    // Navigation
    'nav.dashboard': 'ڈیش بورڈ',
    'nav.products': 'مصنوعات',
    'nav.orders': 'آرڈرز',
    'nav.shops': 'دکانیں',
    'nav.profile': 'پروفائل',
    'nav.logout': 'لاگ آؤٹ',
    'nav.login': 'لاگ ان',
    'nav.signup': 'رجسٹر کریں',
    
    // Common
    'common.loading': 'لوڈ ہو رہا ہے...',
    'common.save': 'محفوظ کریں',
    'common.cancel': 'منسوخ کریں',
    'common.edit': 'ترمیم کریں',
    'common.delete': 'حذف کریں',
    'common.create': 'بنائیں',
    'common.search': 'تلاش کریں',
    'common.filter': 'فلٹر',
    'common.total': 'کل',
    'common.price': 'قیمت',
    'common.quantity': 'مقدار',
    'common.name': 'نام',
    'common.description': 'تفصیل',
    
    // Dashboard
    'dashboard.title': 'ڈیش بورڈ',
    'dashboard.welcome': 'واپس آئیے',
    'dashboard.stats': 'شماریات',
    'dashboard.quickActions': 'فوری اقدامات',
    
    // Products
    'products.title': 'مصنوعات',
    'products.addProduct': 'پروڈکٹ شامل کریں',
    'products.editProduct': 'پروڈکٹ میں ترمیم کریں',
    'products.productName': 'پروڈکٹ کا نام',
    'products.productPrice': 'پروڈکٹ کی قیمت',
    'products.minimumOrderQuantity': 'کم سے کم آرڈر کی مقدار',
    
    // Orders
    'orders.title': 'آرڈرز',
    'orders.newOrder': 'نیا آرڈر',
    'orders.orderHistory': 'آرڈر کی تاریخ',
    'orders.orderStatus': 'آرڈر کی صورتحال',
    'orders.pending': 'زیر التواء',
    'orders.confirmed': 'تصدیق شدہ',
    'orders.completed': 'مکمل',
    'orders.rejected': 'مسترد',
    
    // Profile
    'profile.title': 'پروفائل',
    'profile.personalInfo': 'ذاتی معلومات',
    'profile.businessInfo': 'کاروباری معلومات',
    'profile.contactInfo': 'رابطے کی معلومات',
    'profile.email': 'ای میل',
    'profile.phone': 'فون',
    'profile.address': 'پتہ',
    'profile.businessName': 'کاروبار کا نام',
    'profile.contactName': 'رابطہ کار کا نام',
    
    // Auth
    'auth.login': 'لاگ ان',
    'auth.signup': 'رجسٹر کریں',
    'auth.email': 'ای میل',
    'auth.password': 'پاس ورڈ',
    'auth.confirmPassword': 'پاس ورڈ کی تصدیق کریں',
    'auth.forgotPassword': 'پاس ورڈ بھول گئے؟',
    'auth.dontHaveAccount': 'اکاؤنٹ نہیں ہے؟',
    'auth.alreadyHaveAccount': 'پہلے سے اکاؤنٹ ہے؟',
    'auth.signInHere': 'یہاں لاگ ان کریں',
    'auth.signUpHere': 'یہاں رجسٹر کریں',
    
    // Roles
    'role.admin': 'ایڈمن',
    'role.wholesaler': 'ہول سیلر',
    'role.seller': 'سیلر',
    'role.pending': 'زیر التواء',
    
    // Messages
    'message.success': 'کامیابی',
    'message.error': 'خرابی',
    'message.warning': 'انتباہ',
    'message.info': 'معلومات',
    
    // Shops
    'shops.title': 'دکانیں',
    'shops.createShop': 'دکان بنائیں',
    'shops.shopName': 'دکان کا نام',
    'shops.shopAddress': 'دکان کا پتہ',
    'shops.contact': 'رابطہ',
    'shops.postalCode': 'پوسٹل کوڈ',
    
    // Quick Actions
    'quickActions.createShop': 'دکان بنائیں',
    'quickActions.addProducts': 'مصنوعات شامل کریں',
    'quickActions.viewOrders': 'آرڈرز دیکھیں',
    'quickActions.browseProducts': 'مصنوعات دیکھیں',
    'quickActions.manageUsers': 'صارفین کا انتظام',
    'quickActions.approveAds': 'اشتہارات کی منظوری'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const UrduLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ur'>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ur' | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'ur') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    
    // Update document direction for RTL
    if (lang === 'ur') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ur';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
    }
  };

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    t,
    isUrdu: language === 'ur'
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useUrduLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useUrduLanguage must be used within a UrduLanguageProvider');
  }
  return context;
};
