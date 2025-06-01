
import React from 'react';
import { Card } from '@/components/ui/card';
import { Store, ShoppingBag, HelpCircle } from 'lucide-react';
import { UserRole, requestRoleChange } from '@/lib/supabase';
import RoleCard from './RoleCard';

interface RoleManagementProps {
  currentRole?: string;
  isRequesting: boolean;
  onRoleRequest: (role: UserRole) => void;
}

const RoleManagement: React.FC<RoleManagementProps> = ({
  currentRole,
  isRequesting,
  onRoleRequest
}) => {
  return (
    <Card className="overflow-hidden border-none shadow-md">
      <div className="bg-gradient-to-r from-pakistani_green-700 to-pakistani_green-600 p-4 md:p-6 text-white">
        <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins">Role Management</h2>
        <p className="text-white/80 text-sm font-poppins">Choose your role to access platform features</p>
      </div>
      
      <div className="p-4 md:p-6">
        <p className="text-gray-600 mb-6 font-poppins text-sm md:text-base">
          Select your role to access specific features. Role changes require admin approval for security.
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
            onRoleRequest={onRoleRequest}
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
            onRoleRequest={onRoleRequest}
          />
        </div>
        
        {currentRole === 'pending' && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-md border border-yellow-200 text-yellow-800 animate-pulse">
            <div className="flex items-start gap-3">
              <HelpCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium font-poppins">Your role request is pending approval</p>
                <p className="text-sm mt-1 font-poppins">
                  An administrator will review your request shortly. You'll get access to role-specific features once approved.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RoleManagement;
