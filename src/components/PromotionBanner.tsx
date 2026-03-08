
import React, { useState } from "react";
import { X } from "lucide-react";

interface PromotionBannerProps {
  message: string;
  showCloseButton?: boolean;
}

const PromotionBanner: React.FC<PromotionBannerProps> = ({ 
  message, 
  showCloseButton = true 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground py-3 px-4 text-center relative animate-pulse">
      <div className="container mx-auto flex justify-center items-center">
        <span className="text-sm font-medium">{message}</span>
        
        {showCloseButton && (
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/80 hover:text-white"
            aria-label="Close promotion banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PromotionBanner;
