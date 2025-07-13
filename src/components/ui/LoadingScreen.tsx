
import React from 'react';
import SafeLoadingSpinner from './SafeLoadingSpinner';

interface LoadingScreenProps {
  text?: string;
  onTimeout?: () => void;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  text = "Loading...", 
  onTimeout 
}) => {
  const handleTimeout = () => {
    console.warn('Loading screen timed out');
    onTimeout?.();
    // Force a page reload if loading takes too long
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <SafeLoadingSpinner 
        size="lg" 
        text={text} 
        timeout={20000} // 20 second timeout for full page loads
        onTimeout={handleTimeout}
      />
    </div>
  );
};

export default LoadingScreen;
