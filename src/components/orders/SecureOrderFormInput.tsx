import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { PhoneInput } from '@/components/ui/phone-input';
import { AlertCircle, Shield } from 'lucide-react';
import { validateAndSanitizeInput, ValidationResult } from '@/lib/security/simple-validation';
import { useToast } from '@/hooks/use-toast';

interface SecureOrderFormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'phone' | 'textarea';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  validation?: 'text' | 'email' | 'phone' | 'business' | 'description';
}

export const SecureOrderFormInput: React.FC<SecureOrderFormInputProps> = ({
  id,
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  maxLength = 1000,
  validation = 'text'
}) => {
  const [validationState, setValidationState] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleInputChange = async (newValue: string) => {
    setIsValidating(true);
    
    try {
      const result = await validateAndSanitizeInput(newValue, validation, maxLength);
      setValidationState(result);
      
      if (result.securityThreats.length > 0) {
        toast({
          title: "Security Warning",
          description: "Potentially harmful content detected and blocked",
          variant: "destructive"
        });
      }
      
      // Always use the sanitized value
      onChange(result.sanitizedValue);
    } catch (error) {
      console.error('Validation error:', error);
      // Fallback to basic sanitization
      onChange(newValue.trim());
    } finally {
      setIsValidating(false);
    }
  };

  const hasErrors = validationState && (validationState.errors.length > 0 || validationState.securityThreats.length > 0);
  const isSecure = validationState && validationState.isValid && validationState.securityThreats.length === 0;

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        {isSecure && <Shield className="h-3 w-3 text-green-600" />}
        {isValidating && <div className="h-3 w-3 border border-primary rounded-full animate-spin border-t-transparent" />}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={hasErrors ? 'border-red-500 focus:border-red-500' : isSecure ? 'border-green-500' : ''}
          maxLength={maxLength}
        />
      ) : type === 'phone' ? (
        <PhoneInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={false}
          required={required}
          showValidation
          autoFormat
          error={validationState?.errors[0]}
        />
      ) : (
        <Input
          id={id}
          type={type === 'email' ? 'email' : 'text'}
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={hasErrors ? 'border-red-500 focus:border-red-500' : isSecure ? 'border-green-500' : ''}
          maxLength={maxLength}
        />
      )}
      
      {hasErrors && (
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            {validationState.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
            {validationState.securityThreats.map((threat, index) => (
              <div key={index} className="font-medium">Security: {threat}</div>
            ))}
          </div>
        </div>
      )}
      
    </div>
  );
};