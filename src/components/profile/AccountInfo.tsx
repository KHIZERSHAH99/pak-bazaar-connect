
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
    <Card className="mb-4 sm:mb-6 overflow-hidden border-none shadow-md">
      <div className="bg-primary/20 backdrop-blur-sm p-3 sm:p-4 md:p-6 border-b border-primary/20">
        <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-1 sm:mb-2 font-poppins text-foreground">
          {t('account_information')}
        </h2>
        <p className="text-muted-foreground text-xs sm:text-sm font-poppins">
          {t('account_details')}
        </p>
      </div>
      
      <div className="p-3 sm:p-4 md:p-6 bg-background/95">
        <div className="grid gap-3 sm:gap-4 md:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="bg-primary/10 p-2 sm:p-2.5 md:p-3 rounded-full">
              <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground font-poppins mb-0.5 sm:mb-1">
                {t('email_address')}
              </p>
              <p className="font-medium text-foreground font-poppins text-sm sm:text-base truncate">
                {email || t('not_provided')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="bg-primary/10 p-2 sm:p-2.5 md:p-3 rounded-full">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-xs sm:text-sm text-muted-foreground font-poppins mb-0.5 sm:mb-1">
                {t('member_since')}
              </p>
              <p className="font-medium text-foreground font-poppins text-sm sm:text-base">
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
