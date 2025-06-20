
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ExternalLink, UserPlus } from 'lucide-react';
import { UserRole } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSmartRoleSwitch } from '@/hooks/useSmartRoleSwitch';
import { useToast } from '@/hooks/use-toast';

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  targetRole: UserRole;
  currentRole?: string;
  isRequesting: boolean;
  onRoleChange: (role: UserRole) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  icon,
  features,
  targetRole,
  currentRole,
  isRequesting,
  onRoleChange
}) => {
  const isCurrentRole = currentRole === targetRole;
  const { profile } = useAuth();
  const { switchRole, isRegisteredForRole, isSwitching, canSwitchTo } = useSmartRoleSwitch();
  const { toast } = useToast();

  const canSwitch = canSwitchTo(targetRole);
  const isRegistered = isRegisteredForRole(targetRole);

  const handleAction = async () => {
    if (profile && canSwitch) {
      await switchRole(targetRole);
    } else {
      // Fallback to original onRoleChange for non-authenticated users
      onRoleChange(targetRole);
    }
  };

  const getButtonText = () => {
    if (isSwitching) return "Processing...";
    if (!profile) return `Switch to ${title}`;
    if (!isRegistered) return `Sign up as ${title}`;
    return `Switch to ${title}`;
  };

  const getButtonIcon = () => {
    if (isSwitching) return null;
    if (!profile || !isRegistered) return <UserPlus className="ml-2 h-4 w-4" />;
    return <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />;
  };

  return (
    <Card className={`border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md ${
      isCurrentRole ? 'ring-2 ring-pakistani_green-500 bg-pakistani_green-50' : 'hover:border-pakistani_green-300'
    }`}>
      <div className="p-4 md:p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${
              isCurrentRole ? 'bg-pakistani_green-100' : 'bg-gray-100'
            }`}>
              <div className={isCurrentRole ? 'text-pakistani_green-700' : 'text-gray-600'}>
                {icon}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-lg font-poppins">{title}</h3>
              <p className="text-sm text-gray-600 font-poppins">{description}</p>
            </div>
          </div>
          {isCurrentRole && (
            <Badge variant="default" className="flex items-center gap-1 font-poppins bg-pakistani_green-100 text-pakistani_green-800">
              <CheckCircle className="h-3 w-3" />
              Current
            </Badge>
          )}
        </div>
        
        <ul className="text-sm text-gray-600 space-y-2 mb-4 ml-4 list-disc font-poppins">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        
        {!isCurrentRole && (
          <Button 
            variant="outline"
            className="w-full group font-poppins"
            onClick={handleAction}
            disabled={isSwitching || isRequesting}
            title={getButtonText()}
          >
            {getButtonText()}
            {getButtonIcon()}
          </Button>
        )}

        {/* Registration Status Indicator */}
        {!isCurrentRole && profile && !isRegistered && canSwitch && (
          <p className="text-xs text-amber-600 mt-2 font-poppins text-center">
            Registration required for this role
          </p>
        )}
      </div>
    </Card>
  );
};

export default RoleCard;
