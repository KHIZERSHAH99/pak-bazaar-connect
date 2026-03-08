
import React from 'react';
import { Card } from '@/components/ui/card';
import { Store, ShoppingBag, AlertTriangle, Info } from 'lucide-react';
import { UserRole } from '@/lib/supabase';
import { useLanguage } from '@/contexts/LanguageContext';
import RoleCard from './RoleCard';

interface RoleManagementProps {
  currentRole?: string;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  currentRole
}) => {
  const isSellerRole = currentRole === 'seller';
  const { t } = useLanguage();

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-primary/10 backdrop-blur-sm p-4 md:p-6 border-b border-primary/20">
        <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins text-foreground">
          {t('role_management')}
        </h2>
        <p className="text-muted-foreground text-sm font-poppins">
          {t('your_current_role')}
        </p>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-800 dark:text-blue-200 font-poppins font-medium mb-1">
                Role Information
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-poppins">
                Your account role determines what features you can access on the platform.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <RoleCard
            title={t('wholesaler')}
            description={t('sell_to_retailers')}
            icon={<Store className="h-6 w-6" />}
            features={[
              t('create_manage_shops'),
              t('list_products'),
              t('create_ads'),
              t('fulfill_orders')
            ]}
            targetRole="wholesaler"
            currentRole={currentRole}
          />
          
          <RoleCard
            title={t('seller')}
            description={t('purchase_from_wholesalers')}
            icon={<ShoppingBag className="h-6 w-6" />}
            features={[
              t('browse_catalogs'),
              t('place_bulk_orders'),
              t('track_orders'),
              t('manage_inventory')
            ]}
            targetRole="seller"
            currentRole={currentRole}
          />
        </div>
      </div>
    </Card>
  );
};

export default RoleManagement;
