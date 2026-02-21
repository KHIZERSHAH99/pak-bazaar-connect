import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import TutorialManager from '@/components/tutorials/TutorialManager';

const DashboardTutorialManager: React.FC = () => {
  return (
    <DashboardLayout>
      <TutorialManager />
    </DashboardLayout>
  );
};

export default DashboardTutorialManager;
