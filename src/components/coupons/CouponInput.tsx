
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Ticket, X, Check } from 'lucide-react';
import { validateCoupon, type Coupon } from '@/lib/coupons';
import { useToast } from '@/hooks/use-toast';

interface CouponInputProps {
  orderAmount: number;
  onCouponApplied: (coupon: Coupon, discount: number) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: { coupon: Coupon; discount: number } | null;
  disabled?: boolean;
}

const CouponInput: React.FC<CouponInputProps> = ({
  orderAmount,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon,
  disabled = false
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsValidating(true);
    try {
      const result = await validateCoupon(couponCode.trim(), orderAmount);
      
      if (result.valid && result.coupon && result.discount !== undefined) {
        onCouponApplied(result.coupon, result.discount);
        setCouponCode('');
        toast({
          title: "Coupon applied!",
          description: `You saved Rs. ${result.discount.toFixed(2)}`,
        });
      } else {
        toast({
          title: "Invalid coupon",
          description: result.error || "This coupon cannot be applied",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to validate coupon. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast({
      title: "Coupon removed",
      description: "The coupon has been removed from your order",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="space-y-4">
      <Separator />
      
      {!appliedCoupon ? (
        <div className="space-y-3">
          <Label htmlFor="coupon-code" className="flex items-center gap-2 font-poppins">
            <Ticket className="h-4 w-4" />
            Have a coupon code?
          </Label>
          <div className="flex gap-2">
            <Input
              id="coupon-code"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={disabled || isValidating}
              className="font-mono font-poppins"
            />
            <Button
              onClick={handleApplyCoupon}
              disabled={disabled || isValidating || !couponCode.trim()}
              variant="outline"
              className="font-poppins"
            >
              {isValidating ? 'Checking...' : 'Apply'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 dark:bg-green-800/50 p-2 rounded-full">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono font-bold">
                    {appliedCoupon.coupon.code}
                  </code>
                  <Badge variant="secondary" className="text-green-700 bg-green-100 dark:bg-green-800 dark:text-green-300">
                    Applied
                  </Badge>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 font-poppins mt-1">
                  You saved Rs. {appliedCoupon.discount.toFixed(2)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveCoupon}
              disabled={disabled}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      
      <Separator />
    </div>
  );
};

export default CouponInput;
