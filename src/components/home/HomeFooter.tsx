import React from 'react';
import { Shield } from 'lucide-react';

const HomeFooter: React.FC = () => {
  return (
    <footer className="bg-pakistani_green-800 dark:bg-pakistani_green-900 text-white py-8 px-3 md:px-6">
      <div className="container mx-auto text-center">
        <div className="flex justify-center items-center mb-4">
          <div className="bg-pakistani_green-700 dark:bg-pakistani_green-800 rounded-xl p-2 shadow-md mr-2 md:mr-3">
            <span className="text-white text-lg font-bold">PBC</span>
          </div>
          <span className="text-lg md:text-xl font-bold font-poppins">Pak Bazaar Connect</span>
        </div>
        <p className="text-pakistani_green-200 dark:text-pakistani_green-300 mb-2 md:mb-4 font-poppins">
          Connecting Pakistani businesses for sustainable growth
        </p>
        <div className="flex justify-center items-center space-x-2 md:space-x-4 text-xs md:text-sm">
          <span className="flex items-center font-poppins">
            <Shield className="h-4 w-4 mr-1" aria-hidden="true" />
            Build Successful, API Keys Secured
          </span>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
