
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
      <div className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-500 p-4 md:p-6 text-white">
        <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins">Role Management</h2>
        <p className="text-white/90 text-sm font-poppins">Choose your role to access platform features</p>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-amber-800 font-poppins font-medium mb-1">
                Role Change Notice
              </p>
              <p className="text-sm text-amber-700 font-poppins">
                Role changes update your account permissions immediately. To maintain security, 
                switching to a Wholesaler role requires proper business verification.
              </p>
            </div>
          </div>
        </div>

        {isSellerRole && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800 font-poppins font-medium mb-1">
                  Becoming a Wholesaler
                </p>
                <p className="text-sm text-blue-700 font-poppins">
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
