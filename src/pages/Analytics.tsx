
import React from 'react';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import SellerAnalytics from '@/components/analytics/SellerAnalytics';
import { BarChart, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Analytics: React.FC = () => {
  const { profile } = useAuth();
  const { t } = useLanguage();

  // Check if user has the right role for analytics
  const canViewAnalytics = profile?.role === 'wholesaler' || profile?.role === 'admin';

  if (!canViewAnalytics) {
    return (
      <Layout>
        <ProtectedRoute>
          <div className="container mx-auto px-4 py-16 text-center">
            <Card className="max-w-md mx-auto">
              <CardContent className="p-8">
                <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2 font-poppins">
                  {t('unauthorized_access')}
                </h2>
                <p className="text-gray-600 font-poppins">
                  {t('view_analytics')} - {t('wholesaler')} {t('registration_required')}
                </p>
              </CardContent>
            </Card>
          </div>
        </ProtectedRoute>
      </Layout>
    );
  }

  return (
    <Layout>
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-8">
            <BarChart className="h-8 w-8 text-purple-500" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white font-poppins">
              {t('analytics_dashboard')}
            </h1>
          </div>
          
          <SellerAnalytics />
        </div>
      </ProtectedRoute>
    </Layout>
  );
};

export default Analytics;
