
import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

const LoginHeader: React.FC = () => {
  return (
    <CardHeader className="bg-pakistani_green-700 dark:bg-gray-900 text-white text-center pb-6">
      <div className="flex justify-center mb-4">
        <div className="bg-white/10 p-3 rounded-full backdrop-blur-sm">
          <LogIn className="h-8 w-8 text-white" />
        </div>
      </div>
      <CardTitle className="text-2xl font-bold text-white dark:text-gray-50">Welcome Back</CardTitle>
      <CardDescription className="text-green-50 dark:text-gray-300">Log in to your account</CardDescription>
    </CardHeader>
  );
};

export default LoginHeader;
