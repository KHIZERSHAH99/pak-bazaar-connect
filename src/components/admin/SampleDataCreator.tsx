
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createSampleProducts } from '@/lib/sampleData';
import { useToast } from '@/hooks/use-toast';
import { Package, Plus } from 'lucide-react';

const SampleDataCreator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateSampleProducts = async () => {
    try {
      setLoading(true);
      await createSampleProducts();
      toast({
        title: "Sample products created",
        description: "Sample products have been added to the database.",
      });
    } catch (error: any) {
      console.error('Error creating sample products:', error);
      toast({
        title: "Error creating sample products",
        description: error.message || "Failed to create sample products.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Sample Data Creator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4">
          Create sample products to test the marketplace functionality.
        </p>
        <Button 
          onClick={handleCreateSampleProducts}
          disabled={loading}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {loading ? 'Creating...' : 'Create Sample Products'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleDataCreator;
