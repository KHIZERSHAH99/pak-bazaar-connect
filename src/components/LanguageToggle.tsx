
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
    { code: 'en' as const, name: 'English', flag: '🇺🇸', label: 'EN' },
    { code: 'ur' as const, name: 'اردو', flag: '🇵🇰', label: 'اردو' },
  ];

  const currentLang = languages.find(lang => lang.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-2 gap-1 hover:bg-green-50 dark:hover:bg-green-900/20"
          aria-label={`Switch language - Currently ${currentLang.name}`}
        >
          <Globe className="h-4 w-4" />
          <span className="text-sm font-medium">
            {currentLang.label}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg min-w-[120px] z-50"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
              language === lang.code ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' : ''
            }`}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="font-poppins">{lang.name}</span>
            {language === lang.code && (
              <span className="ml-auto text-green-600 dark:text-green-400">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageToggle;
