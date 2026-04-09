import React from 'react';
import { MessageSquare } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const ChatWelcomeMessage: React.FC = () => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';

  return (
    <div className="rounded-lg p-6 mb-6 border border-primary/30 shadow-sm relative overflow-hidden bg-card" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="relative z-10 flex items-start">
        <div className={`bg-primary rounded-full p-3 shadow-md ${isRtl ? 'ml-4' : 'mr-4'}`}>
          <MessageSquare className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <div className="font-medium text-foreground text-lg mb-2">{t('aiSupport')}</div>
          <div className="text-muted-foreground">
            {t('chatWelcomeIntro')}
            <ul className={`${isRtl ? 'list-disc list-inside' : 'list-disc list-inside'} mt-3 space-y-2`}>
              <li className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>{t('chatWelcomeQ1')}</li>
              <li className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>{t('chatWelcomeQ2')}</li>
              <li className="animate-fadeIn" style={{ animationDelay: '0.3s' }}>{t('chatWelcomeQ3')}</li>
              <li className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>{t('chatWelcomeQ4')}</li>
              <li className="animate-fadeIn" style={{ animationDelay: '0.5s' }}>{t('chatWelcomeQ5')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWelcomeMessage;
