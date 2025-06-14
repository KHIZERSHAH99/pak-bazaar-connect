
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-card border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex flex-col items-start">
              <div className="flex items-center">
                <div className="bg-pakistani_green-700 rounded-xl p-2 shadow-md">
                  <span className="text-white text-xl font-bold">PBC</span>
                </div>
                <span className="text-xl font-bold text-pakistani_green-800 dark:text-pakistani_green-200 ml-2">Pak Bazaar Connect</span>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Pakistan's premier B2B marketplace connecting wholesalers and sellers.</p>
            </Link>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-muted-foreground hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">Home</Link></li>
              <li><Link to="/login" className="text-muted-foreground hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">Login</Link></li>
              <li><Link to="/signup" className="text-muted-foreground hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">Sign Up</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">Help Center</a></li>
              <li><Link to="/privacy-policy" className="text-muted-foreground hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="text-muted-foreground hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="text-muted-foreground hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">Refund Policy</Link></li>
              <li><Link to="/shipping-policy" className="text-muted-foreground hover:text-pakistani_green-700 dark:hover:text-pakistani_green-400">Shipping Policy</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground">Contact</h3>
            <ul className="space-y-2">
              <li className="text-muted-foreground">Email: info@pakbazaar.com</li>
              <li className="text-muted-foreground">Phone: +92 300 1234567</li>
              <li className="text-muted-foreground">Address: Islamabad, Pakistan</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">&copy; 2025 Pak Bazaar Connect. All rights reserved.</p>
          <p className="text-muted-foreground text-sm mt-4 md:mt-0">Build Successful, API Keys Secured</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
