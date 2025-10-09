
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
    // Navigation
    'welcome': 'Welcome',
    'login': 'Login',
    'signup': 'Sign Up',
    'dashboard': 'Dashboard',
    'products': 'Products',
    'orders': 'Orders',
    'profile': 'Profile',
    'logout': 'Logout',
    'home': 'Home',
    'shops': 'Shops',
    'features': 'Features',
    'blog': 'Blog',
    'about': 'About',
    'messages': 'Messages',
    'favorites': 'Favorites',
    'analytics': 'Analytics',
    'settings': 'Settings',
    
    // Auth
    'email': 'Email',
    'password': 'Password',
    'phone': 'Phone Number',
    'confirmPassword': 'Confirm Password',
    'forgotPassword': 'Forgot Password?',
    'rememberMe': 'Remember Me',
    'alreadyHaveAccount': 'Already have an account?',
    'dontHaveAccount': "Don't have an account?",
    'createAccount': 'Create Account',
    'loginToAccount': 'Login to Your Account',
    
    // Roles
    'admin': 'Admin',
    'wholesaler': 'Wholesaler',
    'seller': 'Seller',
    'pending': 'Pending',
    'selectRole': 'Select Your Role',
    
    // Dashboard
    'totalOrders': 'Total Orders',
    'pendingOrders': 'Pending Orders',
    'completedOrders': 'Completed Orders',
    'totalRevenue': 'Total Revenue',
    'myShops': 'My Shops',
    'myProducts': 'My Products',
    'browseShops': 'Browse Shops',
    'createShop': 'Create Shop',
    'addProduct': 'Add Product',
    'viewAll': 'View All',
    
    // Products
    'searchProducts': 'Search products...',
    'browseProducts': 'Browse Products',
    'productName': 'Product Name',
    'price': 'Price',
    'quantity': 'Quantity',
    'category': 'Category',
    'description': 'Description',
    'addToCart': 'Add to Cart',
    'outOfStock': 'Out of Stock',
    'inStock': 'In Stock',
    'minOrderQuantity': 'Minimum Order Quantity',
    
    // Orders
    'orderDetails': 'Order Details',
    'orderStatus': 'Order Status',
    'orderDate': 'Order Date',
    'deliveryAddress': 'Delivery Address',
    'paymentMethod': 'Payment Method',
    'totalAmount': 'Total Amount',
    'placeOrder': 'Place Order',
    'cancelOrder': 'Cancel Order',
    'confirmOrder': 'Confirm Order',
    'rejectOrder': 'Reject Order',
    
    // Shops
    'shopName': 'Shop Name',
    'shopAddress': 'Shop Address',
    'contactNumber': 'Contact Number',
    'businessType': 'Business Type',
    'postalCode': 'Postal Code',
    'city': 'City',
    'province': 'Province',
    
    // Messages
    'typeMessage': 'Type your message...',
    'send': 'Send',
    'newMessage': 'New Message',
    'conversations': 'Conversations',
    
    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'edit': 'Edit',
    'delete': 'Delete',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Info',
    'yes': 'Yes',
    'no': 'No',
    'confirm': 'Confirm',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'submit': 'Submit',
    'update': 'Update',
    'refresh': 'Refresh',
    'downloadReport': 'Download Report',
    'print': 'Print',
    'export': 'Export',
    'import': 'Import',
    
    // Shipping
    'shipping': 'Shipping',
    'shippingConfiguration': 'Shipping Configuration',
    'shippingMethod': 'Shipping Calculation Method',
    'flatRate': 'Flat Rate',
    'weightBased': 'Weight Based',
    'cityBased': 'City Based',
    'freeAboveAmount': 'Free Above Amount',
    'flatRateCost': 'Flat Shipping Rate',
    'freeShippingAbove': 'Free Shipping Above',
    'baseRate': 'Base Rate',
    'perKgRate': 'Per KG Rate',
    'estimatedDeliveryDays': 'Estimated Delivery Days',
    'expressShipping': 'Express Shipping Option',
    'expressCost': 'Express Cost',
    'expressDeliveryDays': 'Express Delivery Days',
    'enableShipping': 'Enable Shipping Configuration',
    'saveShippingConfig': 'Save Shipping Configuration',
    'shippingConfigDescription': 'Configure how shipping costs are calculated for your shop',
    'loadingShippingConfig': 'Loading shipping configuration...',
    'saving': 'Saving...',
    'noShopsYet': "You don't have any shops yet. Create a shop first to configure shipping.",
    
    // Languages
    'english': 'English',
    'urdu': 'اردو',
    
    // Footer
    'allRightsReserved': 'All rights reserved',
    'privacyPolicy': 'Privacy Policy',
    'termsOfService': 'Terms of Service',
    'contactUs': 'Contact Us'
  },
  ur: {
    // Navigation
    'welcome': 'خوش آمدید',
    'login': 'لاگ ان',
    'signup': 'سائن اپ',
    'dashboard': 'ڈیش بورڈ',
    'products': 'مصنوعات',
    'orders': 'آرڈرز',
    'profile': 'پروفائل',
    'logout': 'لاگ آؤٹ',
    'home': 'ہوم',
    'shops': 'دکانیں',
    'features': 'خصوصیات',
    'blog': 'بلاگ',
    'about': 'ہمارے بارے میں',
    'messages': 'پیغامات',
    'favorites': 'پسندیدہ',
    'analytics': 'تجزیات',
    'settings': 'سیٹنگز',
    
    // Auth
    'email': 'ای میل',
    'password': 'پاس ورڈ',
    'phone': 'فون نمبر',
    'confirmPassword': 'پاس ورڈ کی تصدیق کریں',
    'forgotPassword': 'پاس ورڈ بھول گئے؟',
    'rememberMe': 'مجھے یاد رکھیں',
    'alreadyHaveAccount': 'پہلے سے اکاؤنٹ ہے؟',
    'dontHaveAccount': 'اکاؤنٹ نہیں ہے؟',
    'createAccount': 'اکاؤنٹ بنائیں',
    'loginToAccount': 'اپنے اکاؤنٹ میں لاگ ان کریں',
    
    // Roles
    'admin': 'ایڈمن',
    'wholesaler': 'ہول سیلر',
    'seller': 'فروخت کنندہ',
    'pending': 'زیر التواء',
    'selectRole': 'اپنا کردار منتخب کریں',
    
    // Dashboard
    'totalOrders': 'کل آرڈرز',
    'pendingOrders': 'زیر التواء آرڈرز',
    'completedOrders': 'مکمل آرڈرز',
    'totalRevenue': 'کل آمدنی',
    'myShops': 'میری دکانیں',
    'myProducts': 'میری مصنوعات',
    'browseShops': 'دکانیں دیکھیں',
    'createShop': 'دکان بنائیں',
    'addProduct': 'پروڈکٹ شامل کریں',
    'viewAll': 'تمام دیکھیں',
    
    // Products
    'searchProducts': 'مصنوعات تلاش کریں...',
    'browseProducts': 'مصنوعات دیکھیں',
    'productName': 'پروڈکٹ کا نام',
    'price': 'قیمت',
    'quantity': 'مقدار',
    'category': 'زمرہ',
    'description': 'تفصیل',
    'addToCart': 'کارٹ میں شامل کریں',
    'outOfStock': 'اسٹاک ختم',
    'inStock': 'دستیاب',
    'minOrderQuantity': 'کم سے کم آرڈر کی مقدار',
    
    // Orders
    'orderDetails': 'آرڈر کی تفصیلات',
    'orderStatus': 'آرڈر کی صورتحال',
    'orderDate': 'آرڈر کی تاریخ',
    'deliveryAddress': 'ڈیلیوری کا پتہ',
    'paymentMethod': 'ادائیگی کا طریقہ',
    'totalAmount': 'کل رقم',
    'placeOrder': 'آرڈر دیں',
    'cancelOrder': 'آرڈر منسوخ کریں',
    'confirmOrder': 'آرڈر کی تصدیق کریں',
    'rejectOrder': 'آرڈر مسترد کریں',
    
    // Shops
    'shopName': 'دکان کا نام',
    'shopAddress': 'دکان کا پتہ',
    'contactNumber': 'رابطہ نمبر',
    'businessType': 'کاروبار کی قسم',
    'postalCode': 'پوسٹل کوڈ',
    'city': 'شہر',
    'province': 'صوبہ',
    
    // Messages
    'typeMessage': 'اپنا پیغام ٹائپ کریں...',
    'send': 'بھیجیں',
    'newMessage': 'نیا پیغام',
    'conversations': 'گفتگو',
    
    // Common
    'save': 'محفوظ کریں',
    'cancel': 'منسوخ',
    'edit': 'ترمیم',
    'delete': 'حذف کریں',
    'search': 'تلاش',
    'filter': 'فلٹر',
    'sort': 'ترتیب',
    'loading': 'لوڈ ہو رہا ہے...',
    'error': 'خرابی',
    'success': 'کامیابی',
    'warning': 'انتباہ',
    'info': 'معلومات',
    'yes': 'ہاں',
    'no': 'نہیں',
    'confirm': 'تصدیق',
    'back': 'واپس',
    'next': 'اگلا',
    'previous': 'پچھلا',
    'submit': 'جمع کریں',
    'update': 'اپ ڈیٹ',
    'refresh': 'ریفریش',
    'downloadReport': 'رپورٹ ڈاؤن لوڈ کریں',
    'print': 'پرنٹ',
    'export': 'برآمد',
    'import': 'درآمد',
    
    // Shipping
    'shipping': 'شپنگ',
    'shippingConfiguration': 'شپنگ کی ترتیبات',
    'shippingMethod': 'شپنگ کی قیمت کا طریقہ',
    'flatRate': 'یکساں نرخ',
    'weightBased': 'وزن کی بنیاد پر',
    'cityBased': 'شہر کی بنیاد پر',
    'freeAboveAmount': 'مقررہ رقم سے زیادہ پر مفت',
    'flatRateCost': 'یکساں شپنگ کی قیمت',
    'freeShippingAbove': 'مفت شپنگ',
    'baseRate': 'بنیادی نرخ',
    'perKgRate': 'فی کلو نرخ',
    'estimatedDeliveryDays': 'تخمینہ ڈیلیوری کے دن',
    'expressShipping': 'تیز رفتار ڈیلیوری کا اختیار',
    'expressCost': 'تیز رفتار ڈیلیوری کی قیمت',
    'expressDeliveryDays': 'تیز رفتار ڈیلیوری کے دن',
    'enableShipping': 'شپنگ کی ترتیبات فعال کریں',
    'saveShippingConfig': 'شپنگ کی ترتیبات محفوظ کریں',
    'shippingConfigDescription': 'اپنی دکان کے لیے شپنگ کی قیمت کا حساب لگانے کی ترتیبات',
    'loadingShippingConfig': 'شپنگ کی ترتیبات لوڈ ہو رہی ہیں...',
    'saving': 'محفوظ ہو رہا ہے...',
    'noShopsYet': 'ابھی آپ کی کوئی دکان نہیں ہے۔ شپنگ کی ترتیبات کے لیے پہلے دکان بنائیں۔',
    
    // Languages
    'english': 'English',
    'urdu': 'اردو',
    
    // Footer
    'allRightsReserved': 'تمام حقوق محفوظ ہیں',
    'privacyPolicy': 'رازداری کی پالیسی',
    'termsOfService': 'سروس کی شرائط',
    'contactUs': 'ہم سے رابطہ کریں'
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Get saved language from localStorage or default to 'en'
    return localStorage.getItem('language') || 'en';
  });

  const handleSetLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    // Set document direction for RTL languages
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations.en] || key;
  };

  // Set initial direction
  React.useEffect(() => {
    document.documentElement.dir = language === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
