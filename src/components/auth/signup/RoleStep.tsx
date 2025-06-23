
import React from 'react';
import { UserRole } from '@/lib/types';
import RoleSelectionStep from '../RoleSelectionStep';

interface RoleStepProps {
  selectedRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
  isLoading: boolean;
}

const RoleStep: React.FC<RoleStepProps> = ({ selectedRole, onRoleSelect, isLoading }) => {
  return (
    <div className="bg-background dark:bg-background rounded-xl shadow-sm p-0">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-foreground font-poppins">Choose Your Account Type</h2>
        <p className="text-muted-foreground mt-2 font-poppins text-sm">
          Select your business role to get started with the platform
        </p>
      </div>
      <RoleSelectionStep
        selectedRole={selectedRole}
        onRoleSelect={onRoleSelect}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RoleStep;
