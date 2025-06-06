
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
    <RoleSelectionStep
      selectedRole={selectedRole}
      onRoleSelect={onRoleSelect}
      isLoading={isLoading}
    />
  );
};

export default RoleStep;
