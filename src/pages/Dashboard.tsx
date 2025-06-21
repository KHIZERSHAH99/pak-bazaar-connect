
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { getUserProfile } from '@/lib/auth-fixed';
import FixedQuickActions from '@/components/dashboard/FixedQuickActions';
import { useUrduLanguage } from '@/contexts/UrduLanguageContext';

const Dashboard = () => {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { t, isUrdu } = useUrduLanguage();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load your profile. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className={`container mx-auto p-6 space-y-6 ${isUrdu ? 'rtl' : 'ltr'}`}>
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome')}, {userProfile.contact_name || userProfile.business_name || 'User'}!
          </h1>
          <p className="text-gray-600 mt-1">
            {isUrdu ? 'آپ کے کاروبار کا جائزہ' : 'Overview of your business dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={`${getStatusColor(userProfile.role)}`}>
            {t(`role.${userProfile.role}`)}
          </Badge>
          <Badge variant="outline" className={`${getStatusColor(userProfile.verification_status)} flex items-center gap-1`}>
            {getStatusIcon(userProfile.verification_status)}
            {t(`role.${userProfile.verification_status}`)}
          </Badge>
        </div>
      </div>

      {/* Status Alerts */}
      {userProfile.role === 'pending' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {isUrdu 
              ? 'آپ کا اکاؤنٹ ابھی تک منظور نہیں ہوا۔ کرپیا اپنی پروفائل مکمل کریں۔'
              : 'Your account is still pending approval. Please complete your profile information.'
            }
          </AlertDescription>
        </Alert>
      )}

      {userProfile.role === 'wholesaler' && userProfile.verification_status === 'pending' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            {isUrdu
              ? 'آپ کا ہول سیلر اکاؤنٹ منظوری کے انتظار میں ہے۔ آپ کو جلد اطلاع دی جائے گی۔'
              : 'Your wholesaler account is pending approval. You will be notified once approved.'
            }
          </AlertDescription>
        </Alert>
      )}

      {userProfile.verification_status === 'approved' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {isUrdu
              ? 'مبارک ہو! آپ کا اکاؤنٹ منظور ہو گیا ہے۔'
              : 'Congratulations! Your account has been approved.'
            }
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isUrdu ? 'کل آرڈرز' : 'Total Orders'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isUrdu ? 'پچھلے مہینے سے' : 'from last month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isUrdu ? 'کل فروخت' : 'Total Sales'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨0</div>
            <p className="text-xs text-muted-foreground">
              {isUrdu ? 'پچھلے مہینے سے' : 'from last month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isUrdu ? 'فعال مصنوعات' : 'Active Products'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {isUrdu ? 'دستیاب' : 'available'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isUrdu ? 'کمیشن' : 'Commission'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₨0</div>
            <p className="text-xs text-muted-foreground">
              {isUrdu ? 'اس مہینے' : 'this month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <FixedQuickActions userRole={userProfile.role} />

      {/* Welcome Message */}
      <Card>
        <CardHeader>
          <CardTitle>{isUrdu ? 'خوش آمدید' : 'Welcome to PakTrade'}</CardTitle>
          <CardDescription>
            {isUrdu
              ? 'پاکستان کا سب سے بڑا B2B مارکیٹ پلیس'
              : 'Pakistan\'s leading B2B wholesale marketplace'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {isUrdu
              ? 'یہاں آپ اپنا کاروبار بڑھا سکتے ہیں، نئے گاہکوں سے رابطہ کر سکتے ہیں، اور معیاری مصنوعات خرید و فروخت کر سکتے ہیں۔'
              : 'Here you can grow your business, connect with new customers, and buy or sell quality products.'
            }
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
