
import React, { useRef } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { usePhoneSignupForm } from './signup/usePhoneSignupForm';
import RoleSelectionStep from './RoleSelectionStep';
import PhoneAccountInfoStep from './signup/PhoneAccountInfoStep';
import BusinessInfoStep from './signup/BusinessInfoStep';
import SellerInfoStep from './SellerInfoStep';
import FinalStep from './signup/FinalStep';
import { HCaptchaRef } from './HCaptcha';

const SignupForm: React.FC = () => {
  const captchaRef = useRef<HCaptchaRef>(null);
  
  const {
    form,
    isLoading,
    currentStep,
    errorMessage,
    selectedRole,
    totalSteps,
    isPhoneBlocked,
    getStepTitle,
    nextStep,
    prevStep,
    handleRoleSelect,
    handlePhoneBlocked,
    handleCaptchaVerify,
  } = usePhoneSignupForm(captchaRef);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <RoleSelectionStep
            selectedRole={selectedRole}
            onRoleSelect={handleRoleSelect}
            isLoading={isLoading}
          />
        );
      case 2:
        return (
          <PhoneAccountInfoStep
            form={form}
            isLoading={isLoading}
            selectedRole={selectedRole}
            onPhoneBlocked={handlePhoneBlocked}
            onCaptchaVerify={handleCaptchaVerify}
            captchaRef={captchaRef}
          />
        );
      case 3:
        return selectedRole === 'seller' ? (
          <SellerInfoStep form={form} isLoading={isLoading} />
        ) : (
          <BusinessInfoStep form={form} isLoading={isLoading} />
        );
      case 4:
        return <FinalStep selectedRole={selectedRole} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-card rounded-lg shadow-lg border">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-card-foreground font-poppins">
            {getStepTitle()}
          </h2>
          <span className="text-sm text-muted-foreground font-poppins">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
        
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-pakistani_green-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      <Form {...form}>
        <div className="min-h-[400px]">
          {renderStep()}
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive font-poppins">{errorMessage}</p>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || isLoading}
            className="font-poppins"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <Button
            type="button"
            onClick={nextStep}
            disabled={isLoading || (currentStep === 2 && isPhoneBlocked)}
            className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
          >
            {isLoading ? (
              'Processing...'
            ) : currentStep === totalSteps ? (
              'Create Account'
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default SignupForm;
