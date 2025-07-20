import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { enhancedSignUp } from '@/lib/enhanced-auth';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormValues } from './signupSchema';
import { UserRole } from '@/lib/types';

export const useEnhancedSignupForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('wholesaler');
  const [isPhoneBlocked, setIsPhoneBlocked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
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

  const validateCurrentStep = async () => {
    const stepFields = {
      1: [],
      2: ['phoneNumber', 'password', 'confirmPassword'],
      3: selectedRole === 'seller' 
        ? ['businessName', 'businessType', 'address', 'city', 'contactName']
        : ['businessName', 'businessType', 'address', 'city', 'contactName', 'industry'],
      4: []
    };
    
    const currentFields = stepFields[currentStep as keyof typeof stepFields];
    
    if (currentFields.length > 0) {
      const isValid = await form.trigger(currentFields as any);
      
      if (!isValid) {
        const errors = form.formState.errors;
        const errorFields = Object.keys(errors);
        
        toast({
          title: 'Please Complete All Fields',
          description: `Missing: ${errorFields.join(', ')}`,
          variant: 'destructive',
        });
        
        setErrorMessage(`Please complete: ${errorFields.join(', ')}`);
        return false;
      }
    }
    
    return true;
  };

  const nextStep = async () => {
    console.log('NextStep called, current step:', currentStep, 'selected role:', selectedRole);
    
    if (currentStep === 2 && isPhoneBlocked) {
      toast({
        title: 'Phone Already Registered',
        description: 'Please use a different phone number.',
        variant: 'destructive',
      });
      setErrorMessage('This phone number is already registered.');
      return;
    }
    
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    
    if (currentStep === totalSteps) {
      console.log('On final step, triggering form submission');
      await onSubmit(form.getValues());
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

  const handlePhoneBlocked = (blocked: boolean) => {
    setIsPhoneBlocked(blocked);
    if (blocked) {
      setErrorMessage('This phone number is already registered.');
    } else if (errorMessage && errorMessage.includes('phone')) {
      setErrorMessage(null);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    console.log('Form submission started for role:', selectedRole);
    console.log('Form values:', values);
    
    if (isPhoneBlocked) {
      toast({
        title: 'Cannot Register',
        description: 'Phone number is already in use.',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentStep !== totalSteps) {
      console.log('Not on final step, current:', currentStep, 'total:', totalSteps);
      toast({
        title: 'Complete All Steps',
        description: 'Please complete all steps before submitting',
        variant: 'destructive',
      });
      return;
    }
    
    const isFormValid = await form.trigger();
    if (!isFormValid) {
      const errors = form.formState.errors;
      const errorFields = Object.keys(errors);
      toast({
        title: 'Form Incomplete',
        description: `Please fix: ${errorFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Calling enhancedSignUp with:', values.phoneNumber, selectedRole);
      
      toast({
        title: 'Creating Account',
        description: 'Please wait while we set up your account...',
      });
      
      const tempEmail = `${values.phoneNumber.replace(/[^0-9]/g, '')}@temp-phone-auth.com`;
      
      await enhancedSignUp(tempEmail, values.password, selectedRole, values);
      
      toast({
        title: 'Welcome to Pak Bazaar Connect! 🎉',
        description: `Your ${selectedRole} account has been created successfully. Welcome aboard!`,
        variant: 'default',
      });
      
      console.log('Registration successful, navigating to dashboard');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMsg = 'Account creation failed. Please try again.';
      
      if (error.message) {
        if (error.message.includes('User already registered') || error.message.includes('already exists')) {
          errorMsg = `This phone number is already registered. Please try logging in instead.`;
        } else if (error.message.includes('Invalid phone')) {
          errorMsg = 'Please enter a valid phone number.';
        } else if (error.message.includes('Password')) {
          errorMsg = 'Password must be at least 6 characters long.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMsg = 'Network error. Please check your connection.';
        } else {
          errorMsg = error.message;
        }
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: 'Registration Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      
      if (errorMsg.includes('phone') && currentStep > 2) {
        setCurrentStep(2);
      }
      
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
    isPhoneBlocked,
    getStepTitle,
    nextStep,
    prevStep,
    handleRoleSelect,
    handlePhoneBlocked,
    onSubmit
  };
};
