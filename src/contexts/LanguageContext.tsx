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
  
  // Profile Image Upload
  'upload_photo': { en: 'Upload Photo', ur: 'تصویر اپ لوڈ کریں' },
  'uploading': { en: 'Uploading...', ur: 'اپ لوڈ ہو رہا ہے...' },
  'remove_photo': { en: 'Remove Photo', ur: 'تصویر ہٹائیں' },
  'upload_photo_desc': { en: 'Upload a photo to personalize your profile. Max 2MB.', ur: 'اپنی پروفائل کو ذاتی بنانے کے لیے تصویر اپ لوڈ کریں۔ زیادہ سے زیادہ 2MB۔' },
  'processing_image': { en: 'Processing image...', ur: 'تصویر پروسیس ہو رہی ہے...' },
  'profile_image_updated': { en: 'Profile image updated', ur: 'پروفائل کی تصویر اپ ڈیٹ ہو گئی' },
  'profile_image_updated_desc': { en: 'Your profile image has been successfully updated', ur: 'آپ کی پروفائل کی تصویر کامیابی سے اپ ڈیٹ ہو گئی ہے' },
  'upload_failed': { en: 'Upload failed', ur: 'اپ لوڈ ناکام' },
  'upload_failed_desc': { en: 'Failed to upload image. Please try again.', ur: 'تصویر اپ لوڈ کرنے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔' },
  'file_too_large': { en: 'File too large', ur: 'فائل بہت بڑی ہے' },
  'file_too_large_desc': { en: 'Please select an image smaller than 2MB', ur: 'براہ کرم 2MB سے چھوٹی تصویر منتخب کریں' },
  'invalid_file_type': { en: 'Invalid file type', ur: 'غلط فائل کی قسم' },
  'invalid_file_type_desc': { en: 'Please select an image file', ur: 'براہ کرم ایک تصویری فائل منتخب کریں' },
  'remove_profile_image': { en: 'Remove Profile Image', ur: 'پروفائل کی تصویر ہٹائیں' },
  'remove_image_confirm': { en: 'Are you sure you want to remove your profile image? This action cannot be undone.', ur: 'کیا آپ واقعی اپنی پروفائل کی تصویر ہٹانا چاہتے ہیں؟ یہ عمل واپس نہیں ہو سکتا۔' },
  'remove_image': { en: 'Remove Image', ur: 'تصویر ہٹائیں' },
  'keep_image': { en: 'Keep Image', ur: 'تصویر رکھیں' },
  'profile_image_removed': { en: 'Profile image removed', ur: 'پروفائل کی تصویر ہٹا دی گئی' },
  'profile_image_removed_desc': { en: 'Your profile image has been removed successfully', ur: 'آپ کی پروفائل کی تصویر کامیابی سے ہٹا دی گئی ہے' },
  'remove_failed': { en: 'Remove failed', ur: 'ہٹانے میں ناکامی' },
  'remove_failed_desc': { en: 'Failed to remove image. Please try again.', ur: 'تصویر ہٹانے میں ناکامی۔ براہ کرم دوبارہ کوشش کریں۔' },
  
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
  
  // Role Management
  'role_management': { en: 'Role Management', ur: 'کردار کا انتظام' },
  'choose_role': { en: 'Choose your role to access platform features', ur: 'پلیٹفارم کی خصوصیات تک رسائی کے لیے اپنا کردار منتخب کریں' },
  'role_change_notice': { en: 'Role Change Notice', ur: 'کردار تبدیلی کا اطلاع' },
  'role_change_desc': { en: 'Role changes update your account permissions immediately. To maintain security, switching to a Wholesaler role requires proper business verification.', ur: 'کردار کی تبدیلی آپ کے اکاؤنٹ کی اجازات کو فوری طور پر اپڈیٹ کر دیتی ہے۔ سیکیورٹی برقرار رکھنے کے لیے، ہول سیلر کردار میں تبدیلی کے لیے مناسب کاروباری تصدیق ضروری ہے۔' },
  'becoming_wholesaler': { en: 'Becoming a Wholesaler', ur: 'ہول سیلر بننا' },
  'becoming_wholesaler_desc': { en: "To become a wholesaler, you'll need to complete a separate signup process with business verification. This ensures all wholesalers on our platform are legitimate businesses.", ur: 'ہول سیلر بننے کے لیے، آپ کو کاروباری تصدیق کے ساتھ الگ سائن اپ کا عمل مکمل کرنا ہوگا۔ یہ اس بات کو یقینی بناتا ہے کہ ہمارے پلیٹفارم پر تمام ہول سیلرز جائز کاروبار ہیں۔' },
  'wholesaler': { en: 'Wholesaler', ur: 'ہول سیلر' },
  'seller': { en: 'Seller', ur: 'فروش کنندہ' },
  'sell_to_retailers': { en: 'Sell products to retailers', ur: 'خوردہ فروشوں کو پروڈکٹس فروخت کریں' },
  'purchase_from_wholesalers': { en: 'Purchase from wholesalers', ur: 'ہول سیلرز سے خریداری کریں' },
  'current': { en: 'Current', ur: 'موجودہ' },
  'switch_to': { en: 'Switch to', ur: 'تبدیل کریں' },
  'sign_up_as': { en: 'Sign up as', ur: 'کے طور پر سائن اپ کریں' },
  'registration_required': { en: 'Registration required for this role', ur: 'اس کردار کے لیے رجسٹریشن ضروری ہے' },
  
  // Role Features
  'create_manage_shops': { en: 'Create and manage shops', ur: 'دکانیں بنائیں اور ان کا انتظام کریں' },
  'list_products': { en: 'List products for sale', ur: 'فروخت کے لیے پروڈکٹس کی فہرست بنائیں' },
  'create_ads': { en: 'Create promotional ads', ur: 'تشہیری اشتہارات بنائیں' },
  'fulfill_orders': { en: 'Fulfill retailer orders', ur: 'خوردہ فروشوں کے آرڈرز پورے کریں' },
  'browse_catalogs': { en: 'Browse wholesale catalogs', ur: 'ہول سیل کیٹالاگ دیکھیں' },
  'place_bulk_orders': { en: 'Place bulk orders', ur: 'بلک آرڈرز دیں' },
  'track_orders': { en: 'Track order status', ur: 'آرڈر کی صورتحال کا پتہ لگائیں' },
  'manage_inventory': { en: 'Manage inventory purchases', ur: 'انوینٹری کی خریداری کا انتظام کریں' },
  
  // Role Permissions Categories
  'basic': { en: 'Basic', ur: 'بنیادی' },
  'admin': { en: 'Admin', ur: 'ایڈمن' },
  'business': { en: 'Business', ur: 'کاروبار' },
  'marketing': { en: 'Marketing', ur: 'مارکیٹنگ' },
  'communication': { en: 'Communication', ur: 'رابطہ' },
  
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
  
  // Search and actions
  'search': { en: 'Search', ur: 'تلاش کریں' },
  'add_to_cart': { en: 'Add to Cart', ur: 'کارٹ میں شامل کریں' },
  'price': { en: 'Price', ur: 'قیمت' },
  'category': { en: 'Category', ur: 'کیٹگری' },
  'location': { en: 'Location', ur: 'مقام' },
  'rating': { en: 'Rating', ur: 'ریٹنگ' },
  
  // Business terms
  'message_seller': { en: 'Message Seller', ur: 'فروش کنندہ کو پیغام' },
  'request_quote': { en: 'Request Quote', ur: 'قیمت کی درخواست' },
  'minimum_order': { en: 'Minimum Order', ur: 'کم سے کم آرڈر' },
  'wholesale_price': { en: 'Wholesale Price', ur: 'ہول سیل قیمت' },
  'contact_seller': { en: 'Contact Seller', ur: 'فروش کنندہ سے رابطہ' },
  'save_favorite': { en: 'Save to Favorites', ur: 'پسندیدہ میں محفوظ کریں' },
  'compare_products': { en: 'Compare Products', ur: 'پروڈکٹس کا موازنہ' },
  
  // Common actions
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
  
  // Business specific - removed duplicate 'buyer' and 'business' keys
  'buyer': { en: 'Buyer', ur: 'خریدار' },
  'marketplace': { en: 'Marketplace', ur: 'بازار' },
  
  // Profile not found
  'profile_not_found': { en: 'Profile Not Found', ur: 'پروفائل نہیں ملی' },
  'profile_not_found_desc': { en: 'Unable to load your profile information at this time.', ur: 'اس وقت آپ کی پروفائل کی معلومات لوڈ نہیں ہو سکیں۔' },
  
  // Missing translations
  'of': { en: 'of', ur: 'میں سے' },
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
