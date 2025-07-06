
import React from 'react';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { UserRole } from '@/lib/types';

interface FinalStepProps {
  selectedRole: UserRole;
}

const FinalStep: React.FC<FinalStepProps> = ({ selectedRole }) => {
  return (
    <div className="text-center space-y-6 animate-fadeIn">
      <div className="flex justify-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>
      
      <div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2 font-poppins">
          Ready to Create Your Account
        </h3>
        <p className="text-gray-600 font-poppins">
          You're all set to join Pak Bazaar Connect as a {selectedRole}
        </p>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-800 mb-2 font-poppins">What happens next?</h4>
        <ul className="text-sm text-green-700 space-y-1 font-poppins">
          {selectedRole === 'wholesaler' ? (
            <>
              <li>• Your account will be created instantly</li>
              <li>• You can immediately start setting up your shop</li>
              <li>• Begin listing products and creating ads</li>
              <li>• Connect with retailers across Pakistan</li>
            </>
          ) : (
            <>
              <li>• Your account will be created instantly</li>
              <li>• Browse thousands of wholesale products</li>
              <li>• Place orders directly with wholesalers</li>
              <li>• Track your orders in real-time</li>
            </>
          )}
        </ul>
      </div>

      <div className="flex items-center justify-center text-pakistani_green-600 font-poppins">
        <ArrowRight className="w-4 h-4 mr-2" />
        <span>Click "Create Account" to continue</span>
      </div>
    </div>
  );
};

export default FinalStep;
