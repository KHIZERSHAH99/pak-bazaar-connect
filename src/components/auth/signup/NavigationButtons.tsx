
import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      toast({
        title: 'Please wait',
        description: 'Processing your request...',
        variant: 'default',
      });
      return;
    }
    
    onNextStep();
  };

  const isDisabled = isLoading || (currentStep === 1 && !selectedRole);

  return (
    <div className="flex justify-between pt-6">
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
      
      <Button
        type="button"
        onClick={handleButtonClick}
        className="ml-auto font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isDisabled}
      >
        {isLoading 
          ? "Processing..." 
          : currentStep < totalSteps 
            ? "Continue" 
            : `Create ${selectedRole === 'seller' ? 'Seller' : 'Wholesaler'} Account`
        }
      </Button>
    </div>
  );
};

export default NavigationButtons;
