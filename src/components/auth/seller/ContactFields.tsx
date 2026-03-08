
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { User, Phone } from 'lucide-react';

interface ContactFieldsProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const ContactFields: React.FC<ContactFieldsProps> = ({ form, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <User className="h-4 w-4 mr-1 text-primary" />
              Contact Person
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Your full name" 
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
            <FormLabel className="flex items-center text-foreground font-poppins">
              <Phone className="h-4 w-4 mr-1 text-primary" />
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
  );
};

export default ContactFields;
