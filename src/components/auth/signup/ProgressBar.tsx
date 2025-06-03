
import React from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="w-full mt-4 flex gap-2">
      {Array.from({ length: totalSteps }).map((_, idx) => (
        <div 
          key={idx} 
          className={`h-2 rounded-full flex-1 transition-all duration-300 ${
            idx + 1 <= currentStep ? 'bg-white' : 'bg-white/30'
          }`}
        />
      ))}
    </div>
  );
};

export default ProgressBar;
