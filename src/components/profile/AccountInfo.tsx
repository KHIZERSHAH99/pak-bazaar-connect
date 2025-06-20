
import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Calendar, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/contexts/LanguageContext';

interface AccountInfoProps {
  email?: string;
  createdAt?: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ email, createdAt }) => {
  const { t } = useLanguage();

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('not_provided');
    try {
      return format(new Date(dateString), 'MMMM dd, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <Card className="mb-6 overflow-hidden border-none shadow-md">
      <div className="bg-pakistani_green-500/20 dark:bg-pakistani_green-600/30 backdrop-blur-sm p-4 md:p-6 border-b border-pakistani_green-200/50 dark:border-pakistani_green-700/50">
        <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins text-pakistani_green-800 dark:text-pakistani_green-100">
          {t('account_information')}
        </h2>
        <p className="text-pakistani_green-700 dark:text-pakistani_green-200 text-sm font-poppins">
          {t('account_details')}
        </p>
      </div>
      
      <div className="p-4 md:p-6 bg-background/95 dark:bg-background/95">
        <div className="grid gap-4 md:gap-6">
          <div className="flex items-center gap-4 p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border/50">
            <div className="bg-pakistani_green-100 dark:bg-pakistani_green-800/50 p-3 rounded-full">
              <Mail className="h-5 w-5 text-pakistani_green-700 dark:text-pakistani_green-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-poppins mb-1">
                {t('email_address')}
              </p>
              <p className="font-medium text-foreground font-poppins">
                {email || t('not_provided')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 bg-muted/50 dark:bg-muted/30 rounded-lg border border-border/50">
            <div className="bg-pakistani_green-100 dark:bg-pakistani_green-800/50 p-3 rounded-full">
              <Calendar className="h-5 w-5 text-pakistani_green-700 dark:text-pakistani_green-300" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-poppins mb-1">
                {t('member_since')}
              </p>
              <p className="font-medium text-foreground font-poppins">
                {formatDate(createdAt)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccountInfo;
