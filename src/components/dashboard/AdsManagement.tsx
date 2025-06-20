
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import CreateAdDialog from '@/components/ads/CreateAdDialog';

const AdsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleAdCreated = () => {
    // Refresh ads list if needed
    console.log('Ad created successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">Advertisements</h1>
        <Button 
          className="bg-pakistani_green-700 hover:bg-pakistani_green-800 font-poppins"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <FileText className="w-5 h-5" />
            Advertisement Campaign
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-poppins">
            Create and manage promotional advertisements for your products. Track performance and engagement.
          </p>
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
            <p className="text-yellow-800 font-poppins text-sm">
              🎯 Remember: First 10 wholesalers get FREE ads! Create your first campaign now.
            </p>
          </div>
        </CardContent>
      </Card>

      <CreateAdDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onAdCreated={handleAdCreated}
      />
    </div>
  );
};

export default AdsManagement;
