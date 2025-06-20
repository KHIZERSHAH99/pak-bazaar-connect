
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 text-center min-h-[60vh] flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-6 font-poppins">404</h1>
          <h2 className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4 font-poppins">Page Not Found</h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 font-poppins">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button className="bg-green-600 hover:bg-green-700 text-white font-poppins w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Go Back Home
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              className="font-poppins w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
