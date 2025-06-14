
import React from 'react';
import { Card } from '@/components/ui/card';
import { Store, ShoppingBag, AlertTriangle, Info } from 'lucide-react';
import { UserRole } from '@/lib/supabase';
import RoleCard from './RoleCard';

interface RoleManagementProps {
  currentRole?: string;
  isRequesting: boolean;
  onRoleChange: (role: UserRole) => void;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  currentRole,
  isRequesting,
  onRoleChange
}) => {
  const isSellerRole = currentRole === 'seller';

  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-pakistani_green-500/20 dark:bg-pakistani_green-600/30 backdrop-blur-sm p-4 md:p-6 border-b border-pakistani_green-200/50 dark:border-pakistani_green-700/50">
        <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins text-pakistani_green-800 dark:text-pakistani_green-100">Role Management</h2>
        <p className="text-pakistani_green-700 dark:text-pakistani_green-200 text-sm font-poppins">Choose your role to access platform features</p>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="bg-amber-50/80 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-700/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800 dark:text-amber-200 font-poppins font-medium mb-1">
                Role Change Notice
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 font-poppins">
                Role changes update your account permissions immediately. To maintain security, 
                switching to a Wholesaler role requires proper business verification.
              </p>
            </div>
          </div>
        </div>

        {isSellerRole && (
          <div className="bg-blue-50/80 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 dark:text-blue-200 font-poppins font-medium mb-1">
                  Becoming a Wholesaler
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300 font-poppins">
                  To become a wholesaler, you'll need to complete a separate signup process with business verification. 
                  This ensures all wholesalers on our platform are legitimate businesses.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <RoleCard
            title="Wholesaler"
            description="Sell products to retailers"
            icon={<Store className="h-6 w-6" />}
            features={[
              'Create and manage shops',
              'List products for sale',
              'Create promotional ads',
              'Fulfill retailer orders'
            ]}
            targetRole="wholesaler"
            currentRole={currentRole}
            isRequesting={isRequesting}
            onRoleChange={onRoleChange}
          />
          
          <RoleCard
            title="Seller"
            description="Purchase from wholesalers"
            icon={<ShoppingBag className="h-6 w-6" />}
            features={[
              'Browse wholesale catalogs',
              'Place bulk orders',
              'Track order status',
              'Manage inventory purchases'
            ]}
            targetRole="seller"
            currentRole={currentRole}
            isRequesting={isRequesting}
            onRoleChange={onRoleChange}
          />
        </div>
      </div>
    </Card>
  );
};

export default RoleManagement;
