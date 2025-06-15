
import React from "react";
import RoleSwitcherProminent from "../navbar/RoleSwitcherProminent";
import CODBadge from "./CODBadge";
import { useAuth } from "@/contexts/AuthContext";

// Renders the top dashboard toolbar with the role and payment info
const DashboardHeader: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="flex flex-col md:flex-row items-center gap-4 justify-between mb-6 mt-2">
      <div className="flex flex-col">
        <RoleSwitcherProminent />
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
