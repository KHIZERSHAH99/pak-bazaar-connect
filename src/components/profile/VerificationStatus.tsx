
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface VerificationStatusProps {
  profile: any;
}

const VerificationStatus: React.FC<VerificationStatusProps> = ({ profile }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="default" className="bg-green-100 text-green-800 font-poppins">Verified</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 font-poppins">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="font-poppins">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="font-poppins">Unverified</Badge>;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Your account has been verified and approved for trading.';
      case 'pending':
        return 'Your verification is under review. This may take 1-3 business days.';
      case 'rejected':
        return 'Your verification was rejected. Please contact support for details.';
      default:
        return 'Complete your profile to start the verification process.';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getStatusIcon(profile.verification_status)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium font-poppins">Verification Status</h3>
            {getStatusBadge(profile.verification_status)}
          </div>
          <p className="text-sm text-gray-600 font-poppins">
            {getStatusMessage(profile.verification_status)}
          </p>
          {profile.verification_notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700 font-poppins">
                <strong>Note:</strong> {profile.verification_notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default VerificationStatus;
