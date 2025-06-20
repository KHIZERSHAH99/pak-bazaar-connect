
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface NotFoundProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showHomeButton?: boolean;
  showSearchButton?: boolean;
}

const NotFound: React.FC<NotFoundProps> = ({
  title,
  description,
  showBackButton = true,
  showHomeButton = true,
  showSearchButton = false
}) => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="text-6xl font-bold text-pakistani_green-600 dark:text-pakistani_green-400 mb-4">
            404
          </div>
          <CardTitle className="font-poppins">
            {title || t('page_not_found') || 'Page Not Found'}
          </CardTitle>
          <CardDescription className="font-poppins">
            {description || t('page_not_found_description') || "The page you're looking for doesn't exist or has been moved."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3">
            {showHomeButton && (
              <Link to="/">
                <Button className="w-full font-poppins">
                  <Home className="h-4 w-4 mr-2" />
                  {t('go_home') || 'Go Home'}
                </Button>
              </Link>
            )}
            
            {showBackButton && (
              <Button 
                onClick={() => window.history.back()} 
                variant="outline" 
                className="w-full font-poppins"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('go_back') || 'Go Back'}
              </Button>
            )}
            
            {showSearchButton && (
              <Link to="/products">
                <Button variant="ghost" className="w-full font-poppins">
                  <Search className="h-4 w-4 mr-2" />
                  {t('browse_products') || 'Browse Products'}
                </Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
