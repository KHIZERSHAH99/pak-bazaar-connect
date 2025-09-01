import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn } from 'lucide-react';

const LoginHeader: React.FC = () => {
  return (
    <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-center pb-8 pt-8 rounded-t-xl">
      <div className="flex justify-center mb-4">
        <div className="bg-primary-foreground/10 p-4 rounded-full backdrop-blur-sm border border-primary-foreground/20 shadow-lg">
          <LogIn className="h-10 w-10 text-primary-foreground" />
        </div>
      </div>
      <CardTitle className="text-3xl font-bold text-primary-foreground font-poppins">
        Welcome Back
      </CardTitle>
      <CardDescription className="text-primary-foreground/90 text-base mt-2 font-poppins">
        Log in to your account to continue
      </CardDescription>
    </CardHeader>
  );
};

export default LoginHeader;