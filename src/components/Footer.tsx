
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h3 className="text-lg font-semibold mb-2 text-primary">Pak Bazaar Connect</h3>
            <p className="text-gray-600 max-w-md">
              Connecting wholesalers and sellers across Pakistan to streamline B2B commerce.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-800">PLATFORM</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">How it Works</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3 text-gray-800">COMPANY</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h4 className="text-sm font-semibold mb-3 text-gray-800">LEGAL</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-center text-gray-600 text-sm">
            Build Successful, API Keys Secured | © {new Date().getFullYear()} Pak Bazaar Connect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
