import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TutorialGrid from '@/components/tutorials/TutorialGrid';

const DashboardTutorials: React.FC = () => {
  return (
    <DashboardLayout>
      <TutorialGrid />
    </DashboardLayout>
  );
};

export default DashboardTutorials;
