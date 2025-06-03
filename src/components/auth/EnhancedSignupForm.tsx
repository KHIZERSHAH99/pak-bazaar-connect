
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Form } from '@/components/ui/form';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { formSchema, FormValues } from './signup/signupSchema';
import AccountInfoStep from './signup/AccountInfoStep';
import BusinessInfoStep from './signup/BusinessInfoStep';
import SellerInfoStep from './SellerInfoStep';
import RoleSelectionStep from './RoleSelectionStep';
import SignupHeader from './signup/SignupHeader';
import ErrorDisplay from './signup/ErrorDisplay';
import NavigationButtons from './signup/NavigationButtons';
import { UserRole } from '@/lib/types';

const EnhancedSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('wholesaler');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      businessType: selectedRole === 'seller' ? 'Retailer' : 'Wholesaler',
      ntnNumber: '',
      strnNumber: '',
      address: '',
      city: '',
      postalCode: '',
      industry: '',
      yearsInBusiness: '1-3 years',
      contactName: '',
      phoneNumber: '',
      whatsappNumber: '',
    }
  });
  
  const totalSteps = selectedRole === 'seller' ? 3 : 4;
  
  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return 'Choose Your Role';
      case 2: return 'Account Information';
      case 3: return selectedRole === 'seller' ? 'Basic Information' : 'Business Information';
      case 4: return 'Complete Registration';
      default: return 'Sign Up';
    }
  };

  const nextStep = async () => {
    const stepFields = {
      1: [],
      2: ['email', 'password', 'confirmPassword'],
      3: selectedRole === 'seller' 
        ? ['businessName', 'businessType', 'address', 'city', 'postalCode', 'contactName', 'phoneNumber']
        : ['businessName', 'businessType', 'ntnNumber', 'address', 'city', 'postalCode', 'industry', 'yearsInBusiness', 'contactName', 'phoneNumber'],
      4: []
    };
    
    const currentFields = stepFields[currentStep as keyof typeof stepFields];
    
    if (currentFields.length > 0) {
      const isValid = await form.trigger(currentFields as any);
      if (!isValid) return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setErrorMessage(null);
      window.scrollTo(0, 0);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrorMessage(null);
    }
  };
  
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    form.setValue('businessType', role === 'seller' ? 'Retailer' as any : 'Wholesaler' as any);
  };
  
  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      await signUp(values.email, values.password, selectedRole);
      
      toast({
        title: 'Account created successfully!',
        description: `Your ${selectedRole} account is ready to use. ${
          selectedRole === 'seller' 
            ? 'You can start browsing products immediately!' 
            : 'Please complete business verification to access all features.'
        }`,
        variant: 'default',
      });
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMsg = 'Failed to create account. Please try again.';
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMsg = 'This email is already registered. Please try logging in.';
        } else {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: 'Registration failed',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 1 && (
              <RoleSelectionStep
                selectedRole={selectedRole}
                onRoleSelect={handleRoleSelect}
                isLoading={isLoading}
              />
            )}
            
            {currentStep === 2 && (
              <AccountInfoStep form={form} isLoading={isLoading} />
            )}
            
            {currentStep === 3 && selectedRole === 'seller' && (
              <SellerInfoStep form={form} isLoading={isLoading} />
            )}

            {currentStep === 3 && selectedRole === 'wholesaler' && (
              <BusinessInfoStep form={form} isLoading={isLoading} />
            )}

            {currentStep === 4 && selectedRole === 'wholesaler' && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 font-poppins">Complete Your Registration</h3>
                  <p className="text-gray-600 font-poppins">Review your information and create your wholesaler account</p>
                </div>

                <div className="bg-gradient-to-r from-pakistani_green-50 to-green-50 p-6 rounded-lg border border-pakistani_green-200">
                  <h4 className="font-semibold text-pakistani_green-800 mb-3 font-poppins">What happens next?</h4>
                  <ul className="space-y-2 text-sm text-pakistani_green-700 font-poppins">
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-3"></div>
                      Your account will be created immediately
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-3"></div>
                      You can start using basic features right away
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-3"></div>
                      Complete business verification for full access
                    </li>
                    <li className="flex items-center">
                      <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-3"></div>
                      Start creating shops and listing products
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-poppins">
                    <strong>Commission Structure:</strong> We charge a low 2.5% commission on successful sales to maintain and improve the platform.
                  </p>
                </div>
              </div>
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
      
      <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-center p-4">
        <p className="text-sm text-gray-600 font-poppins">
          Already have an account?{' '}
          <a href="/login" className="text-pakistani_green-600 hover:text-pakistani_green-700 font-medium">
            Login Here
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default EnhancedSignupForm;
