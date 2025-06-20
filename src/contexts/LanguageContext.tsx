
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
  'analytics': { en: 'Analytics', ur: 'تجزیات' },
  'statistics': { en: 'Statistics', ur: 'شماریات' },
  
  // Profile Page
  'my_profile': { en: 'My Profile', ur: 'میری پروفائل' },
  'manage_account': { en: 'Manage your account information, business details, and preferences', ur: 'اپنے اکاؤنٹ کی معلومات، کاروباری تفصیلات، اور ترجیحات کا انتظام کریں' },
  'account_information': { en: 'Account Information', ur: 'اکاؤنٹ کی معلومات' },
  'account_details': { en: 'Your account details and registration information', ur: 'آپ کے اکاؤنٹ کی تفصیلات اور رجسٹریشن کی معلومات' },
  'email_address': { en: 'Email Address', ur: 'ای میل ایڈریس' },
  'member_since': { en: 'Member Since', ur: 'ممبر بننے کی تاریخ' },
  'not_provided': { en: 'Not provided', ur: 'فراہم نہیں کیا گیا' },
  'verification_status': { en: 'Verification Status', ur: 'تصدیقی حالت' },
  'role_permissions': { en: 'Role Permissions', ur: 'کردار کی اجازات' },
  'permissions': { en: 'Permissions', ur: 'اجازات' },
  'enabled': { en: 'enabled', ur: 'فعال' },
  
  // Analytics & Stats
  'analytics_dashboard': { en: 'Analytics Dashboard', ur: 'تجزیاتی ڈیش بورڈ' },
  'statistics_dashboard': { en: 'Statistics Dashboard', ur: 'شماریاتی ڈیش بورڈ' },
  'total_views': { en: 'Total Views', ur: 'کل ویوز' },
  'messages': { en: 'Messages', ur: 'پیغامات' },
  'revenue': { en: 'Revenue', ur: 'آمدن' },
  'total_users': { en: 'Total Users', ur: 'کل صارفین' },
  'total_products': { en: 'Total Products', ur: 'کل پروڈکٹس' },
  'active_shops': { en: 'Active Shops', ur: 'فعال دکانیں' },
  'orders_today': { en: 'Orders Today', ur: 'آج کے آرڈرز' },
  'orders_placed': { en: 'Orders Placed', ur: 'دیے گئے آرڈرز' },
  'favorite_shops': { en: 'Favorite Shops', ur: 'پسندیدہ دکانیں' },
  'spent': { en: 'Spent', ur: 'خرچ' },
  'overview': { en: 'Overview', ur: 'جائزہ' },
  'users': { en: 'Users', ur: 'صارفین' },
  'business': { en: 'Business', ur: 'کاروبار' },
  'marketing': { en: 'Marketing', ur: 'مارکیٹنگ' },
  'platform_overview': { en: 'Platform Overview', ur: 'پلیٹفارم کا جائزہ' },
  'business_metrics': { en: 'Business Metrics', ur: 'کاروباری میٹرکس' },
  'registered_users': { en: 'Registered users', ur: 'رجسٹرڈ صارفین' },
  'active_wholesalers': { en: 'Active wholesalers', ur: 'فعال ہول سیلرز' },
  'active_sellers': { en: 'Active sellers', ur: 'فعال سیلرز' },
  'awaiting_approval': { en: 'Awaiting approval', ur: 'منظوری کا انتظار' },
  'all_registered_users': { en: 'All registered users', ur: 'تمام رجسٹرڈ صارفین' },
  'business_accounts': { en: 'Business accounts', ur: 'کاروباری اکاؤنٹس' },
  'wholesaler_accounts': { en: 'Wholesaler accounts', ur: 'ہول سیلر اکاؤنٹس' },
  'buyer_accounts': { en: 'Buyer accounts', ur: 'خریدار اکاؤنٹس' },
  'seller_accounts': { en: 'Seller accounts', ur: 'سیلر اکاؤنٹس' },
  'listed_products': { en: 'Listed products', ur: 'لسٹ شدہ پروڈکٹس' },
  'created_ads': { en: 'Created ads', ur: 'بنائے گئے اشتہارات' },
  'processed_orders': { en: 'Processed orders', ur: 'پروسیس شدہ آرڈرز' },
  'running_campaigns': { en: 'Running campaigns', ur: 'چلتی مہمات' },
  'received_orders': { en: 'Received orders', ur: 'موصولہ آرڈرز' },
  'live_and_approved': { en: 'Live and approved', ur: 'لائیو اور منظور شدہ' },
  'awaiting_review': { en: 'Awaiting review', ur: 'جائزے کا انتظار' },
  'all_products': { en: 'All products', ur: 'تمام پروڈکٹس' },
  'currently_running': { en: 'Currently running', ur: 'فی الوقت چل رہے' },
  'all_time_created': { en: 'All time created', ur: 'تمام وقت بنائے گئے' },
  
  // Role Management
  'role_management': { en: 'Role Management', ur: 'کردار کا انتظام' },
  'choose_role': { en: 'Choose your role to access platform features', ur: 'پلیٹفارم کی خصوصیات تک رسائی کے لیے اپنا کردار منتخب کریں' },
  'role_change_notice': { en: 'Role Change Notice', ur: 'کردار تبدیلی کا اطلاع' },
  'role_change_desc': { en: 'Role changes update your account permissions immediately. To maintain security, switching to a Wholesaler role requires proper business verification.', ur: 'کردار کی تبدیلی آپ کے اکاؤنٹ کی اجازات کو فوری طور پر اپڈیٹ کر دیتی ہے۔ سیکیورٹی برقرار رکھنے کے لیے، ہول سیلر کردار میں تبدیلی کے لیے مناسب کاروباری تصدیق ضروری ہے۔' },
  'becoming_wholesaler': { en: 'Becoming a Wholesaler', ur: 'ہول سیلر بننا' },
  'becoming_wholesaler_desc': { en: "To become a wholesaler, you'll need to complete a separate signup process with business verification. This ensures all wholesalers on our platform are legitimate businesses.", ur: 'ہول سیلر بننے کے لیے، آپ کو کاروباری تصدیق کے ساتھ الگ سائن اپ کا عمل مکمل کرنا ہوگا۔ یہ اس بات کو یقینی بناتا ہے کہ ہمارے پلیٹفارم پر تمام ہول سیلرز جائز کاروبار ہیں۔' },
  'wholesaler': { en: 'Wholesaler', ur: 'ہول سیلر' },
  'seller': { en: 'Seller', ur: 'فروش کنندہ' },
  'admin': { en: 'Admin', ur: 'ایڈمن' },
  'sell_to_retailers': { en: 'Sell products to retailers', ur: 'خوردہ فروشوں کو پروڈکٹس فروخت کریں' },
  'purchase_from_wholesalers': { en: 'Purchase from wholesalers', ur: 'ہول سیلرز سے خریداری کریں' },
  'current': { en: 'Current', ur: 'موجودہ' },
  'switch_to': { en: 'Switch to', ur: 'تبدیل کریں' },
  'sign_up_as': { en: 'Sign up as', ur: 'کے طور پر سائن اپ کریں' },
  'registration_required': { en: 'Registration required for this role', ur: 'اس کردار کے لیے رجسٹریشن ضروری ہے' },
  'role_switched_successfully': { en: 'Role Switched Successfully!', ur: 'کردار کامیابی سے تبدیل ہو گیا!' },
  'switching_role': { en: 'Switching Role', ur: 'کردار تبدیل کر رہے ہیں' },
  'cannot_switch_role': { en: 'Cannot Switch Role', ur: 'کردار تبدیل نہیں کر سکتے' },
  'role_switch_failed': { en: 'Role Switch Failed', ur: 'کردار تبدیل کرنے میں ناکامی' },
  
  // Common actions and status
  'confirm': { en: 'Confirm', ur: 'تصدیق کریں' },
  'cancel': { en: 'Cancel', ur: 'منسوخ' },
  'save': { en: 'Save', ur: 'محفوظ کریں' },
  'edit': { en: 'Edit', ur: 'ترمیم' },
  'delete': { en: 'Delete', ur: 'ڈیلیٹ' },
  'view': { en: 'View', ur: 'دیکھیں' },
  'processing': { en: 'Processing...', ur: 'پروسیسنگ...' },
  'loading': { en: 'Loading...', ur: 'لوڈ ہو رہا ہے...' },
  'settings': { en: 'Settings', ur: 'سیٹنگز' },
  'previous': { en: 'Previous', ur: 'پچھلا' },
  'continue': { en: 'Continue', ur: 'جاری رکھیں' },
  'next': { en: 'Next', ur: 'اگلا' },
  'submit': { en: 'Submit', ur: 'جمع کریں' },
  'loading_component': { en: 'Loading component...', ur: 'کمپوننٹ لوڈ ہو رہا ہے...' },
  'options': { en: 'Options', ur: 'اختیارات' },
  'of': { en: 'of', ur: 'میں سے' },
  
  // Verification Status
  'verified': { en: 'Verified', ur: 'تصدیق شدہ' },
  'pending': { en: 'Pending', ur: 'زیر التواء' },
  'rejected': { en: 'Rejected', ur: 'مسترد' },
  'unverified': { en: 'Unverified', ur: 'غیر تصدیق شدہ' },
  'account_verified': { en: 'Your account has been verified and approved for trading.', ur: 'آپ کا اکاؤنٹ تصدیق شدہ ہے اور تجارت کے لیے منظور ہے۔' },
  'verification_pending': { en: 'Your verification is under review. This may take 1-3 business days.', ur: 'آپ کی تصدیق زیر نظر ہے۔ اس میں 1-3 کاروباری دن لگ سکتے ہیں۔' },
  'verification_rejected': { en: 'Your verification was rejected. Please contact support for details.', ur: 'آپ کی تصدیق مسترد کر دی گئی۔ تفصیلات کے لیے سپورٹ سے رابطہ کریں۔' },
  'complete_profile': { en: 'Complete your profile to start the verification process.', ur: 'تصدیقی عمل شروع کرنے کے لیے اپنی پروفائل مکمل کریں۔' },
  'note': { en: 'Note', ur: 'نوٹ' },
  
  // Role Features
  'create_manage_shops': { en: 'Create and manage shops', ur: 'دکانیں بنائیں اور ان کا انتظام کریں' },
  'list_products': { en: 'List products for sale', ur: 'فروخت کے لیے پروڈکٹس کی فہرست بنائیں' },
  'create_ads': { en: 'Create promotional ads', ur: 'تشہیری اشتہارات بنائیں' },
  'fulfill_orders': { en: 'Fulfill retailer orders', ur: 'خوردہ فروشوں کے آرڈرز پورے کریں' },
  'browse_catalogs': { en: 'Browse wholesale catalogs', ur: 'ہول سیل کیٹالاگ دیکھیں' },
  'place_bulk_orders': { en: 'Place bulk orders', ur: 'بلک آرڈرز دیں' },
  'track_orders': { en: 'Track order status', ur: 'آرڈر کی صورتحال کا پتہ لگائیں' },
  'manage_inventory': { en: 'Manage inventory purchases', ur: 'انوینٹری کی خریداری کا انتظام کریں' },
  
  // Permission Items
  'view_products': { en: 'View Products', ur: 'پروڈکٹس دیکھیں' },
  'browse_shops': { en: 'Browse Shops', ur: 'دکانیں براؤز کریں' },
  'contact_support': { en: 'Contact Support', ur: 'سپورٹ سے رابطہ' },
  'manage_users': { en: 'Manage Users', ur: 'صارفین کا انتظام' },
  'approve_ads': { en: 'Approve Ads', ur: 'اشتہارات کی منظوری' },
  'view_analytics': { en: 'View Analytics', ur: 'تجزیات دیکھیں' },
  'system_settings': { en: 'System Settings', ur: 'سسٹم سیٹنگز' },
  'create_shops': { en: 'Create Shops', ur: 'دکانیں بنائیں' },
  'add_products': { en: 'Add Products', ur: 'پروڈکٹس شامل کریں' },
  'manage_orders': { en: 'Manage Orders', ur: 'آرڈرز کا انتظام' },
  'place_orders': { en: 'Place Orders', ur: 'آرڈر دیں' },
  'track_purchases': { en: 'Track Purchases', ur: 'خریداری کا پتہ لگائیں' },
  'message_wholesalers': { en: 'Message Wholesalers', ur: 'ہول سیلرز کو پیغام' },
  
  // Role Permissions Categories
  'basic': { en: 'Basic', ur: 'بنیادی' },
  'communication': { en: 'Communication', ur: 'رابطہ' },
  
  // Language related
  'language': { en: 'Language', ur: 'زبان' },
  'english': { en: 'English', ur: 'انگریزی' },
  'urdu': { en: 'اردو', ur: 'اردو' },
  
  // Profile not found
  'profile_not_found': { en: 'Profile Not Found', ur: 'پروفائل نہیں ملی' },
  'profile_not_found_desc': { en: 'Unable to load your profile information at this time.', ur: 'اس وقت آپ کی پروفائل کی معلومات لوڈ نہیں ہو سکیں۔' },
  
  // Error messages
  'error_occurred': { en: 'An error occurred', ur: 'ایک خرابی پیش آئی' },
  'try_again': { en: 'Please try again', ur: 'براہ کرم دوبارہ کوشش کریں' },
  'network_error': { en: 'Network error. Please check your connection.', ur: 'نیٹ ورک کی خرابی۔ اپنا کنکشن چیک کریں۔' },
  'unauthorized_access': { en: 'You are not authorized to perform this action.', ur: 'آپ کو یہ کارروائی کرنے کی اجازت نہیں ہے۔' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('pak-bazaar-language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ur')) {
      setLanguage(savedLanguage);
      applyLanguageSettings(savedLanguage);
    }
  }, []);

  const applyLanguageSettings = (lang: Language) => {
    // Update document direction for RTL support
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    
    // Add CSS class for Urdu to handle specific styling
    if (lang === 'ur') {
      document.documentElement.classList.add('urdu-layout');
      document.body.classList.add('urdu-layout');
    } else {
      document.documentElement.classList.remove('urdu-layout');
      document.body.classList.remove('urdu-layout');
    }
  };

  const handleSetLanguage = (lang: Language) => {
    console.log('Setting language to:', lang);
    setLanguage(lang);
    localStorage.setItem('pak-bazaar-language', lang);
    applyLanguageSettings(lang);
  };

  const t = (key: string): string => {
    const translation = translations[key]?.[language];
    if (!translation) {
      console.warn(`Missing translation for key: ${key}`);
      return key; // Return key as fallback
    }
    return translation;
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
