
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-10 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center md:flex-row md:justify-between md:items-start md:text-left">
          <div className="mb-8 md:mb-0">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-2xl font-bold text-primary tracking-tight">PBC</span>
              <span className="text-xs font-light text-gray-600 -mt-1">Pak Bazaar Connect</span>
            </div>
            <p className="text-gray-600 max-w-md mt-4">
              Connecting wholesalers and sellers across Pakistan to streamline B2B commerce.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-end gap-x-12 gap-y-6">
            <Link to="/" className="text-gray-600 hover:text-primary transition-colors">Home</Link>
            <Link to="#" className="text-gray-600 hover:text-primary transition-colors">About</Link>
            <Link to="#" className="text-gray-600 hover:text-primary transition-colors">Contact</Link>
            <Link to="#" className="text-gray-600 hover:text-primary transition-colors">Terms</Link>
            <Link to="#" className="text-gray-600 hover:text-primary transition-colors">Privacy</Link>
            <Link to="#" className="text-gray-600 hover:text-primary transition-colors">FAQ</Link>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6 text-center">
          <p className="text-gray-600 text-sm">
            Build Successful, API Keys Secured | © {new Date().getFullYear()} Pak Bazaar Connect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
