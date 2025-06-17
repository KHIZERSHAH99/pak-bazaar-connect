
import React, { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Building, MapPin, Phone, Hash, User, AlertCircle, CheckCircle } from 'lucide-react';
import { industries } from './signupSchema';
import { 
  checkPhoneExists, 
  checkNTNExists, 
  checkSTRNExists,
  validateNTNFormat,
  validateSTRNFormat 
} from '@/lib/validation-enhanced';
import { useDebounce } from '@/hooks/useDebounce';

interface EnhancedBusinessInfoStepProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const EnhancedBusinessInfoStep: React.FC<EnhancedBusinessInfoStepProps> = ({ form, isLoading }) => {
  const [phoneStatus, setPhoneStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [ntnStatus, setNtnStatus] = useState<'checking' | 'available' | 'taken' | 'invalid' | null>(null);
  const [strnStatus, setStrnStatus] = useState<'checking' | 'available' | 'taken' | 'invalid' | null>(null);

  const phoneNumber = form.watch('phoneNumber');
  const ntnNumber = form.watch('ntnNumber');
  const strnNumber = form.watch('strnNumber');

  const debouncedPhone = useDebounce(phoneNumber, 500);
  const debouncedNTN = useDebounce(ntnNumber, 500);
  const debouncedSTRN = useDebounce(strnNumber, 500);

  // Phone validation
  React.useEffect(() => {
    const checkPhone = async () => {
      if (debouncedPhone && debouncedPhone.length >= 10) {
        setPhoneStatus('checking');
        const exists = await checkPhoneExists(debouncedPhone);
        setPhoneStatus(exists ? 'taken' : 'available');
      } else {
        setPhoneStatus(null);
      }
    };
    checkPhone();
  }, [debouncedPhone]);

  // NTN validation
  React.useEffect(() => {
    const checkNTN = async () => {
      if (debouncedNTN && debouncedNTN.trim() !== '') {
        if (!validateNTNFormat(debouncedNTN)) {
          setNtnStatus('invalid');
          return;
        }
        setNtnStatus('checking');
        const exists = await checkNTNExists(debouncedNTN);
        setNtnStatus(exists ? 'taken' : 'available');
      } else {
        setNtnStatus(null);
      }
    };
    checkNTN();
  }, [debouncedNTN]);

  // STRN validation
  React.useEffect(() => {
    const checkSTRN = async () => {
      if (debouncedSTRN && debouncedSTRN.trim() !== '') {
        if (!validateSTRNFormat(debouncedSTRN)) {
          setStrnStatus('invalid');
          return;
        }
        setStrnStatus('checking');
        const exists = await checkSTRNExists(debouncedSTRN);
        setStrnStatus(exists ? 'taken' : 'available');
      } else {
        setStrnStatus(null);
      }
    };
    checkSTRN();
  }, [debouncedSTRN]);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 font-poppins">Business Information</h3>
        <p className="text-muted-foreground font-poppins text-sm">Tell us about your business</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-foreground font-poppins">
                <Building className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
                Business Name
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your business name" 
                  disabled={isLoading} 
                  className="font-poppins bg-background"
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
              <FormLabel className="flex items-center text-foreground font-poppins">
                <Building className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
                Business Type
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
                  <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Retailer">Retailer</SelectItem>
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
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-foreground font-poppins">
                <User className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
                Contact Person Name
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter contact person name" 
                  disabled={isLoading} 
                  className="font-poppins bg-background"
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
              <FormLabel className="flex items-center text-foreground font-poppins">
                <Phone className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
                Phone Number
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="+92 3XX XXXXXXX" 
                    disabled={isLoading} 
                    className={`font-poppins bg-background pr-10 ${
                      phoneStatus === 'taken' ? 'border-red-500' : 
                      phoneStatus === 'available' ? 'border-green-500' : ''
                    }`}
                    {...field} 
                  />
                  {phoneStatus === 'checking' && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pakistani_green-700"></div>
                    </div>
                  )}
                  {phoneStatus === 'available' && (
                    <CheckCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-green-500 mr-3 mt-3" />
                  )}
                  {phoneStatus === 'taken' && (
                    <AlertCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-red-500 mr-3 mt-3" />
                  )}
                </div>
              </FormControl>
              {phoneStatus === 'taken' && (
                <p className="text-sm text-red-600 font-poppins">This phone number is already registered.</p>
              )}
              {phoneStatus === 'available' && (
                <p className="text-sm text-green-600 font-poppins">✓ Phone number is available</p>
              )}
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
            <FormLabel className="flex items-center text-foreground font-poppins">
              <MapPin className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
              Business Address
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Enter complete business address"
                disabled={isLoading} 
                className="font-poppins bg-background min-h-[80px]"
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
              <FormLabel className="text-foreground font-poppins">City</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter city" 
                  disabled={isLoading} 
                  className="font-poppins bg-background"
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
              <FormLabel className="text-foreground font-poppins">Postal Code</FormLabel>
              <FormControl>
                <Input 
                  placeholder="12345" 
                  disabled={isLoading} 
                  className="font-poppins bg-background"
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
              <FormLabel className="text-foreground font-poppins">Industry</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg max-h-60 overflow-y-auto">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="ntnNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-foreground font-poppins">
                <Hash className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
                NTN Number (Optional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="1234567-8" 
                    disabled={isLoading} 
                    className={`font-poppins bg-background pr-10 ${
                      ntnStatus === 'taken' || ntnStatus === 'invalid' ? 'border-red-500' : 
                      ntnStatus === 'available' ? 'border-green-500' : ''
                    }`}
                    {...field} 
                  />
                  {ntnStatus === 'checking' && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pakistani_green-700"></div>
                    </div>
                  )}
                  {ntnStatus === 'available' && (
                    <CheckCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-green-500 mr-3 mt-3" />
                  )}
                  {(ntnStatus === 'taken' || ntnStatus === 'invalid') && (
                    <AlertCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-red-500 mr-3 mt-3" />
                  )}
                </div>
              </FormControl>
              {ntnStatus === 'invalid' && (
                <p className="text-sm text-red-600 font-poppins">Invalid NTN format. Use XXXXXXX-X format.</p>
              )}
              {ntnStatus === 'taken' && (
                <p className="text-sm text-red-600 font-poppins">This NTN is already registered.</p>
              )}
              {ntnStatus === 'available' && (
                <p className="text-sm text-green-600 font-poppins">✓ NTN is valid and available</p>
              )}
              <p className="text-xs text-muted-foreground font-poppins">Format: XXXXXXX-X (7 digits, dash, 1 digit)</p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="strnNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-foreground font-poppins">
                <Hash className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
                STRN Number (Optional)
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Input 
                    placeholder="11-15 digits" 
                    disabled={isLoading} 
                    className={`font-poppins bg-background pr-10 ${
                      strnStatus === 'taken' || strnStatus === 'invalid' ? 'border-red-500' : 
                      strnStatus === 'available' ? 'border-green-500' : ''
                    }`}
                    {...field} 
                  />
                  {strnStatus === 'checking' && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pakistani_green-700"></div>
                    </div>
                  )}
                  {strnStatus === 'available' && (
                    <CheckCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-green-500 mr-3 mt-3" />
                  )}
                  {(strnStatus === 'taken' || strnStatus === 'invalid') && (
                    <AlertCircle className="absolute inset-y-0 right-0 flex items-center pr-3 h-4 w-4 text-red-500 mr-3 mt-3" />
                  )}
                </div>
              </FormControl>
              {strnStatus === 'invalid' && (
                <p className="text-sm text-red-600 font-poppins">Invalid STRN format. Must be 11-15 digits.</p>
              )}
              {strnStatus === 'taken' && (
                <p className="text-sm text-red-600 font-poppins">This STRN is already registered.</p>
              )}
              {strnStatus === 'available' && (
                <p className="text-sm text-green-600 font-poppins">✓ STRN is valid and available</p>
              )}
              <p className="text-xs text-muted-foreground font-poppins">Must be 11-15 digits</p>
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
            <FormLabel className="text-foreground font-poppins">Years in Business</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
              <FormControl>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select years in business" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg">
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
    </div>
  );
};

export default EnhancedBusinessInfoStep;
