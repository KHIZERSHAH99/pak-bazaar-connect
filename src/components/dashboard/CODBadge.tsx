
import React from "react";
import { Package } from "lucide-react";

// Simple COD badge to use wherever payments are displayed prominently
const CODBadge: React.FC = () => (
  <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-200/80 dark:bg-yellow-800/70 text-yellow-800 dark:text-yellow-100 font-semibold rounded-lg shadow-sm font-poppins text-sm">
    <Package className="w-4 h-4" />
    Cash On Delivery (COD)
  </span>
);

export default CODBadge;
