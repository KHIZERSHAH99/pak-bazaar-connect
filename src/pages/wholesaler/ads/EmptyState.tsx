
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';

interface EmptyStateProps {
  onCreateClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onCreateClick }) => {
  return (
    <Card className="p-8 text-center">
      <div className="flex justify-center mb-4">
        <FileText className="h-16 w-16 text-gray-300" />
      </div>
      <h3 className="text-lg font-medium text-gray-700 mb-2">No advertisements yet</h3>
      <p className="text-gray-600 mb-6">Create your first advertisement to promote your products.</p>
      <Button 
        onClick={onCreateClick}
        className="bg-primary hover:bg-pakistani-green-800"
      >
        <Plus className="w-4 h-4 mr-2" /> Create Ad
      </Button>
    </Card>
  );
};

export default EmptyState;
