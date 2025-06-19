
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Eye, Clock } from 'lucide-react';

interface SecurityEvent {
  id: string;
  event_type: string;
  created_at: string;
  user_id?: string;
  details?: any;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityMonitor: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate security events for demonstration
    // In a real app, this would fetch from audit_logs table
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        event_type: 'login_success',
        created_at: new Date().toISOString(),
        severity: 'low',
        details: { ip: '192.168.1.1' }
      },
      {
        id: '2',
        event_type: 'order_created',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        severity: 'medium',
        details: { amount: 5000 }
      },
      {
        id: '3',
        event_type: 'role_change_requested',
        created_at: new Date(Date.now() - 7200000).toISOString(),
        severity: 'high',
        details: { requested_role: 'admin' }
      }
    ];

    setTimeout(() => {
      setEvents(mockEvents);
      setLoading(false);
    }, 1000);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const criticalEvents = events.filter(e => e.severity === 'critical' || e.severity === 'high');

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {criticalEvents.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Alert:</strong> {criticalEvents.length} high-priority security event(s) detected.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-gray-600 text-center py-4">No security events recorded</p>
            ) : (
              events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{event.event_type.replace('_', ' ').toUpperCase()}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Badge className={getSeverityColor(event.severity)}>
                    {event.severity.toUpperCase()}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
