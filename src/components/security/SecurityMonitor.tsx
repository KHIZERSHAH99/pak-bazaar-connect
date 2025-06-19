
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

interface SecurityEvent {
  id: string;
  event_type: string;
  created_at: string;
  new_values?: any;
}

export const SecurityMonitor: React.FC = () => {
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);

  const { data: securityMetrics } = useQuery({
    queryKey: ['security-metrics'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return null;

      // Get recent security events
      const { data: events } = await supabase
        .from('audit_logs')
        .select('id, event_type, created_at, new_values')
        .eq('user_id', user.id)
        .in('event_type', ['login_failed', 'unauthorized_access', 'rate_limit_exceeded'])
        .order('created_at', { ascending: false })
        .limit(10);

      return {
        recentEvents: events || [],
        totalSecurityEvents: events?.length || 0
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (securityMetrics?.recentEvents) {
      setRecentEvents(securityMetrics.recentEvents);
    }
  }, [securityMetrics]);

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'login_failed':
        return <Badge variant="destructive">Failed Login</Badge>;
      case 'unauthorized_access':
        return <Badge variant="destructive">Unauthorized</Badge>;
      case 'rate_limit_exceeded':
        return <Badge variant="secondary">Rate Limited</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  const hasSecurityConcerns = recentEvents.some(event => 
    ['login_failed', 'unauthorized_access'].includes(event.event_type)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasSecurityConcerns && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Unusual security activity detected. Please review recent events below.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="font-semibold">{securityMetrics?.totalSecurityEvents || 0}</p>
            <p className="text-sm text-gray-600">Security Events</p>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <Eye className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="font-semibold">Active</p>
            <p className="text-sm text-gray-600">Monitoring</p>
          </div>
        </div>

        {recentEvents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Recent Security Events</h4>
            {recentEvents.slice(0, 5).map((event) => (
              <div key={event.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  {getEventBadge(event.event_type)}
                  <span className="text-sm text-gray-600">
                    {new Date(event.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {recentEvents.length === 0 && (
          <div className="text-center py-4">
            <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No security concerns detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
