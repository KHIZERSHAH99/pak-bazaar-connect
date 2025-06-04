
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building2 } from 'lucide-react';

interface BusinessTypeSelectProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const BusinessTypeSelect: React.FC<BusinessTypeSelectProps> = ({ form, isLoading }) => {
  const businessTypes = [
    'Retailer',
    'Wholesaler', 
    'Manufacturer',
    'Distributor',
    'Other'
  ];

  return (
    <FormField
      control={form.control}
      name="businessType"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center text-gray-700 font-poppins">
            <Building2 className="h-4 w-4 mr-1 text-pakistani_green-700" />
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
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default BusinessTypeSelect;
