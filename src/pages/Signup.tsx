import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import EnhancedSignupForm from '@/components/auth/EnhancedSignupForm';
import { Flag } from 'lucide-react';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 flex flex-col">
      {/* Top Banner */}
      <div className="bg-pakistani_green-700 text-white py-2 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5">
          <Flag className="w-40 h-40 text-white" />
        </div>
        <p className="font-medium text-sm md:text-base font-poppins">Join Now! Free Ads for First 10 Wholesalers!</p>
      </div>

      <div className="container mx-auto flex-grow py-8 md:py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-pakistani_green-800 font-poppins">Join Pakistan's Leading B2B Marketplace</h1>
          <p className="text-gray-600 mt-2 font-poppins text-sm md:text-base">Connect with trusted buyers and suppliers across Pakistan</p>
        </div>
        
        <EnhancedSignupForm />
        
        <div className="mt-8 max-w-2xl mx-auto">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-gray-800 mb-2 flex items-center font-poppins">
              <div className="w-4 h-4 bg-pakistani_green-700 rounded-full mr-2"></div>
              Trusted by Businesses Across Pakistan
            </h3>
            <p className="text-sm md:text-base text-gray-600 font-poppins">
              Pak Bazaar Connect verifies all businesses to ensure a safe and reliable platform. 
              Join thousands of verified Pakistani businesses already growing their reach.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-pakistani_green-800 text-white py-4 px-6">
        <div className="container mx-auto text-center text-sm font-poppins">
          <p>Build Successful, API Keys Secured</p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
