import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Phone, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { validatePakistaniPhone, normalizePakistaniPhone, formatPhoneForDisplay } from '@/lib/auth/phone-utils';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  showValidation?: boolean;
  autoFormat?: boolean;
  id?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  label = 'Pakistani Mobile Number',
  placeholder = '03XX-XXXXXXX',
  required = false,
  disabled = false,
  error,
  className,
  showValidation = true,
  autoFormat = true,
  id = 'phone'
}) => {
  const [focused, setFocused] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const normalized = normalizePakistaniPhone(value);
    setIsValid(validatePakistaniPhone(normalized));
    if (autoFormat && normalized) {
      setDisplayValue(formatPhoneForDisplay(normalized));
    } else {
      setDisplayValue(value);
    }
  }, [value, autoFormat]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Only allow numbers and dash
    const cleaned = input.replace(/[^0-9-]/g, '');
    
    // Limit to Pakistani mobile number format
    if (cleaned.replace(/-/g, '').length <= 11) {
      if (autoFormat) {
        const numbers = cleaned.replace(/-/g, '');
        
        // Auto-format as user types
        if (numbers.startsWith('03') && numbers.length > 4) {
          const formatted = `${numbers.substring(0, 4)}-${numbers.substring(4)}`;
          setDisplayValue(formatted);
          onChange(formatted);
        } else {
          setDisplayValue(numbers);
          onChange(numbers);
        }
      } else {
        setDisplayValue(cleaned);
        onChange(cleaned);
      }
    }
  };

  const getValidationIcon = () => {
    if (!showValidation || !displayValue) return null;
    
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (displayValue.length >= 4) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
    return null;
  };

  const getValidationMessage = () => {
    if (!showValidation || !displayValue) return null;
    
    if (isValid) {
      return (
        <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
          <CheckCircle className="h-3 w-3" />
          <span>Valid Pakistani mobile number</span>
        </div>
      );
    } else if (displayValue.length >= 4) {
      return (
        <div className="flex items-center gap-1 text-xs text-yellow-600 mt-1">
          <Info className="h-3 w-3" />
          <span>Complete your 11-digit mobile number</span>
        </div>
      );
    }
    return null;
  };

  const inputClasses = cn(
    "pl-10 pr-10 h-12 text-base font-poppins transition-all duration-200",
    focused && "ring-2 ring-primary/20 border-primary",
    isValid && showValidation && "border-green-500 focus:border-green-500",
    error && "border-destructive focus:border-destructive",
    className
  );

  return (
    <div className="space-y-2">
      {label && (
        <Label htmlFor={id} className="flex items-center gap-2 font-poppins text-sm font-medium">
          <Phone className="h-4 w-4 text-primary" />
          <span>{label}</span>
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {/* Phone Icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Phone className="h-5 w-5 text-muted-foreground" />
        </div>
        
        {/* Input Field */}
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          maxLength={12}
          required={required}
          autoComplete="tel"
        />
        
        {/* Validation Icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          {getValidationIcon()}
        </div>
      </div>
      
      {/* Validation Message */}
      {getValidationMessage()}
      
      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-1 text-xs text-destructive mt-1">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Helper Text for Mobile */}
      {focused && !error && !isValid && (
        <div className="text-xs text-muted-foreground animate-fade-in">
          Enter your 11-digit Pakistani mobile number starting with 03
        </div>
      )}
    </div>
  );
};