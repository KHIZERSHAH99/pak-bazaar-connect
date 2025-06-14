
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ShopQuickActionsCard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 font-poppins">Quick Actions</h3>
      <div className="space-y-3">
        <Button 
            className="w-full bg-pakistani_green-700 hover:bg-pakistani_green-800 dark:bg-pakistani_green-600 dark:hover:bg-pakistani_green-700" 
            onClick={() => navigate('/dashboard/products')}
        >
          Add New Product
        </Button>
        <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/dashboard/ads')}
        >
          Create Advertisement
        </Button>
        <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => navigate('/analytics')}
        >
          View Analytics
        </Button>
      </div>
    </Card>
  );
};

export default ShopQuickActionsCard;
