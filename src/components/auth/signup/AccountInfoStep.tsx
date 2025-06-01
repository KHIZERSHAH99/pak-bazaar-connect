
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
import { AtSign, Shield } from 'lucide-react';
import { FormValues } from './signupSchema';

interface AccountInfoStepProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const AccountInfoStep: React.FC<AccountInfoStepProps> = ({ form, isLoading }) => {
  return (
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
  );
};

export default AccountInfoStep;
