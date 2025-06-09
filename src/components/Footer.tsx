
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex flex-col items-start">
              <div className="flex items-center">
                <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
                  <span className="text-white text-xl font-bold">PBC</span>
                </div>
                <span className="text-xl font-bold text-pakistani_green-800 dark:text-pakistani_green-400 ml-2 font-poppins">
                  Pak Bazaar Connect
                </span>
              </div>
              <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 font-poppins">
                Pakistan's premier B2B marketplace connecting wholesalers and sellers.
              </p>
            </Link>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 font-poppins">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">Home</Link></li>
              <li><Link to="/products" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">Products</Link></li>
              <li><Link to="/sellers" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">Sellers</Link></li>
              <li><Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">Login</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 font-poppins">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy-policy" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">Refund Policy</Link></li>
              <li><Link to="/shipping-policy" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">Shipping Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200 font-poppins">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 dark:text-gray-300 font-poppins">
                <Link to="/contact" className="hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">
                  Office #12, Mardan<br />
                  Khyber Pakhtunkhwa, Pakistan
                </Link>
              </li>
              <li>
                <a href="tel:+923418337167" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">
                  +92 341 833 7167
                </a>
              </li>
              <li>
                <a href="mailto:khizerfight@gmail.com" className="text-gray-600 dark:text-gray-300 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400 font-poppins">
                  khizerfight@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-600 dark:text-gray-300 text-sm font-poppins">
            &copy; 2024 Pak Bazaar Connect. All rights reserved.
          </p>
          <p className="text-gray-600 dark:text-gray-300 text-sm mt-4 md:mt-0 font-poppins">
            Build Successful, API Keys Secured
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
