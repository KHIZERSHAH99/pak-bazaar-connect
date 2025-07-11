
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextFixed';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, User, Shield, UserCheck } from 'lucide-react';

interface AuthenticationGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'wholesaler' | 'seller';
  allowedRoles?: string[];
  redirectTo?: string;
}

const AuthenticationGuard: React.FC<AuthenticationGuardProps> = ({ 
  children, 
  requiredRole, 
  allowedRoles = [],
  redirectTo = '/login'
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any auth errors when location changes
    setAuthError(null);
  }, [location]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pakistani_green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Authenticating...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check if profile exists and is loaded
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Loading</h2>
              <p className="text-gray-600 mb-4">
                Your profile is being set up. This may take a moment.
              </p>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for pending role approval
  if (profile.role === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <User className="h-12 w-12 text-blue-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Pending</h2>
              <p className="text-gray-600 mb-4">
                Your account is pending role assignment. Please contact support or wait for admin approval.
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => window.location.href = '/signup'}>
                Complete Registration
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/login'}
              >
                Try Logging In Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check for suspended account
  if (profile.is_suspended) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <Shield className="h-12 w-12 text-red-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Suspended</h2>
              <p className="text-gray-600 mb-4">
                Your account has been suspended. 
                {profile.suspension_reason && (
                  <span className="block mt-2 text-sm">
                    <strong>Reason:</strong> {profile.suspension_reason}
                  </span>
                )}
              </p>
              {profile.suspended_until && (
                <p className="text-sm text-gray-500">
                  Suspended until: {new Date(profile.suspended_until).toLocaleDateString()}
                </p>
              )}
            </div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Please contact support to resolve this issue.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check role-based access
  if (requiredRole && profile.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <UserCheck className="h-12 w-12 text-orange-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
              <p className="text-gray-600 mb-4">
                This area is restricted to {requiredRole} accounts only.
                Your current role: <strong>{profile.role}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/dashboard'}
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check allowed roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <UserCheck className="h-12 w-12 text-orange-500 mx-auto" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">
                You don't have permission to access this area.
                Allowed roles: <strong>{allowedRoles.join(', ')}</strong>
              </p>
            </div>
            <Button onClick={() => window.location.href = '/dashboard'}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If all checks pass, render the protected content
  return <>{children}</>;
};

export default AuthenticationGuard;
