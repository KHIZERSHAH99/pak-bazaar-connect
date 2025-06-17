
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';

const AdApprovals: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 font-poppins">Advertisement Approvals</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <CheckCircle className="w-5 h-5" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 font-poppins mb-4">
            Review and approve advertisement submissions from wholesalers.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium font-poppins">No pending approvals</p>
                <p className="text-sm text-gray-600 font-poppins">All advertisements have been reviewed</p>
              </div>
              <Badge variant="outline" className="font-poppins">
                <Clock className="w-3 h-3 mr-1" />
                Up to date
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdApprovals;
