
import React from 'react';
import { Shield } from 'lucide-react';

const TermsNotice: React.FC = () => {
  return (
    <div className="p-4 bg-primary/5 border border-primary/20 rounded-md">
      <div className="flex items-center">
        <div className="h-5 w-5 bg-primary rounded-full flex items-center justify-center text-primary-foreground mr-2">
          <Shield className="h-3 w-3" />
        </div>
        <p className="text-sm text-foreground/80 font-poppins">
          By clicking "Complete Registration", you agree to our Terms of Service and Privacy Policy. 
          Your data will be securely stored and verified by our team.
        </p>
      </div>
    </div>
  );
};

export default TermsNotice;
