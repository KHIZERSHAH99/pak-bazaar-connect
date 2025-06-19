
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Upload, Shield, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getUserProfile } from '@/lib/auth';

export const WholesalerVerification: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationData, setVerificationData] = useState({
    cnicImage: null as File | null,
    selfieImage: null as File | null,
  });

  const queryClient = useQueryClient();

  const handleFileChange = (type: 'cnic' | 'selfie') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 102400) { // 100KB limit
        toast({
          title: "File Too Large",
          description: "Image must be less than 100KB.",
          variant: "destructive",
        });
        return;
      }
      
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          title: "Invalid File Type",
          description: "Please upload a JPEG, PNG, or WebP image.",
          variant: "destructive",
        });
        return;
      }
      
      setVerificationData(prev => ({
        ...prev,
        [type === 'cnic' ? 'cnicImage' : 'selfieImage']: file
      }));
    }
  };

  const submitVerification = useMutation({
    mutationFn: async () => {
      if (!verificationData.cnicImage || !verificationData.selfieImage) {
        throw new Error('Both CNIC and selfie images are required');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload CNIC image
      const cnicFileName = `${user.id}/cnic_${Date.now()}.jpg`;
      const { data: cnicUpload, error: cnicError } = await supabase.storage
        .from('verification-documents')
        .upload(cnicFileName, verificationData.cnicImage);

      if (cnicError) throw cnicError;

      // Upload selfie image
      const selfieFileName = `${user.id}/selfie_${Date.now()}.jpg`;
      const { data: selfieUpload, error: selfieError } = await supabase.storage
        .from('verification-documents')
        .upload(selfieFileName, verificationData.selfieImage);

      if (selfieError) throw selfieError;

      // Update profile with verification images
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cnic_image: cnicUpload.path,
          selfie_image: selfieUpload.path,
          verification_status: 'pending'
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return { cnicUpload, selfieUpload };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast({
        title: "Verification Submitted",
        description: "Your documents have been submitted for review. You'll be notified once verified.",
      });
      setVerificationData({
        cnicImage: null,
        selfieImage: null,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message || "Failed to submit verification documents.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitVerification.mutateAsync();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVerificationStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending Review' },
      approved: { variant: 'default' as const, icon: CheckCircle, text: 'Verified' },
      rejected: { variant: 'destructive' as const, icon: AlertCircle, text: 'Rejected' },
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Wholesaler Verification
        </CardTitle>
        <CardDescription>
          Upload your CNIC and a selfie to verify your identity and unlock full platform features.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Information Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Verification Benefits</p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Increase buyer trust and credibility</li>
                  <li>Access to premium features</li>
                  <li>Higher visibility in search results</li>
                  <li>Reduced commission rates</li>
                </ul>
              </div>
            </div>
          </div>

          {/* CNIC Upload */}
          <div className="space-y-2">
            <Label>CNIC Front Side Image *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange('cnic')}
                className="hidden"
                id="cnic-upload"
                required
              />
              <label htmlFor="cnic-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">
                    {verificationData.cnicImage ? verificationData.cnicImage.name : 'Upload CNIC Image'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Clear photo of CNIC front side • Max 100KB
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Selfie Upload */}
          <div className="space-y-2">
            <Label>Selfie with CNIC *</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange('selfie')}
                className="hidden"
                id="selfie-upload"
                required
              />
              <label htmlFor="selfie-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">
                    {verificationData.selfieImage ? verificationData.selfieImage.name : 'Upload Selfie'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Selfie holding your CNIC • Max 100KB
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Guidelines */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">Photo Guidelines:</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc list-inside">
              <li>Ensure CNIC text is clearly readable</li>
              <li>Face should be clearly visible in selfie</li>
              <li>Good lighting, no shadows or glare</li>
              <li>Images should be recent and high quality</li>
              <li>File size must be under 100KB</li>
            </ul>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            size="lg"
            disabled={isSubmitting || submitVerification.isPending || !verificationData.cnicImage || !verificationData.selfieImage}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Submitting for Review...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4 mr-2" />
                Submit for Verification
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
