
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Database, Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { queryOptimizer } from '@/lib/performance/query-optimizer';
import { cacheManager } from '@/lib/performance/cache-manager';

const MonitoringDashboard: React.FC = () => {
  const [systemStats, setSystemStats] = useState({
    cacheHitRate: 0,
    activeQueries: 0,
    errorRate: 0,
    responseTime: 0
  });

  const [performanceData, setPerformanceData] = useState([
    { time: '00:00', queries: 45, cache: 78, errors: 2 },
    { time: '04:00', queries: 32, cache: 85, errors: 1 },
    { time: '08:00', queries: 67, cache: 72, errors: 3 },
    { time: '12:00', queries: 89, cache: 68, errors: 5 },
    { time: '16:00', queries: 94, cache: 71, errors: 2 },
    { time: '20:00', queries: 76, cache: 82, errors: 1 }
  ]);

  const [securityEvents, setSecurityEvents] = useState([
    { type: 'Login Failure', count: 12, severity: 'medium', time: '2 min ago' },
    { type: 'Rate Limit Hit', count: 3, severity: 'low', time: '5 min ago' },
    { type: 'Unauthorized Access', count: 1, severity: 'high', time: '1 hour ago' }
  ]);

  useEffect(() => {
    fetchSystemStats();
    const interval = setInterval(fetchSystemStats, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemStats = async () => {
    try {
      const cacheStats = cacheManager.getStats();
      const queryStats = queryOptimizer.getCacheStats();
      
      setSystemStats({
        cacheHitRate: Math.round(queryStats.hitRate * 100),
        activeQueries: Math.floor(Math.random() * 50) + 10, // Simulated
        errorRate: Math.random() * 5, // Simulated
        responseTime: Math.floor(Math.random() * 200) + 50 // Simulated
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getHealthStatus = () => {
    if (systemStats.errorRate > 5) return { status: 'critical', color: 'text-red-600', icon: AlertTriangle };
    if (systemStats.errorRate > 2) return { status: 'warning', color: 'text-yellow-600', icon: AlertTriangle };
    return { status: 'healthy', color: 'text-green-600', icon: CheckCircle };
  };

  const healthStatus = getHealthStatus();
  const HealthIcon = healthStatus.icon;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins">System Monitoring</h1>
        <div className="flex items-center gap-2">
          <HealthIcon className={`h-5 w-5 ${healthStatus.color}`} />
          <span className={`font-medium ${healthStatus.color} font-poppins`}>
            System {healthStatus.status}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.cacheHitRate}%</div>
            <Progress value={systemStats.cacheHitRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Queries</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeQueries}</div>
            <p className="text-xs text-muted-foreground">per minute</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.errorRate.toFixed(1)}%</div>
            <Progress 
              value={systemStats.errorRate} 
              className="mt-2"
              // @ts-ignore - Custom color for error indication
              style={{ '--progress-foreground': systemStats.errorRate > 2 ? 'hsl(var(--destructive))' : 'hsl(var(--primary))' }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">database queries</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="queries" stroke="#8884d8" name="Queries/min" />
                    <Line type="monotone" dataKey="cache" stroke="#82ca9d" name="Cache Hit %" />
                    <Line type="monotone" dataKey="errors" stroke="#ff7300" name="Errors" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityEvents.map((event, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={getSeverityColor(event.severity) as any}>
                        {event.severity}
                      </Badge>
                      <div>
                        <p className="font-medium">{event.type}</p>
                        <p className="text-sm text-gray-600">{event.count} occurrences</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{event.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Products Query</span>
                    <span className="text-sm font-medium">45ms avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Orders Query</span>
                    <span className="text-sm font-medium">78ms avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Shops Query</span>
                    <span className="text-sm font-medium">32ms avg</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">User Query</span>
                    <span className="text-sm font-medium">12ms avg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cache Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Entries</span>
                    <span className="text-sm font-medium">{cacheManager.getStats().size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Hit Rate</span>
                    <span className="text-sm font-medium">{systemStats.cacheHitRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Memory Usage</span>
                    <span className="text-sm font-medium">2.4 MB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Active Tags</span>
                    <span className="text-sm font-medium">{cacheManager.getStats().tags}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MonitoringDashboard;
