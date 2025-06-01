
import React from 'react';
import { Card } from '@/components/ui/card';
import { User, Calendar } from 'lucide-react';

interface AccountInfoProps {
  email?: string;
  createdAt?: string;
}

const AccountInfo: React.FC<AccountInfoProps> = ({ email, createdAt }) => {
  return (
    <Card className="mb-8 overflow-hidden border-none shadow-md hover:shadow-lg transition-all duration-300">
      <div className="bg-gradient-to-r from-pakistani_green-700 to-pakistani_green-600 p-4 md:p-6 text-white">
        <h2 className="text-lg md:text-xl font-semibold mb-2 font-poppins">Account Information</h2>
        <p className="text-white/80 text-sm font-poppins">Your personal account details</p>
      </div>
      
      <div className="p-4 md:p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-pakistani_green-100 p-2 rounded-full">
              <User className="h-5 w-5 text-pakistani_green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-poppins">Email Address</p>
              <p className="text-gray-800 font-medium font-poppins break-all">{email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-pakistani_green-100 p-2 rounded-full">
              <Calendar className="h-5 w-5 text-pakistani_green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-poppins">Member Since</p>
              <p className="text-gray-800 font-medium font-poppins">
                {createdAt ? new Date(createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default AccountInfo;
