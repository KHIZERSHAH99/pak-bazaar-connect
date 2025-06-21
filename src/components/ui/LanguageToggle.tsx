
import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useUrduLanguage } from '@/contexts/UrduLanguageContext';

const LanguageToggle = () => {
  const { language, setLanguage, t } = useUrduLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
      className="flex items-center gap-2"
    >
      <Languages className="h-4 w-4" />
      {language === 'en' ? 'اردو' : 'English'}
    </Button>
  );
};

export default LanguageToggle;
