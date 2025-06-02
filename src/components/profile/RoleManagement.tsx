
import React from 'react';
import { Card } from '@/components/ui/card';
import { Store, ShoppingBag } from 'lucide-react';
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
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-500 p-4 md:p-6 text-white">
        <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins">Role Management</h2>
        <p className="text-white/90 text-sm font-poppins">Choose your role to access platform features instantly</p>
      </div>
      
      <div className="p-4 md:p-6">
        <p className="text-gray-600 mb-6 font-poppins text-sm md:text-base">
          Select your role to access specific features. Changes are applied immediately.
        </p>
        
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

