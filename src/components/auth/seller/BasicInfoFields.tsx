
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Store } from 'lucide-react';

interface BasicInfoFieldsProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-gray-700 font-poppins">
              <Store className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Business/Shop Name
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Your business name" 
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
              <Building className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Business Type
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value || "Retailer"} 
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger className="font-poppins">
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Retailer">Retailer</SelectItem>
                <SelectItem value="Reseller">Reseller</SelectItem>
                <SelectItem value="Online Store">Online Store</SelectItem>
                <SelectItem value="Shop Owner">Shop Owner</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInfoFields;
