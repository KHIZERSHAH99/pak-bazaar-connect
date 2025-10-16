import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
// Debug phone numbers function removed with OTP system
import { useToast } from '@/hooks/use-toast';

interface PhoneRecord {
  phone_number: string;
  normalized_phone: string;
  email: string;
  role: string;
}

const LoginDebugPanel: React.FC = () => {
  const [phoneRecords, setPhoneRecords] = useState<PhoneRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPhoneNumbers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('phone_number, normalized_phone, email, role')
        .not('phone_number', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setPhoneRecords(data || []);
      
      toast({
        title: 'Debug Data Loaded',
        description: `Found ${data?.length || 0} phone records`,
      });
    } catch (error) {
      console.error('Debug fetch error:', error);
      toast({
        title: 'Debug Error',
        description: 'Failed to fetch debug data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const associatePhoneWithAdmin = async () => {
    try {
      const { data, error } = await supabase.rpc('associate_phone_with_account', {
        p_email: 'khizerfight@gmail.com',
        p_phone_number: '03418337167'
      });

      if (error) throw error;

      toast({
        title: 'Association Successful',
        description: 'Phone number linked to admin account',
      });
      
      // Refresh the phone list
      fetchPhoneNumbers();
    } catch (error: any) {
      console.error('Association error:', error);
      toast({
        title: 'Association Failed',
        description: error.message || 'Failed to associate phone number',
        variant: 'destructive',
      });
    }
  };

  const testPhone = '03418337167';

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Login Debug Panel</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={fetchPhoneNumbers} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Fetch Phone Numbers'}
          </Button>
          <Button onClick={associatePhoneWithAdmin} variant="outline">
            Link Test Phone to Admin
          </Button>
        </div>

        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm font-medium">Test Phone Number:</p>
          <p className="text-lg font-mono">{testPhone}</p>
        </div>

        {phoneRecords.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Available Phone Numbers:</h3>
            {phoneRecords.map((record, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-mono text-sm">{record.phone_number}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      Normalized: {record.normalized_phone}
                    </p>
                    <p className="text-xs text-muted-foreground">{record.email}</p>
                  </div>
                  <Badge variant={record.role === 'admin' ? 'default' : 'secondary'}>
                    {record.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {phoneRecords.length === 0 && !isLoading && (
          <div className="text-center py-4 text-muted-foreground">
            Click "Fetch Phone Numbers" to see available accounts
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoginDebugPanel;