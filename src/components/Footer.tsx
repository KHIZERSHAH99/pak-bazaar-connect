import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowUp, Mail, Phone, MapPin, Facebook } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, language } = useLanguage();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-card border-t border-border mt-8 sm:mt-12 md:mt-16">
      <div className="max-w-7xl mx-auto py-8 sm:py-10 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-primary rounded-xl p-2 shadow-md">
                <span className="text-primary-foreground text-lg font-bold">PBC</span>
              </div>
              <span className="ml-3 text-xl font-bold text-foreground font-poppins">
                Pak Bazaar Connect
              </span>
            </div>
            <p className="text-muted-foreground text-sm font-poppins max-w-md mb-6">
              Pakistan's leading B2B marketplace connecting wholesalers and sellers. 
              Trade with confidence on our secure platform.
            </p>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:info@pakbazaarconnect.store" className="text-sm text-muted-foreground hover:text-primary transition-colors font-poppins">
                  info@pakbazaarconnect.store
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                <a className="text-sm text-muted-foreground hover:text-primary transition-colors font-poppins" href="">
                  ​+92XXXXXXXXX
                </a>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground font-poppins">
                  Mardan, Pakistan
                </span>
              </div>
            </div>

            {/* Social Media Buttons */}
            <div className="flex gap-2">
              <a href="https://www.facebook.com/share/16jNQYcCmK/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" aria-label="Facebook" className="hover:bg-primary/10">
                  <Facebook className="w-4 h-4" />
                </Button>
              </a>
              <a href="https://wa.me/923149388513" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" aria-label="WhatsApp" className="hover:bg-primary/10">
                  <Phone className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase font-poppins mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/products" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    Browse Products
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/shops" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    Find Wholesalers
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/features" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    Features
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/about" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    About Us
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    Dashboard
                  </Link>
                </Button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-wider uppercase font-poppins mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    Privacy Policy
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    Terms of Service
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    Refund Policy
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant="ghost" size="sm" className="h-auto p-0 font-normal justify-start" asChild>
                  <Link to="/shipping-policy" className="text-sm text-muted-foreground hover:text-primary font-poppins transition-colors">
                    Shipping Policy
                  </Link>
                </Button>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-center text-sm text-muted-foreground font-poppins">
            © {new Date().getFullYear()} Pak Bazaar Connect. Trusted marketplace with secure API infrastructure.
          </p>
          
          {/* Back to Top Button */}
          <Button variant="outline" size="sm" onClick={scrollToTop} className="flex items-center gap-2 hover:bg-primary/10">
            <ArrowUp className="w-4 h-4" />
            Back to Top
          </Button>
        </div>
      </div>
    </footer>);

};

export default Footer;