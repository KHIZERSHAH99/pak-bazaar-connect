
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { approveAllPendingProducts } from '@/lib/admin-functions';

interface ProductApprovalBannerProps {
  pendingCount: number;
  onApproved: () => void;
  userRole: string;
}

const ProductApprovalBanner: React.FC<ProductApprovalBannerProps> = ({
  pendingCount,
  onApproved,
  userRole
}) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  const handleApproveAll = async () => {
    setIsLoading(true);
    try {
      await approveAllPendingProducts();
      toast({
        title: "Success",
        description: `Approved ${pendingCount} products`,
      });
      onApproved();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (pendingCount === 0) return null;

  return (
    <Alert className="mb-6 border-orange-200 bg-orange-50">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {pendingCount} products are pending approval and won't be visible to buyers.
        </span>
        {userRole === 'admin' && (
          <Button 
            onClick={handleApproveAll}
            disabled={isLoading}
            size="sm"
            className="ml-4"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isLoading ? 'Approving...' : 'Approve All'}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ProductApprovalBanner;
