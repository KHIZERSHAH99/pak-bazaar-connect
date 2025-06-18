
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { changeRole, UserRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown } from "lucide-react";

// Utility: readable role name
const getDisplayName = (role: UserRole) =>
  role === "wholesaler"
    ? "Wholesaler"
    : role === "seller"
    ? "Seller"
    : role.charAt(0).toUpperCase() + role.slice(1);

// Utility: role color
const getRoleColor = (role: UserRole) =>
  role === "wholesaler"
    ? "bg-pakistani_green-700 text-white"
    : role === "seller"
    ? "bg-blue-600 text-white"
    : role === "admin"
    ? "bg-red-600 text-white"
    : "bg-gray-400 text-white";

// Utility: next role
const nextRole: Record<UserRole, UserRole> = {
  seller: "wholesaler",
  wholesaler: "seller",
  admin: "admin",
  pending: "seller",
};

const RoleSwitcherProminent: React.FC = () => {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!profile) return null;
  const canSwitch = profile.role === "seller" || profile.role === "wholesaler";
  const targetRole = nextRole[profile.role as UserRole];

  const handleSwitch = async () => {
    if (!canSwitch) return;
    setLoading(true);
    try {
      await changeRole(targetRole);
      toast({
        title: "Role Switched",
        description: `Switching to ${getDisplayName(targetRole)}. Page will reload...`,
        variant: "success",
      });

      // Force page reload after successful role switch
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (e) {
      toast({
        title: "Failed to switch role",
        description: "An error occurred. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-2 py-2 bg-pakistani_green-50 dark:bg-pakistani_green-900/50 border border-pakistani_green-200 dark:border-pakistani_green-800 rounded-xl px-4 shadow-sm w-fit animate-fadeIn">
      {/* Current Role */}
      <span
        className={`font-semibold px-3 py-1 rounded-md text-base font-poppins ${getRoleColor(profile.role as UserRole)}`}
      >
        {getDisplayName(profile.role as UserRole)}
      </span>
      {/* Switcher */}
      {canSwitch && (
        <button
          className="flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-pakistani_green-700/70 text-pakistani_green-900 dark:text-white hover:bg-pakistani_green-100 dark:hover:bg-pakistani_green-600 transition shadow font-poppins border focus:ring-2 ring-pakistani_green-400"
          onClick={handleSwitch}
          disabled={loading}
          title={`Switch to ${getDisplayName(targetRole)}`}
          tabIndex={0}
        >
          {loading ? (
            <span className="mr-1 animate-spin">&#9696;</span>
          ) : (
            <span>
              Switch to {getDisplayName(targetRole)}
            </span>
          )}
          <ArrowDown className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default RoleSwitcherProminent;
