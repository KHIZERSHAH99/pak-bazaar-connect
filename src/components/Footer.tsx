
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex flex-col items-start">
              <div className="flex items-center">
                <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
                  <span className="text-white text-xl font-bold">PBC</span>
                </div>
                <span className="text-xl font-bold text-pakistani_green-800 ml-2">Pak Bazaar Connect</span>
              </div>
              <p className="mt-4 text-sm text-gray-600">Pakistan's premier B2B marketplace connecting wholesalers and sellers.</p>
            </Link>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 hover:text-pakistani_green-700">Home</Link></li>
              <li><Link to="/login" className="text-gray-600 hover:text-pakistani_green-700">Login</Link></li>
              <li><Link to="/signup" className="text-gray-600 hover:text-pakistani_green-700">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-pakistani_green-700">Help Center</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pakistani_green-700">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pakistani_green-700">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600">Email: info@pakbazaar.com</li>
              <li className="text-gray-600">Phone: +92 300 1234567</li>
              <li className="text-gray-600">Address: Islamabad, Pakistan</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 text-sm">&copy; 2024 Pak Bazaar Connect. All rights reserved.</p>
          <p className="text-gray-600 text-sm mt-4 md:mt-0">Build Successful, API Keys Secured</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
