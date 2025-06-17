import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormValues } from './signupSchema';
import { UserRole } from '@/lib/types';

export const useEnhancedSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('wholesaler');
  const [isEmailBlocked, setIsEmailBlocked] = useState(false);
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
    
    // Block progression if email is blocked
    if (currentStep === 2 && isEmailBlocked) {
      toast({
        title: 'Email Already Registered',
        description: 'Please use a different Gmail address to continue.',
        variant: 'destructive',
      });
      setErrorMessage('Cannot proceed with an already registered email address.');
      return;
    }
    
    // Define required fields for each step based on role
    const stepFields = {
      1: [],
      2: ['email', 'password', 'confirmPassword'],
      3: selectedRole === 'seller' 
        ? ['businessName', 'businessType', 'address', 'city', 'postalCode', 'contactName', 'phoneNumber']
        : ['businessName', 'businessType', 'address', 'city', 'postalCode', 'contactName', 'phoneNumber'],
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
        
        // Show validation error toast
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
    
    // If we're on the final step, proceed to submission
    if (currentStep === totalSteps) {
      console.log('On final step, triggering form submission');
      form.handleSubmit(onSubmit)();
      return;
    }
    
    // Otherwise, move to next step
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
    // Update business type default based on role
    const defaultBusinessType = role === 'seller' ? 'Retailer' : 'Wholesaler';
    form.setValue('businessType', defaultBusinessType as any);
    console.log('Set default business type to:', defaultBusinessType);
  };

  const handleEmailBlocked = (blocked: boolean) => {
    setIsEmailBlocked(blocked);
    if (blocked) {
      setErrorMessage('This email is already registered. Please use a different Gmail address.');
    } else {
      setErrorMessage(null);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    console.log('Form submission started for role:', selectedRole);
    console.log('Form values:', values);
    
    // Final check for email blocking
    if (isEmailBlocked) {
      toast({
        title: 'Registration Blocked',
        description: 'Cannot register with an already used email address.',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate we're on the final step
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
      console.log('Calling signUp with:', values.email, selectedRole);
      
      // Show loading toast
      toast({
        title: 'Creating Account',
        description: 'Please wait while we set up your account...',
      });
      
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
      
      console.log('Registration successful, navigating to dashboard');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMsg = 'Failed to create account. Please try again.';
      
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMsg = `This email is already registered. Please try logging in or use a different email.`;
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
    isEmailBlocked,
    getStepTitle,
    nextStep,
    prevStep,
    handleRoleSelect,
    handleEmailBlocked,
    onSubmit
  };
};
