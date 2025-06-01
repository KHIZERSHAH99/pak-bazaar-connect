
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signUp } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  AtSign, 
  Building, 
  Briefcase, 
  Hash, 
  MapPin, 
  Phone, 
  User, 
  Shield, 
  Calendar, 
  FileText,
  AlertCircle
} from 'lucide-react';

// Define form schema with zod - removed preferredRole
const formSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  businessName: z.string().min(3, 'Business name must be at least 3 characters'),
  businessType: z.enum(['Manufacturer', 'Wholesaler', 'Distributor', 'Other']),
  ntnNumber: z.string().min(7, 'NTN number must be at least 7 characters'),
  strnNumber: z.string().optional(),
  address: z.string().min(10, 'Please enter your complete business address'),
  city: z.string().min(2, 'Please enter a valid city name'),
  postalCode: z.string().min(5, 'Please enter a valid postal code'),
  industry: z.string().min(2, 'Please select your industry'),
  yearsInBusiness: z.enum(['Less than 1 year', '1-3 years', '3-5 years', '5+ years']),
  contactName: z.string().min(3, 'Contact name must be at least 3 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  whatsappNumber: z.string().optional(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

type FormValues = z.infer<typeof formSchema>;

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
  
  const totalSteps = 2; // Reduced from 3 to 2
  
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
      // Create the auth account - user will get 'pending' role by default
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
  
  const industries = [
    'Textiles', 
    'Leather Goods', 
    'Electronics', 
    'Food Products', 
    'Pharmaceuticals', 
    'Surgical Instruments', 
    'Sports Goods', 
    'Furniture', 
    'Handicrafts', 
    'Construction Materials',
    'Agriculture',
    'Automotive Parts',
    'Chemicals',
    'Other'
  ];

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
              <div className="space-y-4 animate-fadeIn">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 font-poppins">
                        <AtSign className="h-4 w-4 mr-1 text-pakistani_green-700" />
                        Business Email
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="your.business@example.com" 
                          disabled={isLoading} 
                          className="font-poppins"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 font-poppins">
                        <Shield className="h-4 w-4 mr-1 text-pakistani_green-700" />
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Create a secure password" 
                          disabled={isLoading} 
                          className="font-poppins"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 font-poppins">
                        <Shield className="h-4 w-4 mr-1 text-pakistani_green-700" />
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm your password" 
                          disabled={isLoading} 
                          className="font-poppins"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="p-4 bg-pakistani_green-50 rounded-lg border border-pakistani_green-200">
                  <p className="text-sm text-pakistani_green-800 font-poppins">
                    <strong>Note:</strong> After registration, you'll be able to choose whether you want to be a Wholesaler or Seller from your dashboard.
                  </p>
                </div>
              </div>
            )}
            
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <Building className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          Business Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter registered business name" 
                            disabled={isLoading} 
                            className="font-poppins"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <Briefcase className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          Business Type
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="font-poppins">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                            <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                            <SelectItem value="Distributor">Distributor</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="ntnNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <Hash className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          National Tax Number (NTN)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter NTN issued by FBR" 
                            disabled={isLoading} 
                            className="font-poppins"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="strnNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <Hash className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          STRN (optional)
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter STRN if applicable" 
                            disabled={isLoading} 
                            className="font-poppins"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 font-poppins">
                        <MapPin className="h-4 w-4 mr-1 text-pakistani_green-700" />
                        Business Address
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter complete business address" 
                          disabled={isLoading} 
                          className="font-poppins"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <MapPin className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          City
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. Karachi, Lahore" 
                            disabled={isLoading} 
                            className="font-poppins"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <MapPin className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          Postal Code
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter postal code" 
                            disabled={isLoading} 
                            className="font-poppins"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="industry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <Briefcase className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          Industry
                        </FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value} 
                          disabled={isLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="font-poppins">
                              <SelectValue placeholder="Select your industry" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {industries.map((industry) => (
                              <SelectItem key={industry} value={industry}>
                                {industry}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="yearsInBusiness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 font-poppins">
                        <Calendar className="h-4 w-4 mr-1 text-pakistani_green-700" />
                        Years in Business
                      </FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value} 
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="font-poppins">
                            <SelectValue placeholder="Select experience" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                          <SelectItem value="1-3 years">1-3 years</SelectItem>
                          <SelectItem value="3-5 years">3-5 years</SelectItem>
                          <SelectItem value="5+ years">5+ years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <User className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          Contact Name
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Full name of contact person" 
                            disabled={isLoading} 
                            className="font-poppins"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 font-poppins">
                          <Phone className="h-4 w-4 mr-1 text-pakistani_green-700" />
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. +92XXXXXXXXXX" 
                            disabled={isLoading} 
                            className="font-poppins"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 font-poppins">
                        <Phone className="h-4 w-4 mr-1 text-pakistani_green-700" />
                        WhatsApp Number (optional)
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. +92XXXXXXXXXX" 
                          disabled={isLoading} 
                          className="font-poppins"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center">
                    <div className="h-5 w-5 bg-pakistani_green-700 rounded-full flex items-center justify-center text-white mr-2">
                      <Shield className="h-3 w-3" />
                    </div>
                    <p className="text-sm text-green-800 font-poppins">
                      By clicking "Complete Registration", you agree to our Terms of Service and Privacy Policy. 
                      Your data will be securely stored and verified by our team.
                    </p>
                  </div>
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
