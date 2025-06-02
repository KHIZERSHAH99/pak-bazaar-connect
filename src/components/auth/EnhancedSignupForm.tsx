
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
import { Briefcase, AlertCircle, Store, ShoppingBag } from 'lucide-react';
import { formSchema, FormValues } from './signup/signupSchema';
import AccountInfoStep from './signup/AccountInfoStep';
import BusinessInfoStep from './signup/BusinessInfoStep';
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
      businessType: 'Wholesaler',
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
  
  const totalSteps = 3;
  
  const nextStep = () => {
    const stepFields = {
      1: ['email', 'password', 'confirmPassword'],
      2: ['businessName', 'businessType', 'ntnNumber', 'address', 'city', 'postalCode', 'industry', 'yearsInBusiness', 'contactName', 'phoneNumber'],
      3: [] // Role selection step
    };
    
    // Validate only the fields for the current step
    const currentFields = stepFields[currentStep as keyof typeof stepFields];
    let isValid = true;
    
    for (const field of currentFields) {
      form.trigger(field as any).then(result => {
        if (!result) isValid = false;
      });
    }
    
    if (isValid && currentStep < totalSteps) {
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
        description: `Your ${selectedRole} account is ready to use. You can start using all features immediately.`,
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
        return 'Account Information';
      case 2:
        return 'Business & Contact Information';
      case 3:
        return 'Choose Your Role';
      default:
        return 'Sign Up';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-lg overflow-hidden">
      <CardHeader className="bg-pakistani_green-600 text-white text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
            <Briefcase className="h-8 w-8" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold font-poppins">Business Registration</CardTitle>
        <CardDescription className="text-green-50 font-poppins">Step {currentStep} of {totalSteps}: {getStepTitle()}</CardDescription>
        
        <div className="w-full mt-4 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div 
              key={idx} 
              className={`h-2 rounded-full flex-1 ${idx + 1 <= currentStep ? 'bg-white' : 'bg-white/30'}`}
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
              <AccountInfoStep form={form} isLoading={isLoading} />
            )}
            
            {currentStep === 2 && (
              <BusinessInfoStep form={form} isLoading={isLoading} />
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 font-poppins">Select Your Role</h3>
                  <p className="text-gray-600 font-poppins">Choose how you want to use the platform. You can change this later anytime.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === 'wholesaler' 
                        ? 'border-pakistani_green-500 bg-pakistani_green-50' 
                        : 'border-gray-200 hover:border-pakistani_green-300'
                    }`}
                    onClick={() => setSelectedRole('wholesaler')}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`p-2 rounded-full mr-3 ${
                        selectedRole === 'wholesaler' ? 'bg-pakistani_green-100' : 'bg-gray-100'
                      }`}>
                        <Store className={`h-5 w-5 ${
                          selectedRole === 'wholesaler' ? 'text-pakistani_green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <h4 className="font-semibold font-poppins">Wholesaler</h4>
                    </div>
                    <p className="text-sm text-gray-600 font-poppins">Sell products to retailers across Pakistan</p>
                  </div>

                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedRole === 'seller' 
                        ? 'border-pakistani_green-500 bg-pakistani_green-50' 
                        : 'border-gray-200 hover:border-pakistani_green-300'
                    }`}
                    onClick={() => setSelectedRole('seller')}
                  >
                    <div className="flex items-center mb-3">
                      <div className={`p-2 rounded-full mr-3 ${
                        selectedRole === 'seller' ? 'bg-pakistani_green-100' : 'bg-gray-100'
                      }`}>
                        <ShoppingBag className={`h-5 w-5 ${
                          selectedRole === 'seller' ? 'text-pakistani_green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <h4 className="font-semibold font-poppins">Seller</h4>
                    </div>
                    <p className="text-sm text-gray-600 font-poppins">Purchase from wholesalers and grow your business</p>
                  </div>
                </div>

                <div className="bg-pakistani_green-50 p-4 rounded-lg border border-pakistani_green-200">
                  <p className="text-sm text-pakistani_green-700 font-poppins">
                    ✨ <strong>Instant Access:</strong> Your role will be activated immediately after registration. No waiting for approval!
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
                  disabled={isLoading}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account & Start Trading"}
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

