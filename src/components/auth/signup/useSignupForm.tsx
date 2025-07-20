import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormValues } from './signupSchema';
import { UserRole } from '@/lib/types';

export const useSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('wholesaler');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      businessName: '',
      businessType: selectedRole === 'seller' ? 'Retailer' : 'Wholesaler',
      address: '',
      city: '',
      industry: '',
      contactName: '',
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
    console.log('NextStep called, current step:', currentStep, 'selected role:', selectedRole);
    
    const stepFields = {
      1: [],
      2: ['phoneNumber', 'password', 'confirmPassword'],
      3: selectedRole === 'seller' 
        ? ['businessName', 'businessType', 'address', 'city', 'contactName']
        : ['businessName', 'businessType', 'address', 'city', 'contactName'],
      4: []
    };
    
    const currentFields = stepFields[currentStep as keyof typeof stepFields];
    console.log('Validating fields for step', currentStep, ':', currentFields);
    
    if (currentFields.length > 0) {
      const isValid = await form.trigger(currentFields as any);
      console.log('Validation result:', isValid);
      
      if (!isValid) {
        const errors = form.formState.errors;
        console.log('Validation errors:', errors);
        
        const errorFields = Object.keys(errors);
        toast({
          title: 'Validation Error',
          description: `Please fix the following fields: ${errorFields.join(', ')}`,
          variant: 'destructive',
        });
        
        setErrorMessage(`Please complete all required fields: ${errorFields.join(', ')}`);
        return;
      }
    }
    
    if (currentStep === totalSteps) {
      console.log('On final step, triggering form submission');
      form.handleSubmit(onSubmit)();
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
      setErrorMessage(null);
      window.scrollTo(0, 0);
      console.log('Moved to step:', currentStep + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setErrorMessage(null);
      console.log('Moved back to step:', currentStep - 1);
    }
  };
  
  const handleRoleSelect = (role: UserRole) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
    const defaultBusinessType = role === 'seller' ? 'Retailer' : 'Wholesaler';
    form.setValue('businessType', defaultBusinessType as any);
    console.log('Set default business type to:', defaultBusinessType);
  };
  
  const onSubmit = async (values: FormValues) => {
    console.log('Form submission started for role:', selectedRole);
    console.log('Form values:', values);
    
    if (currentStep !== totalSteps) {
      console.log('Not on final step, current:', currentStep, 'total:', totalSteps);
      toast({
        title: 'Navigation Error',
        description: 'Please complete all steps before submitting',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Calling signUp with:', values.phoneNumber, selectedRole);
      
      toast({
        title: 'Creating Account',
        description: 'Please wait while we set up your account...',
      });
      
      const tempEmail = `${values.phoneNumber.replace(/[^0-9]/g, '')}@temp-phone-auth.com`;
      
      await signUp(tempEmail, values.password, selectedRole);
      
      toast({
        title: 'Account created successfully!',
        description: `Your ${selectedRole} account is ready to use. ${
          selectedRole === 'seller' 
            ? 'You can start browsing products immediately!' 
            : 'Please complete business verification to access all features.'
        }`,
        variant: 'default',
      });
      
      console.log('Registration successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMsg = 'Failed to create account. Please try again.';
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMsg = `This phone number is already registered as a ${selectedRole}. Please try logging in or use a different phone number.`;
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

  return {
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
  };
};
