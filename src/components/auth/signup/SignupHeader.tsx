
import React from 'react';
import { Briefcase } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import ProgressBar from './ProgressBar';

interface SignupHeaderProps {
  selectedRole: string;
  currentStep: number;
  totalSteps: number;
  getStepTitle: () => string;
}

const SignupHeader: React.FC<SignupHeaderProps> = ({ 
  selectedRole, 
  currentStep, 
  totalSteps, 
  getStepTitle 
}) => {
  return (
    <CardHeader className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-500 text-white text-center pb-6">
      <div className="flex justify-center mb-4">
        <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
          <Briefcase className="h-8 w-8" />
        </div>
      </div>
      <CardTitle className="text-2xl font-bold font-poppins">
        {selectedRole === 'seller' ? 'Seller Registration' : 'Business Registration'}
      </CardTitle>
      <CardDescription className="text-green-50 font-poppins">
        Step {currentStep} of {totalSteps}: {getStepTitle()}
      </CardDescription>
      
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
    </CardHeader>
  );
};

export default SignupHeader;
