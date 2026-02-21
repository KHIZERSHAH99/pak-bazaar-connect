import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TutorialDetail from '@/components/tutorials/TutorialDetail';

const DashboardTutorialDetail: React.FC = () => {
  return (
    <DashboardLayout>
      <TutorialDetail />
    </DashboardLayout>
  );
};

export default DashboardTutorialDetail;
