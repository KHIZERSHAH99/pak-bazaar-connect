
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
import { Building, Briefcase } from 'lucide-react';
import { FormValues } from '../signupSchema';

interface BasicBusinessFieldsProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const BasicBusinessFields: React.FC<BasicBusinessFieldsProps> = ({ form, isLoading }) => {
  // Business types for wholesaler registration
  const wholesalerBusinessTypes = [
    'Manufacturer',
    'Wholesaler', 
    'Distributor',
    'Other'
  ];

  return (
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
                {wholesalerBusinessTypes.map((type) => (
                  <SelectItem key={type} value={type} className="font-poppins">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500 font-poppins mt-1">
              Select the type that best describes your wholesale business
            </p>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicBusinessFields;
