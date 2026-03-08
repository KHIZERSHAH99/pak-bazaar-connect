
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface BusinessTypeSelectProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  userRole?: UserRole;
}

const BusinessTypeSelect: React.FC<BusinessTypeSelectProps> = ({ form, isLoading, userRole }) => {
  // Filter business types based on user role
  const getBusinessTypes = () => {
    if (userRole === 'seller') {
      return ['Retailer', 'Distributor', 'Other'];
    }
    // For wholesaler or other roles
    return ['Manufacturer', 'Wholesaler', 'Distributor', 'Other'];
  };

  const businessTypes = getBusinessTypes();

  const getHelpText = () => {
    if (userRole === 'seller') {
      return "Select the type that best describes your retail business";
    }
    return "Select your primary business type";
  };

  return (
    <FormField
      control={form.control}
      name="businessType"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center text-foreground font-poppins">
            <Building2 className="h-4 w-4 mr-1 text-primary" />
            Business Type
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
            <FormControl>
              <SelectTrigger className="font-poppins">
                <SelectValue placeholder="Select your business type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type} className="font-poppins">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 font-poppins mt-1">
            {getHelpText()}
          </p>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BusinessTypeSelect;
