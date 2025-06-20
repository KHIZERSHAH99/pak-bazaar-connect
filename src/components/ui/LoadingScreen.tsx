
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-pakistani_green-200 border-t-pakistani_green-600 mb-4"></div>
          <h2 className="text-lg font-semibold text-foreground mb-2 font-poppins">
            Pak Bazaar Connect
          </h2>
          <p className="text-sm text-muted-foreground text-center font-poppins">
            {message}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoadingScreen;
