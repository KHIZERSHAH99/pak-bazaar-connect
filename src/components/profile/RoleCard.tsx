
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { UserRole } from '@/lib/supabase';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { changeRole } from '@/lib/auth';
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

// RoleCard lets sellers request upgrade to wholesaler even if logged in
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
  const isSellerToWholesaler = currentRole === 'seller' && targetRole === 'wholesaler';

  const { profile, checkAuthStatus } = useAuth();
  const { toast } = useToast();
  const [switching, setSwitching] = useState(false);

  // Seller can upgrade directly from here
  const handleSellerToWholesaler = async () => {
    try {
      setSwitching(true);
      await changeRole('wholesaler');
      await checkAuthStatus();
      toast({ title: "Role change requested!", description: "Your request to become a wholesaler is submitted for admin approval." });
    } catch (e) {
      toast({ title: "Upgrade failed", description: "Could not request upgrade. Please try again or contact support.", variant: "destructive" });
    } finally {
      setSwitching(false);
    }
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
        
        {/* Enable wholesaler upgrade for sellers */}
        {!isCurrentRole && (
          <>
            {/* If the current user is 'seller' and this card is 'wholesaler', allow upgrade */}
            {isSellerToWholesaler && profile?.role === 'seller' ? (
              <Button 
                variant="outline"
                className="w-full group font-poppins"
                onClick={handleSellerToWholesaler}
                disabled={switching}
                title="Request to become a wholesaler"
              >
                {switching ? (
                  <>
                    Requesting...
                  </>
                ) : (
                  <>
                    Apply as Wholesaler
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            ) : (
              // Fallback for all others (including logged-out)
              <Button 
                variant="outline" 
                className="w-full group font-poppins"
                onClick={() => onRoleChange(targetRole)}
                disabled={isRequesting}
              >
                Switch to {title}
                <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            )}
          </>
        )}
      </div>
    </Card>
  );
};

export default RoleCard;

