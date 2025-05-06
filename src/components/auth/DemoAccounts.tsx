
import React from 'react';

const DemoAccounts: React.FC = () => {
  return (
    <div className="mt-8 text-center text-sm text-gray-500">
      <p>Demo Accounts:</p>
      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <p className="font-semibold">Admin</p>
          <p>admin@test.com</p>
          <p className="text-gray-400">password</p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <p className="font-semibold">Wholesaler</p>
          <p>wholesaler1@test.com</p>
          <p className="text-gray-400">password</p>
        </div>
        <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
          <p className="font-semibold">Seller</p>
          <p>seller1@test.com</p>
          <p className="text-gray-400">password</p>
        </div>
      </div>
    </div>
  );
};

export default DemoAccounts;
