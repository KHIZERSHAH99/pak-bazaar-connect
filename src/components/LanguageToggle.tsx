
import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const languages = [
    { code: 'en' as const, name: t('english'), flag: '🇺🇸', label: 'EN' },
    { code: 'ur' as const, name: t('urdu'), flag: '🇵🇰', label: 'اردو' },
  ];

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = (langCode: 'en' | 'ur') => {
    console.log('Changing language to:', langCode);
    setLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-3 gap-2 hover:bg-pakistani_green-50 dark:hover:bg-pakistani_green-900/20 transition-all duration-200"
          aria-label={`Switch language - Currently ${currentLang.name}`}
        >
          <Globe className="h-4 w-4 text-pakistani_green-600 dark:text-pakistani_green-400" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentLang.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[140px] bg-white dark:bg-gray-800 z-50"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer flex items-center gap-3 ${
              language === lang.code ? 'bg-pakistani_green-50 dark:bg-pakistani_green-900/20 text-pakistani_green-700 dark:text-pakistani_green-300' : ''
            }`}
          >
            <span className="text-lg">{lang.flag}</span>
            <span className="font-poppins font-medium">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-pakistani_green-600 dark:text-pakistani_green-400 text-sm">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
