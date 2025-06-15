
import React from "react";

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
    // log error if desired 
    // console.log(error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md mx-auto bg-white border border-red-200 rounded-lg p-8 shadow">
            <h2 className="text-red-600 text-xl font-bold mb-4 font-poppins">Something went wrong</h2>
            <p className="mb-4 text-sm text-red-700 font-poppins">An error occurred in the app. Please refresh, or contact support if the problem persists.</p>
            <details className="text-xs text-red-300 truncate">{this.state.error?.toString()}</details>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
