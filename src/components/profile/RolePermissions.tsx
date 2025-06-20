
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface RolePermissionsProps {
  role: string;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ role }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();

  const getPermissions = (userRole: string) => {
    const basePermissions = [
      { name: 'View Products', allowed: true, category: 'Basic' },
      { name: 'Browse Shops', allowed: true, category: 'Basic' },
      { name: 'Contact Support', allowed: true, category: 'Basic' }
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...basePermissions,
          { name: 'Manage Users', allowed: true, category: 'Admin' },
          { name: 'Approve Ads', allowed: true, category: 'Admin' },
          { name: 'View Analytics', allowed: true, category: 'Admin' },
          { name: 'System Settings', allowed: true, category: 'Admin' }
        ];
      case 'wholesaler':
        return [
          ...basePermissions,
          { name: 'Create Shops', allowed: true, category: 'Business' },
          { name: 'Add Products', allowed: true, category: 'Business' },
          { name: 'Create Ads', allowed: true, category: 'Marketing' },
          { name: 'Manage Orders', allowed: true, category: 'Business' }
        ];
      case 'seller':
        return [
          ...basePermissions,
          { name: 'Place Orders', allowed: true, category: 'Business' },
          { name: 'Track Purchases', allowed: true, category: 'Business' },
          { name: 'Message Wholesalers', allowed: true, category: 'Communication' },
          { name: 'Create Shops', allowed: false, category: 'Business' }
        ];
      default:
        return [
          ...basePermissions,
          { name: 'Create Shops', allowed: false, category: 'Business' },
          { name: 'Place Orders', allowed: false, category: 'Business' },
          { name: 'Create Ads', allowed: false, category: 'Marketing' }
        ];
    }
  };

  const permissions = getPermissions(role);
  const allowedCount = permissions.filter(p => p.allowed).length;
  const totalCount = permissions.length;

  // Group permissions by category for better mobile display
  const groupedPermissions = permissions.reduce((acc, permission) => {
    const category = permission.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(permission);
    return acc;
  }, {} as Record<string, typeof permissions>);

  if (isMobile && !isExpanded) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-pakistani_green-600" />
            <div>
              <h3 className="font-medium font-poppins text-sm">Permissions</h3>
              <p className="text-xs text-gray-500">
                {allowedCount} of {totalCount} enabled
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="h-8 w-8 p-0"
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-pakistani_green-600" />
          <h3 className="font-medium font-poppins">Role Permissions</h3>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-8 w-8 p-0"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
          <div key={category} className="space-y-2">
            {!isMobile && (
              <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                {category}
              </h4>
            )}
            <div className="space-y-1">
              {categoryPermissions.map((permission, index) => (
                <div key={index} className="flex items-center gap-2 py-1">
                  {permission.allowed ? (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-poppins ${
                    permission.allowed ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {permission.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RolePermissions;
