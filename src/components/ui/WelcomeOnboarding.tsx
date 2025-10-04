
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  ShoppingCart, 
  Store, 
  Users, 
  MessageCircle, 
  TrendingUp,
  ArrowRight,
  X
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface WelcomeOnboardingProps {
  userRole: UserRole;
  onComplete: () => void;
  onSkip: () => void;
}

const WelcomeOnboarding: React.FC<WelcomeOnboardingProps> = ({
  userRole,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const getStepsForRole = () => {
    if (userRole === 'wholesaler') {
      return [
        {
          icon: <Store className="h-8 w-8 text-pakistani_green-600" />,
          title: 'Create Your Shop',
          description: 'Set up your wholesale business profile and showcase your products to retailers across Pakistan.',
          action: 'Go to Shops',
          link: '/dashboard/shops'
        },
        {
          icon: <ShoppingCart className="h-8 w-8 text-blue-600" />,
          title: 'Add Products',
          description: 'List your wholesale products with competitive pricing, MOQ, and detailed descriptions.',
          action: 'Add Products',
          link: '/dashboard/products'
        },
        {
          icon: <TrendingUp className="h-8 w-8 text-green-600" />,
          title: 'Manage Orders',
          description: 'Track and manage your orders efficiently from your dashboard.',
          action: 'View Orders',
          link: '/dashboard/wholesaler-orders'
        }
      ];
    } else if (userRole === 'seller') {
      return [
        {
          icon: <Users className="h-8 w-8 text-pakistani_green-600" />,
          title: 'Browse Suppliers',
          description: 'Discover verified wholesalers and explore their product catalogs.',
          action: 'Browse Shops',
          link: '/dashboard/browse-shops'
        },
        {
          icon: <ShoppingCart className="h-8 w-8 text-blue-600" />,
          title: 'Place Orders',
          description: 'Order products directly from wholesalers with secure payment methods.',
          action: 'View Products',
          link: '/products'
        },
        {
          icon: <MessageCircle className="h-8 w-8 text-green-600" />,
          title: 'Communicate',
          description: 'Chat with suppliers, negotiate prices, and track your order status.',
          action: 'Check Orders',
          link: '/dashboard/orders'
        }
      ];
    }
    return [];
  };

  const steps = getStepsForRole();
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleAction = () => {
    window.location.href = currentStepData.link;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="text-center relative">
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
          
          <div className="mb-4">
            {currentStepData.icon}
          </div>
          
          <CardTitle className="text-xl font-bold text-gray-900 font-poppins">
            Welcome to Pak Bazaar Connect!
          </CardTitle>
          
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="font-poppins">
              {userRole === 'wholesaler' ? 'Wholesaler' : 'Seller'}
            </Badge>
            <Badge variant="secondary" className="font-poppins">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 font-poppins">
              {currentStepData.title}
            </h3>
            <p className="text-gray-600 font-poppins">
              {currentStepData.description}
            </p>
          </div>
          
          <div className="flex justify-center">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? 'bg-pakistani_green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onSkip}
              className="flex-1 font-poppins"
            >
              Skip Tour
            </Button>
            
            <Button
              onClick={handleAction}
              className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
            >
              {currentStepData.action}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
          
          {currentStep < steps.length - 1 && (
            <Button
              onClick={handleNext}
              variant="ghost"
              className="w-full font-poppins"
            >
              Next Step
            </Button>
          )}
          
          {currentStep === steps.length - 1 && (
            <Button
              onClick={onComplete}
              variant="ghost"
              className="w-full font-poppins"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Tour
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WelcomeOnboarding;
