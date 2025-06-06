
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
import { Hash } from 'lucide-react';
import { FormValues } from '../signupSchema';

interface TaxRegistrationFieldsProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const TaxRegistrationFields: React.FC<TaxRegistrationFieldsProps> = ({ form, isLoading }) => {
  return (
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
  );
};

export default TaxRegistrationFields;
