
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
    console.log('Form submission started for role:', selectedRole);
    console.log('Form values:', values);
    
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
          errorMsg = `This email is already registered as a ${selectedRole}. Please try logging in or use a different email.`;
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
