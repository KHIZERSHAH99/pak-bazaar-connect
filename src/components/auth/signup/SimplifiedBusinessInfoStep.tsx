
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Building, MapPin, Map } from 'lucide-react';

interface SimplifiedBusinessInfoStepProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
  selectedRole?: string;
}

const SimplifiedBusinessInfoStep: React.FC<SimplifiedBusinessInfoStepProps> = ({ 
  form, 
  isLoading, 
  selectedRole = 'wholesaler' 
}) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 font-poppins">Business Information</h3>
        <p className="text-muted-foreground font-poppins text-sm">Tell us about your {selectedRole} business</p>
      </div>

      <FormField
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <User className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
              Contact Person Name
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Your full name" 
                disabled={isLoading} 
                className="font-poppins bg-background"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <Building className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
              Business Name
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Your business or company name" 
                disabled={isLoading} 
                className="font-poppins bg-background"
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
            <FormLabel className="flex items-center text-foreground font-poppins">
              <Building className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
              Business Type
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
              <FormControl>
                <SelectTrigger className="font-poppins bg-background">
                  <SelectValue placeholder="Select your business type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Manufacturer" className="font-poppins">Manufacturer</SelectItem>
                <SelectItem value="Wholesaler" className="font-poppins">Wholesaler</SelectItem>
                <SelectItem value="Distributor" className="font-poppins">Distributor</SelectItem>
                <SelectItem value="Retailer" className="font-poppins">Retailer</SelectItem>
                <SelectItem value="Other" className="font-poppins">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <Map className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
              City
            </FormLabel>
            <FormControl>
              <Input 
                placeholder="Your city name" 
                disabled={isLoading} 
                className="font-poppins bg-background"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-foreground font-poppins">
              <MapPin className="h-4 w-4 mr-1 text-pakistani_green-700 dark:text-pakistani_green-400" />
              Business Address
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Your complete business address" 
                disabled={isLoading} 
                className="font-poppins bg-background min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="mt-6 p-4 bg-pakistani_green-50 dark:bg-pakistani_green-900/20 rounded-lg border border-pakistani_green-200 dark:border-pakistani_green-800">
        <p className="text-sm text-pakistani_green-700 dark:text-pakistani_green-300 font-poppins">
          <strong>Note:</strong> Your information will be used to verify your business and connect you with potential partners. All details are kept secure and confidential.
        </p>
      </div>
    </div>
  );
};

export default SimplifiedBusinessInfoStep;
