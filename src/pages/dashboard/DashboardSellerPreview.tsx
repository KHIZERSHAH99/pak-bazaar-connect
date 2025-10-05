import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import SellerDashboard from '@/components/dashboard/SellerDashboard';
import { Button } from '@/components/ui/button';

const DashboardSellerPreview: React.FC = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-600 text-white p-2 rounded-lg">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-green-900 font-poppins">Preview Mode: Seller View</h3>
              <p className="text-sm text-green-700 font-poppins">You're viewing the platform as a seller would see it</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/admin')}
            className="font-poppins"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
        
        <SellerDashboard />
      </div>
    </DashboardLayout>
  );
};

export default DashboardSellerPreview;
