
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Bot, Headphones } from 'lucide-react';
import ModernChatInterface from '@/components/chat/ModernChatInterface';
import { useLanguage } from '@/contexts/LanguageContext';

const UnifiedChatSupport: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="bg-pakistani_green-100 dark:bg-pakistani_green-900/50 p-3 rounded-full">
            <Headphones className="h-8 w-8 text-pakistani_green-600 dark:text-pakistani_green-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground font-poppins">{t('support_chat') || 'Support Chat'}</h1>
        </div>
        <p className="text-muted-foreground font-poppins max-w-2xl mx-auto">
          {t('chat_description') || 'Get instant help with our AI-powered support assistant. Ask questions about creating ads, managing products, or any platform features.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
          <CardHeader className="text-center pb-3">
            <Bot className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <CardTitle className="text-blue-800 dark:text-blue-200 font-poppins">AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700 dark:text-blue-300 text-sm font-poppins text-center">
              Available 24/7 to help with platform questions and guidance
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
          <CardHeader className="text-center pb-3">
            <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <CardTitle className="text-green-800 dark:text-green-200 font-poppins">Instant Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700 dark:text-green-300 text-sm font-poppins text-center">
              Get immediate answers to common questions and issues
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
          <CardHeader className="text-center pb-3">
            <MessageSquare className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <CardTitle className="text-purple-800 dark:text-purple-200 font-poppins">Multi-language</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-purple-700 dark:text-purple-300 text-sm font-poppins text-center">
              Support available in English and Urdu
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <ModernChatInterface className="w-full max-w-4xl" />
      </div>
    </div>
  );
};

export default UnifiedChatSupport;
