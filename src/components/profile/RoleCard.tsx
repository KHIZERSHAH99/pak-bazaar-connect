
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { UserRole } from '@/lib/supabase';

interface RoleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  targetRole: UserRole;
  currentRole?: string;
}

const RoleCard: React.FC<RoleCardProps> = ({
  title,
  description,
  icon,
  features,
  targetRole,
  currentRole
}) => {
  const isCurrentRole = currentRole === targetRole;

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
          <div className="text-center">
            <p className="text-sm text-gray-500 font-poppins">
              Contact administrator to change your role
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RoleCard;
