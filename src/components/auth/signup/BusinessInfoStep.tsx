import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
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
  Building, 
  Briefcase, 
  Hash, 
  MapPin, 
  Phone, 
  User, 
  Shield, 
  Calendar 
} from 'lucide-react';
import { FormValues, industries } from './signupSchema';

interface BusinessInfoStepProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({ form, isLoading }) => {
  return (
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
                  placeholder="Format: 1234567-8" 
                  disabled={isLoading} 
                  className="font-poppins"
                  {...field} 
                />
              </FormControl>
              <p className="text-xs text-gray-500 font-poppins">Must be in format XXXXXXX-X (issued by FBR)</p>
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
                  placeholder="11-15 digits (if applicable)" 
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
      
      <div className="grid grid-cols-1 gap-4">
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
                  placeholder="e.g. +923001234567 or 03001234567" 
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
  );
};

export default BusinessInfoStep;
