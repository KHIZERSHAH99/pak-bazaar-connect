
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToastNotificationProps {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  duration?: number;
  onClose?: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({
  id,
  title,
  description,
  variant = 'default',
  onClose
}) => {
  const icons = {
    default: Info,
    success: CheckCircle,
    warning: AlertCircle,
    error: AlertCircle,
    info: Info
  };

  const colors = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  const iconColors = {
    default: 'text-gray-400',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    info: 'text-blue-500'
  };

  const Icon = icons[variant];

  return (
    <div
      className={cn(
        "flex items-start p-4 border rounded-lg shadow-lg max-w-md w-full animate-fadeIn",
        colors[variant]
      )}
    >
      <Icon className={cn("h-5 w-5 mt-0.5 mr-3 flex-shrink-0", iconColors[variant])} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <p className="font-semibold text-sm font-poppins mb-1">
            {title}
          </p>
        )}
        {description && (
          <p className="text-sm font-poppins opacity-90">
            {description}
          </p>
        )}
      </div>
      
      {onClose && (
        <button
          onClick={onClose}
          className="ml-3 flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// Hook for enhanced toast notifications
export const useEnhancedToast = () => {
  const { toast } = useToast();

  const showToast = (options: {
    title?: string;
    description?: string;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    duration?: number;
  }) => {
    toast({
      title: options.title,
      description: options.description,
      variant: options.variant === 'error' ? 'destructive' : 'default',
      duration: options.duration || 3000,
    });
  };

  const success = (title: string, description?: string) => {
    showToast({ title, description, variant: 'success' });
  };

  const error = (title: string, description?: string) => {
    showToast({ title, description, variant: 'error' });
  };

  const warning = (title: string, description?: string) => {
    showToast({ title, description, variant: 'warning' });
  };

  const info = (title: string, description?: string) => {
    showToast({ title, description, variant: 'info' });
  };

  return {
    toast: showToast,
    success,
    error,
    warning,
    info
  };
};

export default ToastNotification;
