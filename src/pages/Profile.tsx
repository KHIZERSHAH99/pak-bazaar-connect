
import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import EnhancedUserProfile from '@/components/profile/EnhancedUserProfile';

const Profile: React.FC = () => {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <EnhancedUserProfile />
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Profile;
