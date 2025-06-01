
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

const EnhancedSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
  
  const totalSteps = 2;
  
  const nextStep = () => {
    const stepFields = {
      1: ['email', 'password', 'confirmPassword'],
      2: ['businessName', 'businessType', 'ntnNumber', 'address', 'city', 'postalCode', 'industry', 'yearsInBusiness', 'contactName', 'phoneNumber'],
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
      await signUp(values.email, values.password);
      
      toast({
        title: 'Account created',
        description: 'Your registration is complete. You can now login and select your role.',
        variant: 'default',
      });
      
      navigate('/login');
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
      default:
        return 'Sign Up';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-lg overflow-hidden">
      <CardHeader className="bg-pakistani_green-700 text-white text-center pb-6">
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
                  className="ml-auto bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
                  disabled={isLoading}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="ml-auto bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Complete Registration"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      
      <CardFooter className="border-t border-gray-100 bg-gray-50 flex justify-center p-4">
        <p className="text-sm text-gray-600 font-poppins">
          Already have an account?{' '}
          <a href="/login" className="text-pakistani_green-700 hover:text-pakistani_green-800 font-medium">
            Login Here
          </a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default EnhancedSignupForm;
