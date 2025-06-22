
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

const Signup = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'seller',
    phoneNumber: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.phoneNumber) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.phoneNumber.match(/^03\d{9}$/)) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid Pakistani phone number (03XXXXXXXXX).",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handlePhoneVerification = () => {
    if (!validateForm()) return;
    setShowOTPVerification(true);
  };

  const handleSignup = async () => {
    if (!phoneVerified) {
      toast({
        title: "Phone Verification Required",
        description: "Please verify your phone number first.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          data: {
            role: formData.role,
            phone_number: formData.phoneNumber,
            phone_verified: true
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account Created Successfully",
          description: "You can now sign in with your credentials.",
        });
        navigate('/login');
      }

    } catch (error: any) {
      let errorMessage = "Failed to create account. Please try again.";
      
      if (error.message.includes('already registered')) {
        errorMessage = "An account with this email already exists.";
      } else if (error.message.includes('password')) {
        errorMessage = "Password does not meet requirements.";
      }
      
      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (showOTPVerification && !phoneVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          <OTPVerification
            phoneNumber={formData.phoneNumber}
            onVerified={(verified) => {
              setPhoneVerified(verified);
              if (verified) {
                setShowOTPVerification(false);
              }
            }}
            onPhoneChange={(phone) => handleInputChange('phoneNumber', phone)}
          />
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              onClick={() => setShowOTPVerification(false)}
            >
              Back to Signup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create Account
          </CardTitle>
          <CardDescription>
            Join Pakistan's premier B2B marketplace
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              placeholder="03XXXXXXXXX"
              maxLength={11}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Account Type *</Label>
            <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Seller (Buy wholesale products)</SelectItem>
                <SelectItem value="wholesaler">Wholesaler (Sell to retailers)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Create a password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {phoneVerified && (
            <Alert className="border-green-200 bg-green-50">
              <AlertDescription className="text-green-700">
                ✓ Phone number verified successfully
              </AlertDescription>
            </Alert>
          )}

          {!phoneVerified ? (
            <Button
              onClick={handlePhoneVerification}
              className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700"
            >
              Verify Phone & Continue
            </Button>
          ) : (
            <Button
              onClick={handleSignup}
              disabled={loading}
              className="w-full bg-pakistani_green-600 hover:bg-pakistani_green-700"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          )}

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-pakistani_green-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Signup;
