
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '@/lib/types';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { Link } from 'react-router-dom';

interface FinalStepProps {
  selectedRole: UserRole;
  form?: UseFormReturn<any>;
}

const FinalStep: React.FC<FinalStepProps> = ({ selectedRole, form }) => {
  return (
    <div className="text-center space-y-6 animate-fadeIn">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2 font-poppins">
          Ready to Create Your Account
        </h3>
        <p className="text-muted-foreground font-poppins">
          You're all set to join Pak Bazaar Connect as a {selectedRole}
        </p>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <h4 className="font-medium text-primary mb-2 font-poppins">What happens next?</h4>
        <ul className="text-sm text-foreground/80 space-y-1 font-poppins">
          {selectedRole === 'wholesaler' ? (
            <>
              <li>• Your account will be created instantly</li>
              <li>• You can immediately start setting up your shop</li>
              <li>• Begin listing products and creating ads</li>
              <li>• Connect with retailers across Pakistan</li>
            </>
          ) : (
            <>
              <li>• Your account will be created instantly</li>
              <li>• Browse thousands of wholesale products</li>
              <li>• Place orders directly with wholesalers</li>
              <li>• Track your orders in real-time</li>
            </>
          )}
        </ul>
      </div>

      {/* Terms & Conditions Checkbox */}
      {form ? (
        <FormField
          control={form.control}
          name="acceptTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4 text-left">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary cursor-pointer"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-poppins cursor-pointer">
                  I agree to the{' '}
                  <Link
                    to="/terms-and-conditions"
                    target="_blank"
                    className="text-primary hover:text-primary/80 underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms & Conditions
                  </Link>
                  {' '}and{' '}
                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    className="text-primary hover:text-primary/80 underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </Link>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      ) : (
        <div className="flex flex-row items-start space-x-3 rounded-md border border-border p-4 text-left">
          <p className="text-sm text-muted-foreground font-poppins">
            By clicking "Create Account", you agree to our{' '}
            <Link to="/terms-and-conditions" target="_blank" className="text-primary underline">Terms & Conditions</Link>
            {' '}and{' '}
            <Link to="/privacy-policy" target="_blank" className="text-primary underline">Privacy Policy</Link>.
          </p>
        </div>
      )}

      <div className="flex items-center justify-center text-primary font-poppins">
        <ArrowRight className="w-4 h-4 mr-2" />
        <span>Click "Create Account" to continue</span>
      </div>
    </div>
  );
};

export default FinalStep;
