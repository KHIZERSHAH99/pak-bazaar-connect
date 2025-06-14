
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Building2 } from 'lucide-react';
import { UserRole } from '@/lib/types';
import BusinessTypeSelect from './BusinessTypeSelect';

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  userRole?: UserRole;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form, isLoading, userRole }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-gray-700 font-poppins">
              <Building2 className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Business Name
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your business name" 
                disabled={isLoading} 
                className="font-poppins"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <BusinessTypeSelect form={form} isLoading={isLoading} userRole={userRole} />
    </div>
  );
};

export default BasicInfoFields;
