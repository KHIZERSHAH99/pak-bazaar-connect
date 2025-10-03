
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TestTube } from 'lucide-react';

const BackendTestButton: React.FC = () => {
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    console.log('Backend tests deprecated - commission functionality removed');
    setTesting(false);
  };

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <Button
      onClick={handleTest}
      disabled={testing}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <TestTube className="h-4 w-4" />
      {testing ? 'Testing...' : 'Test Backend (Deprecated)'}
    </Button>
  );
};

export default BackendTestButton;
