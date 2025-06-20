
import React from 'react';
import { Card } from '@/components/ui/card';
import { Shield, Check, X } from 'lucide-react';

interface RolePermissionsProps {
  role: string;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ role }) => {
  const getPermissions = (userRole: string) => {
    const basePermissions = [
      { name: 'View Products', allowed: true },
      { name: 'Browse Shops', allowed: true },
      { name: 'Contact Support', allowed: true }
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...basePermissions,
          { name: 'Manage Users', allowed: true },
          { name: 'Approve Ads', allowed: true },
          { name: 'View Analytics', allowed: true },
          { name: 'System Settings', allowed: true }
        ];
      case 'wholesaler':
        return [
          ...basePermissions,
          { name: 'Create Shops', allowed: true },
          { name: 'Add Products', allowed: true },
          { name: 'Create Ads', allowed: true },
          { name: 'Manage Orders', allowed: true }
        ];
      case 'seller':
        return [
          ...basePermissions,
          { name: 'Place Orders', allowed: true },
          { name: 'Track Purchases', allowed: true },
          { name: 'Message Wholesalers', allowed: true },
          { name: 'Create Shops', allowed: false }
        ];
      default:
        return [
          ...basePermissions,
          { name: 'Create Shops', allowed: false },
          { name: 'Place Orders', allowed: false },
          { name: 'Create Ads', allowed: false }
        ];
    }
  };

  const permissions = getPermissions(role);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-5 w-5 text-blue-600" />
        <h3 className="font-medium font-poppins">Role Permissions</h3>
      </div>
      <div className="space-y-2">
        {permissions.map((permission, index) => (
          <div key={index} className="flex items-center gap-2">
            {permission.allowed ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <X className="h-4 w-4 text-gray-400" />
            )}
            <span className={`text-sm font-poppins ${
              permission.allowed ? 'text-gray-700' : 'text-gray-400'
            }`}>
              {permission.name}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RolePermissions;
