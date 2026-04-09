import React from 'react';
import { Store, ShoppingBag } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface RoleSelectionStepProps {
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  isLoading: boolean;
}

const RoleSelectionStep: React.FC<RoleSelectionStepProps> = ({
  selectedRole,
  onRoleSelect,
  isLoading
}) => {
  const { t, language } = useLanguage();
  const isRtl = language === 'ur';

  const roles = [
    {
      id: 'wholesaler' as UserRole,
      title: t('wholesalerTitle'),
      description: t('wholesalerDesc'),
      icon: <Store className="h-8 w-8" />,
      features: [t('wholesalerF1'), t('wholesalerF2'), t('wholesalerF3'), t('wholesalerF4')]
    },
    {
      id: 'seller' as UserRole,
      title: t('sellerTitle'),
      description: t('sellerDesc'),
      icon: <ShoppingBag className="h-8 w-8" />,
      features: [t('sellerF1'), t('sellerF2'), t('sellerF3'), t('sellerF4')]
    }
  ];

  return (
    <div className="space-y-6 animate-fadeIn bg-background rounded-md" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-foreground mb-2 font-poppins">{t('chooseBusinessRole')}</h3>
        <p className="text-muted-foreground font-poppins">{t('selectHowToUse')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedRole === role.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border hover:border-primary/30 bg-card'
            }`}
            onClick={() => onRoleSelect(role.id)}
          >
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-full ${isRtl ? 'ml-4' : 'mr-4'} ${
                selectedRole === role.id ? 'bg-primary/10' : 'bg-muted'
              }`}>
                <div className={selectedRole === role.id ? 'text-primary' : 'text-muted-foreground'}>
                  {role.icon}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold font-poppins text-foreground">{role.title}</h4>
                <p className="text-sm text-muted-foreground font-poppins">{role.description}</p>
              </div>
            </div>

            <ul className="space-y-2">
              {role.features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm text-foreground font-poppins">
                  <div className={`w-2 h-2 bg-primary rounded-full ${isRtl ? 'ml-3' : 'mr-3'}`}></div>
                  {feature}
                </li>
              ))}
            </ul>

            {selectedRole === role.id && (
              <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary font-poppins">
                  ✓ {t('selectedContinue')} - {role.id === 'wholesaler' ? t('businessVerification') : t('basicInformation')}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-lg border border-primary/20">
        <p className="text-sm text-primary font-poppins text-center">
          <strong>{t('note')}:</strong> {selectedRole === 'wholesaler' 
            ? t('wholesalerNote')
            : t('sellerNote')
          }
        </p>
      </div>
    </div>
  );
};

export default RoleSelectionStep;
