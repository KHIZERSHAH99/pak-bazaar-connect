import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import BasicInfoFields from './seller/BasicInfoFields';
import ContactFields from './seller/ContactFields';

interface SellerInfoStepProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const SellerInfoStep: React.FC<SellerInfoStepProps> = ({ form, isLoading }) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2 font-poppins">Basic Business Information</h3>
        <p className="text-muted-foreground font-poppins text-sm">Simple setup to get you started quickly</p>
      </div>

      <BasicInfoFields form={form} isLoading={isLoading} userRole="seller" />
      
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
                placeholder="Enter your business address" 
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
        
        <FormField
          control={form.control}
          name="postalCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-foreground font-poppins">
                <MapPin className="h-4 w-4 mr-1 text-primary" />
                Postal Code
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter postal code" 
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
      
      <ContactFields form={form} isLoading={isLoading} />
      
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
        <p className="text-sm text-primary font-poppins">
          <strong>Quick Setup:</strong> As a seller, you can start browsing and purchasing immediately after registration. 
          Additional verification can be completed later for enhanced features.
        </p>
      </div>
    </div>
  );
};

export default SellerInfoStep;
