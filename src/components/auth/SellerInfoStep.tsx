
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
import { 
  Building, 
  MapPin, 
  Phone, 
  User,
  Store
} from 'lucide-react';

interface SellerInfoStepProps {
  form: UseFormReturn<any>;
  isLoading: boolean;
}

const SellerInfoStep: React.FC<SellerInfoStepProps> = ({ form, isLoading }) => {
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 font-poppins">Basic Business Information</h3>
        <p className="text-gray-600 font-poppins text-sm">Simple setup to get you started quickly</p>
      </div>

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
      
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-gray-700 font-poppins">
              <MapPin className="h-4 w-4 mr-1 text-pakistani_green-700" />
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
              <FormLabel className="flex items-center text-gray-700 font-poppins">
                <MapPin className="h-4 w-4 mr-1 text-pakistani_green-700" />
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
              <FormLabel className="flex items-center text-gray-700 font-poppins">
                <MapPin className="h-4 w-4 mr-1 text-pakistani_green-700" />
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="contactName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center text-gray-700 font-poppins">
                <User className="h-4 w-4 mr-1 text-pakistani_green-700" />
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
              <FormLabel className="flex items-center text-gray-700 font-poppins">
                <Phone className="h-4 w-4 mr-1 text-pakistani_green-700" />
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
      
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800 font-poppins">
          <strong>Quick Setup:</strong> As a seller, you can start browsing and purchasing immediately after registration. 
          Additional verification can be completed later for enhanced features.
        </p>
      </div>
    </div>
  );
};

export default SellerInfoStep;
