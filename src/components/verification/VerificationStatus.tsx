
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

export const VerificationStatus: React.FC = () => {
  const { data: verificationStatus, isLoading } = useQuery({
    queryKey: ['verification-status'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('verification_status, verification_notes, cnic_image, selfie_image')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <AlertCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Your account has been verified. You can now access all wholesaler features.';
      case 'rejected':
        return 'Your verification was rejected. Please check the notes below and resubmit your documents.';
      case 'pending':
      default:
        return 'Your verification is under review. This usually takes 24-48 hours.';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  if (!verificationStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Complete your account verification to access all features.
          </p>
          <Button className="mt-4">
            Start Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Verification Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Current Status:</span>
          {getStatusBadge(verificationStatus.verification_status)}
        </div>

        <p className="text-gray-600">
          {getStatusMessage(verificationStatus.verification_status)}
        </p>

        {verificationStatus.verification_notes && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Admin Notes:</p>
                <p className="text-yellow-700 text-sm">
                  {verificationStatus.verification_notes}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-sm">
              {verificationStatus.cnic_image ? 'CNIC Uploaded' : 'CNIC Required'}
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <FileText className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-sm">
              {verificationStatus.selfie_image ? 'Selfie Uploaded' : 'Selfie Required'}
            </p>
          </div>
        </div>

        {verificationStatus.verification_status === 'rejected' && (
          <Button className="w-full mt-4">
            Resubmit Documents
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
