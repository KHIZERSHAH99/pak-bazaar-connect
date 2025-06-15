
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
      <RoleSelectionStep
        selectedRole={selectedRole}
        onRoleSelect={onRoleSelect}
        isLoading={isLoading}
      />
    </div>
  );
};

export default RoleStep;
