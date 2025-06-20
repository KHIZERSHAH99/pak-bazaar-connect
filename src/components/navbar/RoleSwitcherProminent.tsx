
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import SmartRoleSwitcherProminent from './SmartRoleSwitcherProminent';

// This component now acts as a wrapper for the SmartRoleSwitcherProminent
const RoleSwitcherProminent: React.FC = () => {
  const { profile } = useAuth();

  if (!profile) return null;

  return <SmartRoleSwitcherProminent />;
};

export default RoleSwitcherProminent;
