import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formSchema, FormValues } from './signupSchema';
import { UserRole } from '@/lib/types';
import { phoneSignUp, validatePhoneNumber } from '@/lib/phone-auth';

export const usePhoneSignupForm = () => {
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
      3: ['businessName', 'businessType', 'address', 'city', 'postalCode', 'contactName'],
      4: []
    };
    
    const currentFields = stepFields[currentStep as keyof typeof stepFields];
    
    if (currentFields.length > 0) {
      const isValid = await form.trigger(currentFields as any);
      
      if (!isValid) {
        const errors = form.formState.errors;
        const errorFields = Object.keys(errors);
        
        toast({
          title: 'Validation Error',
          description: `Please fix the following fields: ${errorFields.join(', ')}`,
          variant: 'destructive',
        });
        
        setErrorMessage(`Please complete all required fields: ${errorFields.join(', ')}`);
        return false;
      }
    }
    
    return true;
  };

  const nextStep = async () => {
    console.log('NextStep called, current step:', currentStep, 'selected role:', selectedRole);
    
    // Block progression if phone is blocked
    if (currentStep === 2 && isPhoneBlocked) {
      toast({
        title: 'Phone Number Already Registered',
        description: 'Please use a different phone number to continue.',
        variant: 'destructive',
      });
      setErrorMessage('Cannot proceed with an already registered phone number.');
      return;
    }
    
    // Validate current step
    const isValid = await validateCurrentStep();
    if (!isValid) return;
    
    // If we're on the final step, proceed to submission
    if (currentStep === totalSteps) {
      console.log('On final step, triggering form submission');
      await onSubmit(form.getValues());
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
    const defaultBusinessType = role === 'seller' ? 'Retailer' : 'Wholesaler';
    form.setValue('businessType', defaultBusinessType as any);
    console.log('Set default business type to:', defaultBusinessType);
  };

  const handlePhoneBlocked = (blocked: boolean) => {
    setIsPhoneBlocked(blocked);
    if (blocked) {
      setErrorMessage('This phone number is already registered. Please use a different phone number.');
    } else if (errorMessage && errorMessage.includes('phone')) {
      setErrorMessage(null);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    console.log('Form submission started for role:', selectedRole);
    console.log('Form values:', values);
    
    if (isPhoneBlocked) {
      toast({
        title: 'Registration Blocked',
        description: 'Cannot register with an already used phone number.',
        variant: 'destructive',
      });
      return;
    }
    
    if (currentStep !== totalSteps) {
      console.log('Not on final step, current:', currentStep, 'total:', totalSteps);
      toast({
        title: 'Navigation Error',
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
        title: 'Form Validation Failed',
        description: `Please fix: ${errorFields.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!validatePhoneNumber(values.phoneNumber)) {
      toast({
        title: 'Invalid Phone Number',
        description: 'Please enter a valid phone number',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Calling phoneSignUp with phone:', values.phoneNumber, selectedRole);
      
      toast({
        title: 'Creating Account',
        description: 'Please wait while we set up your account...',
      });
      
      const businessData = {
        contact_name: values.contactName,
        business_name: values.businessName,
        address: values.address,
        city: values.city,
        industry: values.industry || '',
        business_type: values.businessType,
        postal_code: values.postalCode || ''
      };
      
      await phoneSignUp(values.phoneNumber, values.password, selectedRole, businessData);
      
      toast({
        title: 'Account Created Successfully!',
        description: `Your ${selectedRole} account is ready to use. ${
          selectedRole === 'seller' 
            ? 'You can start browsing products immediately!' 
            : 'Please complete business verification to access all features.'
        }`,
        variant: 'default',
      });
      
      console.log('Registration successful, navigating to dashboard');
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMsg = 'Failed to create account. Please try again.';
      
      if (error.message) {
        errorMsg = error.message;
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
