
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormValues } from './signupSchema';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { industries } from './signupSchema';

interface EnhancedBusinessInfoStepProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const EnhancedBusinessInfoStep: React.FC<EnhancedBusinessInfoStepProps> = ({ form, isLoading }) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 font-poppins">Business Information</h3>
        <p className="text-gray-600 font-poppins mt-2">Tell us about your wholesale business</p>
      </div>

      <FormField
        control={form.control}
        name="contactName"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-poppins">Contact Person Name *</FormLabel>
            <FormControl>
              <Input
                placeholder="Full name of primary contact person"
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
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-poppins">Business Name *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Your Business Name"
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
              <FormLabel className="font-poppins">Business Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger className="font-poppins">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Manufacturer">Manufacturer</SelectItem>
                  <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Retailer">Retailer</SelectItem>
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
            <FormLabel className="font-poppins">Business Address *</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Complete business address including street, area, and landmarks"
                disabled={isLoading}
                className="font-poppins min-h-[80px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-poppins">City *</FormLabel>
            <FormControl>
              <Input
                placeholder="e.g. Karachi, Lahore, Islamabad"
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
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-poppins">Industry</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
              <FormControl>
                <SelectTrigger className="font-poppins">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">i</span>
            </div>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-blue-900 font-poppins">
              Business Verification
            </h4>
            <p className="text-sm text-blue-800 font-poppins mt-1">
              Your business information will be verified by our team to ensure a trusted marketplace for all users.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedBusinessInfoStep;
