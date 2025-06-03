
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
          onClick={onNextStep}
          className="ml-auto bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
          disabled={isLoading || (currentStep === 1 && !selectedRole)}
        >
          Continue
        </Button>
      ) : (
        <Button
          type="submit"
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
