
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import SmartRoleSwitcher from './SmartRoleSwitcher';

// This component now acts as a wrapper for the SmartRoleSwitcher
const EnhancedRoleSwitcher: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  return <SmartRoleSwitcher />;
};

export default EnhancedRoleSwitcher;
