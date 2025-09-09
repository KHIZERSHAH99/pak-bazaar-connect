import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ColorSwatchProps {
  color: string;
  hex?: string;
  label?: string;
  selected?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({
  color,
  hex,
  label,
  selected = false,
  onClick,
  size = "md",
  disabled = false,
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label || color}
      className={cn(
        "relative rounded-full border-2 transition-all duration-200",
        sizeClasses[size],
        selected ? "border-primary scale-110 shadow-lg" : "border-border hover:scale-105",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "cursor-pointer hover:shadow-md"
      )}
    >
      <div
        className="absolute inset-1 rounded-full"
        style={{ backgroundColor: hex || color }}
      />
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/90 rounded-full p-0.5">
            <Check className="h-3 w-3 text-primary" strokeWidth={3} />
          </div>
        </div>
      )}
    </button>
  );
};

export default ColorSwatch;