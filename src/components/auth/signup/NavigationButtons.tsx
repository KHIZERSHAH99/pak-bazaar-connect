
import React from 'react';
import { Button } from '@/components/ui/button';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  isLoading: boolean;
  selectedRole: string;
  onPrevStep: () => void;
  onNextStep: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentStep,
  totalSteps,
  isLoading,
  selectedRole,
  onPrevStep,
  onNextStep
}) => {
  console.log('NavigationButtons render - currentStep:', currentStep, 'totalSteps:', totalSteps, 'isLoading:', isLoading);
  
  const handleSubmitClick = (e: React.MouseEvent) => {
    console.log('Submit button clicked for step:', currentStep);
    e.preventDefault();
    
    // Trigger form submission by calling onNextStep which will handle form validation and submission
    onNextStep();
  };

  const handleNextClick = (e: React.MouseEvent) => {
    console.log('Next button clicked for step:', currentStep);
    e.preventDefault();
    onNextStep();
  };

  return (
    <div className="flex justify-between pt-4">
      {currentStep > 1 && (
        <Button
          type="button"
          onClick={onPrevStep}
          variant="outline"
          disabled={isLoading}
          className="font-poppins"
        >
          Previous
        </Button>
      )}
      
      {currentStep < totalSteps ? (
        <Button
          type="button"
          onClick={handleNextClick}
          className="ml-auto bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
          disabled={isLoading || (currentStep === 1 && !selectedRole)}
        >
          Continue
        </Button>
      ) : (
        <Button
          type="button"
          onClick={handleSubmitClick}
          className="ml-auto bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : `Create ${selectedRole === 'seller' ? 'Seller' : 'Wholesaler'} Account`}
        </Button>
      )}
    </div>
  );
};

export default NavigationButtons;
