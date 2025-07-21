import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface GlobalErrorHandlerProps {
  error?: Error | null;
  resetError?: () => void;
  children: React.ReactNode;
}

class GlobalErrorBoundary extends React.Component<
  GlobalErrorHandlerProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: GlobalErrorHandlerProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-red-200 rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h2 className="text-lg font-semibold text-red-800">
                Something went wrong
              </h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              We apologize for the inconvenience. The application encountered an unexpected error.
            </p>
            
            {this.state.error && (
              <details className="mb-4 p-3 bg-gray-50 rounded border">
                <summary className="text-sm text-gray-700 cursor-pointer">
                  Error Details
                </summary>
                <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Reload Page
              </Button>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="flex-1"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;