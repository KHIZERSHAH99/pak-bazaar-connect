
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Check, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLanguage } from '@/contexts/LanguageContext';

interface RolePermissionsProps {
  role: string;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ role }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const getPermissions = (userRole: string) => {
    const basePermissions = [
      { name: t('view_products'), allowed: true, category: t('basic') },
      { name: t('browse_shops'), allowed: true, category: t('basic') },
      { name: t('contact_support'), allowed: true, category: t('basic') }
    ];

    switch (userRole) {
      case 'admin':
        return [
          ...basePermissions,
          { name: t('manage_users'), allowed: true, category: t('admin') },
          { name: t('approve_ads'), allowed: true, category: t('admin') },
          { name: t('view_analytics'), allowed: true, category: t('admin') },
          { name: t('system_settings'), allowed: true, category: t('admin') }
        ];
      case 'wholesaler':
        return [
          ...basePermissions,
          { name: t('create_shops'), allowed: true, category: t('business') },
          { name: t('add_products'), allowed: true, category: t('business') },
          { name: t('create_ads'), allowed: true, category: t('marketing') },
          { name: t('manage_orders'), allowed: true, category: t('business') }
        ];
      case 'seller':
        return [
          ...basePermissions,
          { name: t('place_orders'), allowed: true, category: t('business') },
          { name: t('track_purchases'), allowed: true, category: t('business') },
          { name: t('message_wholesalers'), allowed: true, category: t('communication') },
          { name: t('create_shops'), allowed: false, category: t('business') }
        ];
      default:
        return [
          ...basePermissions,
          { name: t('create_shops'), allowed: false, category: t('business') },
          { name: t('place_orders'), allowed: false, category: t('business') },
          { name: t('create_ads'), allowed: false, category: t('marketing') }
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
            <Shield className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium font-poppins text-sm">{t('permissions')}</h3>
              <p className="text-xs text-gray-500">
                {allowedCount} {t('of')} {totalCount} {t('enabled')}
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
          <h3 className="font-medium font-poppins">{t('role_permissions')}</h3>
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
