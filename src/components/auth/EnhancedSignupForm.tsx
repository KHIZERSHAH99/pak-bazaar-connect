
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Briefcase, AlertCircle } from 'lucide-react';
import { formSchema, FormValues } from './signup/signupSchema';
import AccountInfoStep from './signup/AccountInfoStep';
import BusinessInfoStep from './signup/BusinessInfoStep';
import SellerInfoStep from './SellerInfoStep';
import RoleSelectionStep from './RoleSelectionStep';
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
  
  const totalSteps = selectedRole === 'seller' ? 3 : 4; // Sellers skip the detailed business step
  
  const nextStep = async () => {
    const stepFields = {
      1: [], // Role selection step - no validation needed
      2: ['email', 'password', 'confirmPassword'],
      3: selectedRole === 'seller' 
        ? ['businessName', 'businessType', 'address', 'city', 'postalCode', 'contactName', 'phoneNumber']
        : ['businessName', 'businessType', 'ntnNumber', 'address', 'city', 'postalCode', 'industry', 'yearsInBusiness', 'contactName', 'phoneNumber'],
      4: [] // Final step for wholesalers
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
  
  const getStepTitle = () => {
    switch(currentStep) {
      case 1:
        return 'Choose Your Role';
      case 2:
        return 'Account Information';
      case 3:
        return selectedRole === 'seller' ? 'Basic Information' : 'Business Information';
      case 4:
        return 'Complete Registration';
      default:
        return 'Sign Up';
    }
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    // Update form defaults based on role with proper type casting
    form.setValue('businessType', role === 'seller' ? 'Retailer' as any : 'Wholesaler' as any);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-500 text-white text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
            <Briefcase className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold font-poppins">
          {selectedRole === 'seller' ? 'Seller Registration' : 'Business Registration'}
        </CardTitle>
        <CardDescription className="text-green-50 font-poppins">
          Step {currentStep} of {totalSteps}: {getStepTitle()}
        </CardDescription>
        
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
      </CardHeader>
      
      <CardContent className="pt-6">
        {errorMessage && (
          <div className="mb-6 p-3 bg-red-50 rounded-lg flex items-center text-red-600 text-sm border border-red-100">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="font-poppins">{errorMessage}</span>
          </div>
        )}
        
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
            
            <div className="flex justify-between pt-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
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
                  onClick={nextStep}
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
