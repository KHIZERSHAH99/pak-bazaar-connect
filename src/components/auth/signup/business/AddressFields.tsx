
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
import { MapPin } from 'lucide-react';
import { FormValues } from '../signupSchema';

interface AddressFieldsProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const AddressFields: React.FC<AddressFieldsProps> = ({ form, isLoading }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <MapPin className="h-4 w-4 mr-1 text-primary" />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-foreground font-poppins">
                <MapPin className="h-4 w-4 mr-1 text-primary" />
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
        
      </div>
    </>
  );
};

export default AddressFields;
