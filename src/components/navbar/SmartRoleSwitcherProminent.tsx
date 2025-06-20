
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSmartRoleSwitch } from "@/hooks/useSmartRoleSwitch";
import { UserRole } from "@/lib/types";
import { ArrowRight, UserPlus, RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Utility functions
const getDisplayName = (role: UserRole) =>
  role === "wholesaler"
    ? "Wholesaler"
    : role === "seller"
    ? "Seller"
    : role.charAt(0).toUpperCase() + role.slice(1);

const getRoleColor = (role: UserRole) =>
  role === "wholesaler"
    ? "bg-pakistani_green-700 text-white"
    : role === "seller"
    ? "bg-blue-600 text-white"
    : role === "admin"
    ? "bg-red-600 text-white"
    : "bg-gray-400 text-white";

const nextRole: Record<UserRole, UserRole> = {
  seller: "wholesaler",
  wholesaler: "seller",
  admin: "admin",
  pending: "seller",
};

const SmartRoleSwitcherProminent: React.FC = () => {
  const { profile } = useAuth();
  const { switchRole, isRegisteredForRole, isSwitching, canSwitchTo } = useSmartRoleSwitch();

  if (!profile) return null;

  const currentRole = profile.role as UserRole;
  const targetRole = nextRole[currentRole];
  const canSwitch = canSwitchTo(targetRole);
  const isRegistered = isRegisteredForRole(targetRole);

  const handleAction = async () => {
    if (canSwitch) {
      await switchRole(targetRole);
    }
  };

  const getActionText = () => {
    if (!canSwitch) return null;
    if (!isRegistered) return `Sign up as ${getDisplayName(targetRole)}`;
    return `Switch to ${getDisplayName(targetRole)}`;
  };

  const getActionIcon = () => {
    if (isSwitching) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (!isRegistered) return <UserPlus className="w-4 h-4" />;
    return <ArrowRight className="w-4 h-4" />;
  };

  return (
    <div className="space-y-3">
      {/* Current Role Display */}
      <div className="flex items-center gap-4 py-2 bg-pakistani_green-50 dark:bg-pakistani_green-900/50 border border-pakistani_green-200 dark:border-pakistani_green-800 rounded-xl px-4 shadow-sm w-fit animate-fadeIn">
        <span
          className={`font-semibold px-3 py-1 rounded-md text-base font-poppins ${getRoleColor(currentRole)}`}
        >
          {getDisplayName(currentRole)}
        </span>

        {/* Action Button */}
        {(canSwitch || !isRegistered) && (
          <button
            className="flex items-center gap-2 px-3 py-1 rounded-md bg-white dark:bg-pakistani_green-700/70 text-pakistani_green-900 dark:text-white hover:bg-pakistani_green-100 dark:hover:bg-pakistani_green-600 transition shadow font-poppins border focus:ring-2 ring-pakistani_green-400 disabled:opacity-50"
            onClick={handleAction}
            disabled={isSwitching}
            title={getActionText() || ""}
          >
            {getActionIcon()}
            <span>{isSwitching ? "Processing..." : getActionText()}</span>
          </button>
        )}
      </div>

      {/* Status Messages */}
      {!canSwitch && currentRole !== 'admin' && (
        <Alert className="w-fit">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="font-poppins text-sm">
            Role switching is limited. Contact administrator for role changes.
          </AlertDescription>
        </Alert>
      )}

      {canSwitch && !isRegistered && (
        <Alert className="w-fit bg-blue-50 border-blue-200">
          <UserPlus className="h-4 w-4 text-blue-600" />
          <AlertDescription className="font-poppins text-sm text-blue-800">
            Complete {getDisplayName(targetRole)} registration to access those features.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SmartRoleSwitcherProminent;
