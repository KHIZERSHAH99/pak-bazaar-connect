
import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  handleRefresh = () => {
    window.location.reload();
  };
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md mx-auto bg-card border border-destructive/20 rounded-lg p-8 shadow-lg text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-destructive text-xl font-bold mb-4 font-poppins">
              Something went wrong
            </h2>
            <p className="mb-6 text-sm text-muted-foreground font-poppins">
              We apologize for the inconvenience. An unexpected error occurred.
            </p>
            <Button 
              onClick={this.handleRefresh}
              className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <details className="mt-4 text-xs text-muted-foreground">
              <summary className="cursor-pointer">Technical Details</summary>
              <div className="mt-2 p-2 bg-muted rounded text-left break-all">
                {this.state.error?.toString()}
              </div>
            </details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
