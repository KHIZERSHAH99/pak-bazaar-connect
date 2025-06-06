
import React from 'react';

const CompletionStep: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 font-poppins">Complete Your Registration</h3>
        <p className="text-gray-600 font-poppins">Review your information and create your wholesaler account</p>
      </div>

      <div className="bg-gradient-to-r from-pakistani_green-50 to-green-50 p-6 rounded-lg border border-pakistani_green-200">
        <h4 className="font-semibold text-pakistani_green-800 mb-3 font-poppins">What happens next?</h4>
        <ul className="space-y-2 text-sm text-pakistani_green-700 font-poppins">
          <li className="flex items-center">
            <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-3"></div>
            Your account will be created immediately
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-3"></div>
            You can start using basic features right away
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-3"></div>
            Complete business verification for full access
          </li>
          <li className="flex items-center">
            <div className="w-2 h-2 bg-pakistani_green-500 rounded-full mr-3"></div>
            Start creating shops and listing products
          </li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800 font-poppins">
          <strong>Commission Structure:</strong> We charge a low 2.5% commission on successful sales to maintain and improve the platform.
        </p>
      </div>
    </div>
  );
};

export default CompletionStep;
