
import React from "react";
import CODBadge from "./CODBadge";
import { useAuth } from "@/contexts/AuthContext";

// Renders the top dashboard toolbar with the role and payment info
const DashboardHeader: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 justify-between mb-6 mt-2">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold text-foreground font-poppins">
          Dashboard - {profile?.role && profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
        </h2>
        <p className="text-sm text-muted-foreground font-poppins">
          Manage your business operations
        </p>
      </div>
      {/* Show COD badge if user is seller/wholesaler */}
      {(profile?.role === "seller" || profile?.role === "wholesaler") && (
        <div>
          <CODBadge />
        </div>
      )}
    </div>
  );
};

export default DashboardHeader;
