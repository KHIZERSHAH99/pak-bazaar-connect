
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Briefcase, Calendar } from 'lucide-react';
import { FormValues, industries } from '../signupSchema';

interface IndustryExperienceFieldsProps {
  form: UseFormReturn<FormValues>;
  isLoading: boolean;
}

const IndustryExperienceFields: React.FC<IndustryExperienceFieldsProps> = ({ form, isLoading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={form.control}
        name="industry"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-gray-700 font-poppins">
              <Briefcase className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Industry
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value} 
              disabled={isLoading}
            >
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
      
      <FormField
        control={form.control}
        name="yearsInBusiness"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center text-gray-700 font-poppins">
              <Calendar className="h-4 w-4 mr-1 text-pakistani_green-700" />
              Years in Business
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value} 
              disabled={isLoading}
            >
              <FormControl>
                <SelectTrigger className="font-poppins">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Less than 1 year">Less than 1 year</SelectItem>
                <SelectItem value="1-3 years">1-3 years</SelectItem>
                <SelectItem value="3-5 years">3-5 years</SelectItem>
                <SelectItem value="5+ years">5+ years</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default IndustryExperienceFields;
