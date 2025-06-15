import React from 'react';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import AccountInfoStep from './signup/AccountInfoStep';
import BusinessInfoStep from './signup/BusinessInfoStep';
import SellerInfoStep from './SellerInfoStep';
import SignupHeader from './signup/SignupHeader';
import ErrorDisplay from './signup/ErrorDisplay';
import NavigationButtons from './signup/NavigationButtons';
import RoleStep from './signup/RoleStep';
import CompletionStep from './signup/CompletionStep';
import { useSignupForm } from './signup/useSignupForm';

const EnhancedSignupForm = () => {
  const {
    form,
    isLoading,
    currentStep,
    errorMessage,
    selectedRole,
    totalSteps,
    getStepTitle,
    nextStep,
    prevStep,
    handleRoleSelect,
    onSubmit
  } = useSignupForm();

  // Prevent default form submission and let NavigationButtons handle it
  const handleFormSubmit = (e: React.FormEvent) => {
    console.log('Form submit event prevented');
    e.preventDefault();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-lg overflow-hidden">
      <SignupHeader 
        selectedRole={selectedRole}
        currentStep={currentStep}
        totalSteps={totalSteps}
        getStepTitle={getStepTitle}
      />
      
      <CardContent className="pt-6">
        <ErrorDisplay errorMessage={errorMessage} />
        
        <Form {...form}>
          <form onSubmit={handleFormSubmit} className="space-y-6">
            {currentStep === 1 && (
              <RoleStep
                selectedRole={selectedRole}
                onRoleSelect={handleRoleSelect}
                isLoading={isLoading}
              />
            )}
            
            {currentStep === 2 && (
              <AccountInfoStep 
                form={form} 
                isLoading={isLoading} 
                selectedRole={selectedRole}
              />
            )}
            
            {currentStep === 3 && selectedRole === 'seller' && (
              <SellerInfoStep form={form} isLoading={isLoading} />
            )}

            {currentStep === 3 && selectedRole === 'wholesaler' && (
              <BusinessInfoStep form={form} isLoading={isLoading} />
            )}

            {currentStep === 4 && selectedRole === 'wholesaler' && (
              <CompletionStep />
            )}
            
            <NavigationButtons
              currentStep={currentStep}
              totalSteps={totalSteps}
              isLoading={isLoading}
              selectedRole={selectedRole}
              onPrevStep={prevStep}
              onNextStep={nextStep}
            />
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="border-t border-border bg-muted/30 dark:bg-muted/50 flex justify-center p-4">
        <p className="text-sm text-muted-foreground font-poppins">
          Already have an account?{' '}
          <a href="/login" className="text-pakistani_green-600 dark:text-pakistani_green-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-100 font-medium">
            Login Here
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default EnhancedSignupForm;
