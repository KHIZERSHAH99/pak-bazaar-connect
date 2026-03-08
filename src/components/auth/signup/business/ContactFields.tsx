
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
import { User, Phone } from 'lucide-react';
import { FormValues } from '../signupSchema';

interface ContactFieldsProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const ContactFields: React.FC<ContactFieldsProps> = ({ form, isLoading }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <FormField
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <User className="h-4 w-4 mr-1 text-primary" />
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
  );
};

export default ContactFields;
