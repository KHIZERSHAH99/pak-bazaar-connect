
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);

  const languages = [
    { code: 'en' as const, name: 'English', flag: '🇺🇸', label: 'EN' },
    { code: 'ur' as const, name: 'اردو', flag: '🇵🇰', label: 'اردو' },
  ];

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = async (langCode: 'en' | 'ur') => {
    if (langCode === language) return;
    
    setIsChanging(true);
    console.log('Changing language from', language, 'to', langCode);
    
    try {
      await setLanguage(langCode);
      console.log('Language changed successfully to:', langCode);
      
      // Force a small delay to ensure the change is processed
      setTimeout(() => {
        setIsChanging(false);
      }, 100);
    } catch (error) {
      console.error('Error changing language:', error);
      setIsChanging(false);
    }
  };

  // Debug effect to track language changes
  useEffect(() => {
    console.log('Current language in LanguageToggle:', language);
    console.log('Document dir:', document.documentElement.dir);
    console.log('Document lang:', document.documentElement.lang);
  }, [language]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-3 gap-2 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 transition-all duration-200"
          aria-label={`Switch language - Currently ${currentLang.name}`}
          disabled={isChanging}
        >
          <Globe className="h-4 w-4 text-pakistani_green-600 dark:text-pakistani_green-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isChanging ? '...' : currentLang.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[140px] bg-white dark:bg-gray-800 border shadow-lg z-50"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-700 ${
              language === lang.code ? 'bg-pakistani_green-50 dark:bg-pakistani_green-900/20 text-pakistani_green-700 dark:text-pakistani_green-300' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="font-poppins font-medium flex-1">{lang.name}</span>
            {language === lang.code && (
              <Check className="h-4 w-4 text-pakistani_green-600 dark:text-pakistani_green-400" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
