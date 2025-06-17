import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-card border-t border-border mt-16" dir={language === "ur" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <img className="h-8 w-auto" src="/placeholder.svg" alt="Pak Bazaar Connect" />
              <span className="ml-3 text-xl font-bold text-foreground font-poppins">
                Pak Bazaar Connect
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-poppins max-w-md">
              Pakistan's leading B2B marketplace connecting wholesalers and sellers. 
              Trade with confidence on our secure platform.
            </p>
            <div className="mt-6 space-y-2">
              <p className="text-sm text-muted-foreground font-poppins">
                <strong>Email:</strong> khizercoding.com
              </p>
              <p className="text-sm text-muted-foreground font-poppins">
                <strong>Phone:</strong> +92 3149388513
              </p>
              <p className="text-sm text-muted-foreground font-poppins">
                <strong>Address:</strong> Mardan, Pakistan
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase font-poppins">
              Quick Links
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-foreground font-poppins">
                  Browse Products
                </Link>
              </li>
              <li>
                <Link to="/sellers" className="text-sm text-muted-foreground hover:text-foreground font-poppins">
                  Find Suppliers
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-sm text-muted-foreground hover:text-foreground font-poppins">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground font-poppins">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase font-poppins">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-foreground font-poppins">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-foreground font-poppins">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-foreground font-poppins">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="text-sm text-muted-foreground hover:text-foreground font-poppins">
                  Shipping Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-center text-sm text-muted-foreground font-poppins">
            © 2024 Pak Bazaar Connect. Build Successful, API Keys Secured.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
