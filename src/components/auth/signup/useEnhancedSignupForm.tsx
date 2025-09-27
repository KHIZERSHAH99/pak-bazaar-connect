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
  const [currentStep, setCurrentStep] = useState(1); // Skip role selection, start at account info
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('seller'); // Default to seller
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
      businessType: 'Retailer', // Default to Retailer since everyone is a seller
      address: '',
      city: '',
      
      industry: '',
      
      contactName: '',
    }
  });
  
  const totalSteps = 3; // Simplified: Account Info -> Basic Info -> Complete
  
  const getStepTitle = () => {
    switch(currentStep) {
      case 1: return 'Account Information';
      case 2: return 'Basic Information';
      case 3: return 'Complete Registration';
      default: return 'Sign Up';
    }
  };

  const validateCurrentStep = async () => {
    const stepFields = {
      1: ['phoneNumber', 'password', 'confirmPassword'], // Account info
      2: ['businessName', 'businessType', 'address', 'city', 'postalCode', 'contactName'], // Basic info
      3: [] // Completion step
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
    
    // Block progression if phone is blocked
    if (currentStep === 2 && isPhoneBlocked) {
      toast({
        title: 'Phone Already Registered',
        description: 'Please use a different phone number.',
        variant: 'destructive',
      });
      setErrorMessage('This phone number is already registered.');
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
      setErrorMessage('This phone number is already registered.');
    } else if (errorMessage && errorMessage.includes('phone')) {
      setErrorMessage(null);
    }
  };
  
  const onSubmit = async (values: FormValues) => {
    console.log('Form submission started for role:', selectedRole);
    console.log('Form values:', values);
    
    // Final validation checks
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
    
    // Final form validation
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
      
      // Create a deterministic phone-based email for Supabase auth (auto-confirmed)
      const phoneDigits = values.phoneNumber.replace(/[^0-9]/g, '');
      const tempEmail = `phone-${phoneDigits}@pakbazaarconnect.store`;
      
      // Call enhanced signup with form data
      await enhancedSignUp(tempEmail, values.password, selectedRole, values);
      
      toast({
        title: 'Welcome to Pak Bazaar Connect! 🎉',
        description: `Your ${selectedRole} account has been created successfully. Welcome aboard!`,
        variant: 'default',
      });
      
      console.log('Registration successful, navigating to dashboard');
      
      // Force navigation with page reload for clean state
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
      
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMsg = 'Registration failed. Please try again.';
      
      // Parse detailed error messages
      if (error?.code === '23505') {
        // Unique constraint violation from database
        if (error.details?.includes('phone')) {
          errorMsg = 'This phone number is already registered. Please use a different phone number.';
        } else if (error.details?.includes('email')) {
          errorMsg = 'This email is already registered. Please use a different email.';
        } else {
          errorMsg = 'This account already exists. Please try logging in instead.';
        }
      } else if (error?.code === 'user_already_exists' || error?.message?.includes('already registered')) {
        errorMsg = 'This phone number is already registered. Please use a different number or log in.';
      } else if (error?.message?.includes('Invalid phone')) {
        errorMsg = 'Please enter a valid Pakistani phone number (03XX-XXXXXXX).';
      } else if (error?.message?.includes('Password')) {
        errorMsg = error.message; // Show the actual password error
      } else if (error?.message?.includes('address')) {
        errorMsg = 'Address must be at least 8 characters long.';
      } else if (error?.message?.includes('business')) {
        errorMsg = 'Please enter a valid business name (minimum 5 characters).';
      } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
        errorMsg = 'Network error. Please check your internet connection and try again.';
      } else if (error?.message?.includes('validation')) {
        errorMsg = error.message; // Show validation errors directly
      } else if (error?.message) {
        // Use the actual error message if it's informative
        errorMsg = error.message;
      }
      
      setErrorMessage(errorMsg);
      
      toast({
        title: 'Registration Failed',
        description: errorMsg,
        variant: 'destructive',
      });
      
      // If it's a phone error, go back to step 1 (account info)
      if (errorMsg.includes('phone') && currentStep > 1) {
        setCurrentStep(1);
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
