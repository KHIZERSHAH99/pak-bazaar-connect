
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
        aria-label="Go to home"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={`${item.label}-${index}`}>
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors font-poppins"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium font-poppins">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
