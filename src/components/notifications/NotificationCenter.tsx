import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, DollarSign, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContextFixed';
import { Notification } from '@/types/enhanced-payment';
const NotificationCenter: React.FC = () => {
  const {
    user
  } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const {
        data,
        error
      } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(20);
      if (error) throw error;

      // Cast the data to proper types
      const typedNotifications: Notification[] = (data || []).map((item: any) => ({
        ...item,
        type: item.type as 'order_status' | 'commission' | 'suspension' | 'general'
      }));
      setNotifications(typedNotifications);
      setUnreadCount(typedNotifications.filter(n => !n.read_at).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const markAsRead = async (notificationId: string) => {
    try {
      const {
        error
      } = await supabase.from('notifications').update({
        read_at: new Date().toISOString()
      }).eq('id', notificationId);
      if (error) throw error;
      setNotifications(prev => prev.map(n => n.id === notificationId ? {
        ...n,
        read_at: new Date().toISOString()
      } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      if (unreadIds.length === 0) return;
      const {
        error
      } = await supabase.from('notifications').update({
        read_at: new Date().toISOString()
      }).in('id', unreadIds);
      if (error) throw error;
      setNotifications(prev => prev.map(n => ({
        ...n,
        read_at: n.read_at || new Date().toISOString()
      })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'order_status':
        return <Package className="h-4 w-4 text-blue-500" />;
      case 'commission':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'suspension':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };
  if (isLoading) {
    return <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-poppins">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 h-16 rounded"></div>)}
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader className="bg-green-100">
        <CardTitle className="flex items-center justify-between font-poppins">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && <Badge variant="destructive" className="ml-2">
                {unreadCount}
              </Badge>}
          </div>
          {unreadCount > 0 && <Button variant="outline" size="sm" onClick={markAllAsRead} className="font-poppins">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="bg-green-100">
        {notifications.length === 0 ? <div className="text-center py-8 rounded-md bg-green-100">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 font-poppins">No notifications yet</p>
          </div> : <div className="space-y-3">
            {notifications.map(notification => <div key={notification.id} className={`p-4 border rounded-lg cursor-pointer transition-colors ${notification.read_at ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200 hover:bg-blue-100'}`} onClick={() => !notification.read_at && markAsRead(notification.id)}>
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium font-poppins ${notification.read_at ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notification.title}
                      </h4>
                      {!notification.read_at && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>}
                    </div>
                    <p className={`text-sm mt-1 font-poppins ${notification.read_at ? 'text-gray-500' : 'text-gray-700'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2 font-poppins">
                      {new Date(notification.created_at!).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>)}
          </div>}
      </CardContent>
    </Card>;
};
export default NotificationCenter;