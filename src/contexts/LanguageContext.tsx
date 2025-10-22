
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
    'signup': 'Signup',
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
    
    // Order Form
    'createOrder': 'Create Order',
    'productTotal': 'Product Total',
    'grandTotal': 'Grand Total',
    'buyerInformation': 'Buyer Information',
    'fullName': 'Full Name',
    'pakistaniMobileNumber': 'Pakistani Mobile Number',
    'validPakistaniMobile': 'Valid Pakistani mobile number',
    'streetAddress': 'Street Address',
    'shippingDetails': 'Shipping Details',
    'shippingCost': 'Shipping Cost',
    'estimatedDelivery': 'Estimated Delivery',
    'standardShipping': 'Standard shipping',
    'bankTransferDetails': 'Bank Transfer Details',
    'bank': 'Bank',
    'accountNumber': 'Account Number',
    'accountTitle': 'Account Title',
    'transferExactAmount': 'Transfer the exact amount (PKR {amount}) and upload the payment screenshot below',
    'paymentScreenshot': 'Payment Screenshot',
    'clickToUpload': 'Click to upload payment screenshot',
    'maxFileSize': 'PNG, JPG up to {size}',
    'creatingOrder': 'Creating Order...',
    'enterFullName': 'Enter your full name',
    'enterPhoneNumber': 'Enter phone number',
    'enterStreetAddress': 'Enter street address',
    'selectPaymentMethod': 'Select payment method',
    'loadingPaymentMethods': 'Loading payment methods...',
    'noPaymentMethods': 'No payment methods available for this shop. Please contact the wholesaler to set up payment methods.',
    'jazzcashDetails': 'JazzCash Details',
    'easypaisaDetails': 'EasyPaisa Details',
    'mobileNumber': 'Mobile Number',
    'sendToJazzcash': 'Send PKR {amount} to this JazzCash number and upload the payment screenshot',
    'sendToEasypaisa': 'Send PKR {amount} to this EasyPaisa number and upload the payment screenshot',
    'days': 'days',
    
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
    'contactUs': 'Contact Us',
    
    // Dashboard Stats
    'totalProducts': 'Total Products',
    'activeOrders': 'Active Orders',
    'customers': 'Customers',
    'ordersPlaced': 'Orders Placed',
    'totalSpent': 'Total Spent',
    'favoriteShops': 'Favorite Shops',
    'totalUsers': 'Total Users',
    'platformRevenue': 'Platform Revenue',
    'growthRate': 'Growth Rate',
    'fromLastMonth': 'from last month',
    
    // Products
    'noProductsYet': 'No products yet',
    'startAddingProducts': 'Start by adding your first product to your shop.',
    'hideInactiveProducts': 'Hide Inactive Products',
    'showInactiveProducts': 'Show Inactive Products',
    'hide': 'Hide',
    'show': 'Show',
    'inactive': 'Inactive',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'unknown': 'Unknown',
    'failedToLoadProducts': 'Failed to load products',
    'moqPieces': 'MOQ: {moq} pieces',
    
    // Shops
    'noShopsFound': 'No shops found',
    'create': 'Create',
    'createFirstShop': 'Create your first shop to start selling products on our platform.',
    'createYourFirstShop': 'Create Your First Shop',
    'verified': 'Verified',
    'createNewShop': 'Create New Shop',
    'enterShopName': 'Enter shop name',
    'enterCompleteAddress': 'Enter complete shop address',
    'shopLogo': 'Shop Logo (optional, max 5MB)',
    'creating': 'Creating...',
    'fileTooLarge': 'File too large',
    'logoMaxSize': 'Logo image must be less than 5MB',
    'invalidFileType': 'Invalid file type',
    'logoMustBeImage': 'Logo must be an image file',
    'shopCreatedSuccessfully': 'Shop created successfully!',
    'failedToCreateShop': 'Failed to create shop. Please try again.',
    'editShopDetails': 'Edit Shop Details',
    'selectCity': 'Select city',
    'updating': 'Updating...',
    'updateShop': 'Update Shop',
    'shopUpdated': 'Shop updated',
    'shopUpdatedSuccessfully': 'Your shop information has been updated successfully.',
    'failedToUpdateShop': 'Failed to update shop. Please try again.',
    'selectImageSmaller': 'Please select an image smaller than 5MB.',
    'browseWholesaleShops': 'Browse Wholesale Shops',
    'discoverVerifiedSuppliers': 'Discover verified wholesale suppliers across Pakistan',
    'searchShops': 'Search shops by name, location, or contact...',
    'clear': 'Clear',
    'loadingShops': 'Loading shops...',
    'noShopsMatchSearch': 'No shops match your search. Try different keywords.',
    'noShopsAvailable': 'There are no shops available at the moment.',
    'viewProducts': 'View Products',
    'productsAvailable': 'products available',
    
    // Profile
    'myProfile': 'My Profile',
    'manageAccountInfo': 'Manage your account information and preferences',
    'completed': 'Completed',
    'accountType': 'Account Type',
    
    // Orders
    'noOrders': 'No orders yet',
    'all': 'All',
    'attention': 'Attention',
    'active': 'Active',
    'confirmed': 'Confirmed',
    'shipped': 'Shipped',
    'delivered': 'Delivered',
    'searchOrders': 'Search orders...',
    'filterByStatus': 'Filter by status',
    'statusUpdated': 'Status Updated',
    'orderStatusChanged': 'Order status changed to {status}',
    'failedToUpdateStatus': 'Failed to update order status',
    'failedToFetchOrders': 'Failed to fetch orders. Please try again.',
    
    // Analytics
    'overview': 'Overview',
    'detailed': 'Detailed',
    'performance': 'Performance',
    'views': 'Views',
    'revenue': 'Revenue',
    'dailyActivity': 'Daily Activity',
    'ordersByStatus': 'Orders by Status',
    'topProducts': 'Top Products',
    
    // Product Dialog
    'createProduct': 'Create Product',
    'editProduct': 'Edit Product',
    'basicInfo': 'Basic Info',
    'detailedInfo': 'Detailed Info',
    'images': 'Images',
    'variations': 'Variations',
    'pricing': 'Pricing',
    'uploadImages': 'Upload Images',
    'selectShop': 'Select Shop',
    'enterProductName': 'Enter product name',
    'enterPrice': 'Enter price',
    'enterDescription': 'Enter product description',
    'selectCategory': 'Select Category',
    'productActive': 'Active',
    'moq': 'Minimum Order Quantity (MOQ)',
    'brand': 'Brand',
    'modelNumber': 'Model Number',
    'originCountry': 'Country of Origin',
    'productCreated': 'Product created successfully!',
    'productUpdated': 'Product updated successfully!',
    'failedToCreateProduct': 'Failed to create product',
    'failedToUpdateProduct': 'Failed to update product',
    'productDeleted': 'Product deleted successfully'
  },
  ur: {
    // Navigation
    'welcome': 'خوش آمدید',
    'login': 'لاگ ان',
    'signup': 'سائن اَپ',
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
    
    // Order Form
    'createOrder': 'آرڈر بنائیں',
    'productTotal': 'مصنوعات کی کل قیمت',
    'grandTotal': 'مجموعی کل',
    'buyerInformation': 'خریدار کی معلومات',
    'fullName': 'مکمل نام',
    'pakistaniMobileNumber': 'پاکستانی موبائل نمبر',
    'validPakistaniMobile': 'درست پاکستانی موبائل نمبر',
    'streetAddress': 'گلی کا پتہ',
    'shippingDetails': 'شپنگ کی تفصیلات',
    'shippingCost': 'شپنگ کی لاگت',
    'estimatedDelivery': 'تخمینی ترسیل',
    'standardShipping': 'معیاری شپنگ',
    'bankTransferDetails': 'بینک ٹرانسفر کی تفصیلات',
    'bank': 'بینک',
    'accountNumber': 'اکاؤنٹ نمبر',
    'accountTitle': 'اکاؤنٹ کا عنوان',
    'transferExactAmount': 'صحیح رقم (PKR {amount}) ٹرانسفر کریں اور نیچے ادائیگی کا اسکرین شاٹ اپ لوڈ کریں',
    'paymentScreenshot': 'ادائیگی کا اسکرین شاٹ',
    'clickToUpload': 'ادائیگی کا اسکرین شاٹ اپ لوڈ کرنے کے لیے کلک کریں',
    'maxFileSize': 'PNG, JPG {size} تک',
    'creatingOrder': 'آرڈر بنایا جا رہا ہے...',
    'enterFullName': 'اپنا مکمل نام درج کریں',
    'enterPhoneNumber': 'فون نمبر درج کریں',
    'enterStreetAddress': 'گلی کا پتہ درج کریں',
    'selectPaymentMethod': 'ادائیگی کا طریقہ منتخب کریں',
    'loadingPaymentMethods': 'ادائیگی کے طریقے لوڈ ہو رہے ہیں...',
    'noPaymentMethods': 'اس دکان کے لیے ادائیگی کے طریقے دستیاب نہیں ہیں۔ براہ کرم ادائیگی کے طریقے ترتیب دینے کے لیے ہول سیلر سے رابطہ کریں۔',
    'jazzcashDetails': 'جاز کیش کی تفصیلات',
    'easypaisaDetails': 'ایزی پیسہ کی تفصیلات',
    'mobileNumber': 'موبائل نمبر',
    'sendToJazzcash': 'اس جاز کیش نمبر پر PKR {amount} بھیجیں اور ادائیگی کا اسکرین شاٹ اپ لوڈ کریں',
    'sendToEasypaisa': 'اس ایزی پیسہ نمبر پر PKR {amount} بھیجیں اور ادائیگی کا اسکرین شاٹ اپ لوڈ کریں',
    'days': 'دن',
    
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
    'contactUs': 'ہم سے رابطہ کریں',
    
    // Dashboard Stats
    'totalProducts': 'کل مصنوعات',
    'activeOrders': 'فعال آرڈرز',
    'customers': 'گاہک',
    'ordersPlaced': 'آرڈرز دیے',
    'totalSpent': 'کل خرچ',
    'favoriteShops': 'پسندیدہ دکانیں',
    'totalUsers': 'کل صارفین',
    'platformRevenue': 'پلیٹ فارم آمدنی',
    'growthRate': 'ترقی کی شرح',
    'fromLastMonth': 'پچھلے مہینے سے',
    
    // Products
    'noProductsYet': 'ابھی کوئی مصنوعات نہیں',
    'startAddingProducts': 'اپنی دکان میں پہلی مصنوعات شامل کر کے شروع کریں۔',
    'hideInactiveProducts': 'غیر فعال مصنوعات چھپائیں',
    'showInactiveProducts': 'غیر فعال مصنوعات دکھائیں',
    'hide': 'چھپائیں',
    'show': 'دکھائیں',
    'inactive': 'غیر فعال',
    'approved': 'منظور شدہ',
    'rejected': 'مسترد',
    'unknown': 'نامعلوم',
    'failedToLoadProducts': 'مصنوعات لوڈ نہیں ہو سکیں',
    'moqPieces': 'کم سے کم مقدار: {moq} عدد',
    
    // Shops
    'noShopsFound': 'کوئی دکان نہیں ملی',
    'create': 'بنائیں',
    'createFirstShop': 'ہمارے پلیٹ فارم پر مصنوعات فروخت کرنے کے لیے اپنی پہلی دکان بنائیں۔',
    'createYourFirstShop': 'اپنی پہلی دکان بنائیں',
    'verified': 'تصدیق شدہ',
    'createNewShop': 'نئی دکان بنائیں',
    'enterShopName': 'دکان کا نام درج کریں',
    'enterCompleteAddress': 'دکان کا مکمل پتہ درج کریں',
    'shopLogo': 'دکان کا لوگو (اختیاری، زیادہ سے زیادہ 5MB)',
    'creating': 'بنایا جا رہا ہے...',
    'fileTooLarge': 'فائل بہت بڑی ہے',
    'logoMaxSize': 'لوگو تصویر 5MB سے کم ہونی چاہیے',
    'invalidFileType': 'غلط فائل قسم',
    'logoMustBeImage': 'لوگو تصویر فائل ہونی چاہیے',
    'shopCreatedSuccessfully': 'دکان کامیابی سے بنائی گئی!',
    'failedToCreateShop': 'دکان بنانا ناکام۔ دوبارہ کوشش کریں۔',
    'editShopDetails': 'دکان کی تفصیلات میں ترمیم',
    'selectCity': 'شہر منتخب کریں',
    'updating': 'اپ ڈیٹ ہو رہا ہے...',
    'updateShop': 'دکان اپ ڈیٹ کریں',
    'shopUpdated': 'دکان اپ ڈیٹ ہو گئی',
    'shopUpdatedSuccessfully': 'آپ کی دکان کی معلومات کامیابی سے اپ ڈیٹ ہو گئی ہیں۔',
    'failedToUpdateShop': 'دکان اپ ڈیٹ نہیں ہو سکی۔ دوبارہ کوشش کریں۔',
    'selectImageSmaller': 'براہ کرم 5MB سے چھوٹی تصویر منتخب کریں۔',
    'browseWholesaleShops': 'ہول سیل دکانیں دیکھیں',
    'discoverVerifiedSuppliers': 'پاکستان بھر میں تصدیق شدہ ہول سیل فراہم کنندگان دریافت کریں',
    'searchShops': 'نام، مقام یا رابطہ کے ذریعے دکانیں تلاش کریں...',
    'clear': 'صاف کریں',
    'loadingShops': 'دکانیں لوڈ ہو رہی ہیں...',
    'noShopsMatchSearch': 'آپ کی تلاش سے کوئی دکان میل نہیں کھاتی۔ مختلف الفاظ آزمائیں۔',
    'noShopsAvailable': 'اس وقت کوئی دکان دستیاب نہیں ہے۔',
    'viewProducts': 'مصنوعات دیکھیں',
    'productsAvailable': 'مصنوعات دستیاب ہیں',
    
    // Profile
    'myProfile': 'میری پروفائل',
    'manageAccountInfo': 'اپنے اکاؤنٹ کی معلومات اور ترجیحات کا نظم کریں',
    'completed': 'مکمل',
    'accountType': 'اکاؤنٹ کی قسم',
    
    // Orders
    'noOrders': 'ابھی کوئی آرڈر نہیں',
    'all': 'تمام',
    'attention': 'توجہ',
    'active': 'فعال',
    'confirmed': 'تصدیق شدہ',
    'shipped': 'بھیج دیا گیا',
    'delivered': 'پہنچا دیا گیا',
    'searchOrders': 'آرڈرز تلاش کریں...',
    'filterByStatus': 'حیثیت کے مطابق فلٹر کریں',
    'statusUpdated': 'حیثیت اپ ڈیٹ ہو گئی',
    'orderStatusChanged': 'آرڈر کی حیثیت {status} میں تبدیل ہو گئی',
    'failedToUpdateStatus': 'آرڈر کی حیثیت اپ ڈیٹ نہیں ہو سکی',
    'failedToFetchOrders': 'آرڈرز لانے میں ناکامی۔ دوبارہ کوشش کریں۔',
    
    // Analytics
    'overview': 'جائزہ',
    'detailed': 'تفصیلی',
    'performance': 'کارکردگی',
    'views': 'نظارے',
    'revenue': 'آمدنی',
    'dailyActivity': 'روزانہ سرگرمی',
    'ordersByStatus': 'حیثیت کے مطابق آرڈرز',
    'topProducts': 'سرفہرست مصنوعات',
    
    // Product Dialog
    'createProduct': 'مصنوعات بنائیں',
    'editProduct': 'مصنوعات میں ترمیم',
    'basicInfo': 'بنیادی معلومات',
    'detailedInfo': 'تفصیلی معلومات',
    'images': 'تصاویر',
    'variations': 'تغیرات',
    'pricing': 'قیمت',
    'uploadImages': 'تصاویر اپ لوڈ کریں',
    'selectShop': 'دکان منتخب کریں',
    'enterProductName': 'مصنوعات کا نام درج کریں',
    'enterPrice': 'قیمت درج کریں',
    'enterDescription': 'مصنوعات کی تفصیل درج کریں',
    'selectCategory': 'زمرہ منتخب کریں',
    'productActive': 'فعال',
    'moq': 'کم سے کم آرڈر کی مقدار (MOQ)',
    'brand': 'برانڈ',
    'modelNumber': 'ماڈل نمبر',
    'originCountry': 'ملک',
    'productCreated': 'مصنوعات کامیابی سے بنائی گئی!',
    'productUpdated': 'مصنوعات کامیابی سے اپ ڈیٹ ہو گئی!',
    'failedToCreateProduct': 'مصنوعات بنانا ناکام',
    'failedToUpdateProduct': 'مصنوعات اپ ڈیٹ ناکام',
    'productDeleted': 'مصنوعات کامیابی سے حذف ہو گئی'
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
