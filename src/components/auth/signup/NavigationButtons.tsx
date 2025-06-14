
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
  
  console.log('NavigationButtons render - currentStep:', currentStep, 'totalSteps:', totalSteps, 'isLoading:', isLoading);
  
  const handleButtonClick = (e: React.MouseEvent) => {
    console.log('Button clicked for step:', currentStep, 'isLoading:', isLoading);
    e.preventDefault();
    
    if (isLoading) {
      console.log('Button disabled due to loading state');
      toast({
        title: 'Please wait',
        description: 'Processing your request...',
        variant: 'default',
      });
      return;
    }
    
    // Call onNextStep which will handle both navigation and submission
    console.log('Calling onNextStep');
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
        className="ml-auto bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
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
