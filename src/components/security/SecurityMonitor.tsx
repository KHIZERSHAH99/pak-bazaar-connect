
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, Activity } from 'lucide-react';
import { getCurrentUser } from '@/lib/auth';

interface SecurityEvent {
  id: string;
  event_type: string;
  created_at: string;
  details?: any;
}

export const SecurityMonitor: React.FC = () => {
  const [recentEvents, setRecentEvents] = useState<SecurityEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    loadSecurityEvents();
  }, []);

  const loadSecurityEvents = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) return;

      // Load security events from localStorage (fallback approach)
      const storedLogs = localStorage.getItem('security_logs');
      if (storedLogs) {
        const logs = JSON.parse(storedLogs);
        const securityEvents = logs
          .filter((log: any) => 
            ['login_failed', 'unauthorized_access', 'rate_limit_exceeded', 'security_violation'].includes(log.event_type)
          )
          .map((log: any) => ({
            id: Math.random().toString(36),
            event_type: log.event_type || 'unknown',
            created_at: log.timestamp || new Date().toISOString(),
            details: log.details
          }))
          .slice(0, 10);

        setRecentEvents(securityEvents);
        setTotalEvents(securityEvents.length);
      }
    } catch (error) {
      console.error('Failed to load security events:', error);
    }
  };

  const getEventBadge = (eventType: string) => {
    switch (eventType) {
      case 'login_failed':
        return <Badge variant="destructive">Failed Login</Badge>;
      case 'unauthorized_access':
        return <Badge variant="destructive">Unauthorized</Badge>;
      case 'rate_limit_exceeded':
        return <Badge variant="secondary">Rate Limited</Badge>;
      case 'security_violation':
        return <Badge variant="destructive">Security Violation</Badge>;
      default:
        return <Badge variant="outline">{eventType}</Badge>;
    }
  };

  const hasSecurityConcerns = recentEvents.some(event => 
    ['login_failed', 'unauthorized_access', 'security_violation'].includes(event.event_type)
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
            <p className="font-semibold">{totalEvents}</p>
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
