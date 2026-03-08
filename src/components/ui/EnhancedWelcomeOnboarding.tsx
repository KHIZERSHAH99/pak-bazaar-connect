
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ShoppingCart, 
  Store, 
  Users, 
  MessageCircle, 
  TrendingUp,
  ArrowRight,
  X,
  Gift,
  Star,
  Zap
} from 'lucide-react';
import { UserRole } from '@/lib/types';

interface EnhancedWelcomeOnboardingProps {
  userRole: UserRole;
  onComplete: () => void;
  onSkip: () => void;
}

const EnhancedWelcomeOnboarding: React.FC<EnhancedWelcomeOnboardingProps> = ({
  userRole,
  onComplete,
  onSkip
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const getStepsForRole = () => {
    if (userRole === 'wholesaler') {
      return [
        {
          icon: <Store className="h-12 w-12 text-primary" />,
          title: 'Welcome to Pak Bazaar Connect!',
          subtitle: 'Your B2B Success Starts Here',
          description: 'Join thousands of successful wholesalers who are growing their business with our platform. Get ready to expand your reach across Pakistan!',
          action: 'Get Started',
          link: '/dashboard',
          highlight: 'Free for First 10 Wholesalers!',
          benefits: [
            'Reach buyers nationwide',
            'Manage orders efficiently',
            'Track sales analytics',
            'Secure payment processing'
          ]
        },
        {
          icon: <ShoppingCart className="h-12 w-12 text-blue-600" />,
          title: 'Set Up Your Digital Shop',
          subtitle: 'Create Your Online Presence',
          description: 'Create your professional shop profile with contact details, address, and logo to attract more customers.',
          action: 'Create Shop',
          link: '/dashboard/shops',
          benefits: [
            'Professional shop profile',
            'Upload your business logo',
            'Display contact information',
            'Build customer trust'
          ]
        },
        {
          icon: <TrendingUp className="h-12 w-12 text-green-600" />,
          title: 'List Your Products',
          subtitle: 'Showcase Your Inventory',
          description: 'Add your wholesale products with competitive pricing, MOQ, and detailed descriptions to attract buyers.',
          action: 'Add Products',
          link: '/dashboard/products',
          benefits: [
            'Upload product images',
            'Set competitive prices',
            'Define minimum quantities',
            'Detailed descriptions'
          ]
        },
        {
          icon: <Gift className="h-12 w-12 text-purple-600" />,
          title: 'Manage Orders',
          subtitle: 'Track Your Business',
          description: 'Efficiently manage incoming orders, track deliveries, and grow your wholesale business.',
          action: 'View Orders',
          link: '/dashboard/wholesaler-orders',
          benefits: [
            'Track all orders',
            'Update order status',
            'Communicate with buyers',
            'Monitor your sales'
          ]
        }
      ];
    } else if (userRole === 'seller') {
      return [
        {
          icon: <Users className="h-12 w-12 text-primary" />,
          title: 'Welcome to Your Marketplace!',
          subtitle: 'Discover Quality Wholesale Products',
          description: 'Connect with verified wholesalers across Pakistan and access thousands of quality products at wholesale prices.',
          action: 'Start Shopping',
          link: '/dashboard/browse-shops',
          highlight: 'Verified Wholesalers Only!',
          benefits: [
            'Browse verified suppliers',
            'Wholesale pricing',
            'Secure transactions',
            'Fast delivery'
          ]
        },
        {
          icon: <ShoppingCart className="h-12 w-12 text-blue-600" />,
          title: 'Explore Products',
          subtitle: 'Find What You Need',
          description: 'Browse through our extensive catalog of wholesale products from trusted suppliers across Pakistan.',
          action: 'Browse Products',
          link: '/products',
          benefits: [
            'Thousands of products',
            'Competitive wholesale rates',
            'Filter by category',
            'Compare suppliers'
          ]
        },
        {
          icon: <MessageCircle className="h-12 w-12 text-green-600" />,
          title: 'Connect & Order',
          subtitle: 'Build Business Relationships',
          description: 'Communicate directly with wholesalers, negotiate prices, and place orders with confidence.',
          action: 'Start Ordering',
          link: '/dashboard/seller-orders',
          benefits: [
            'Direct communication',
            'Secure order placement',
            'Track order status',
            'Payment protection'
          ]
        }
      ];
    }
    return [];
  };

  const steps = getStepsForRole();
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleAction = () => {
    if (currentStepData.link) {
      // Mark tutorial as completed
      localStorage.setItem('tutorial_completed', 'true');
      navigate(currentStepData.link);
      onComplete();
    } else {
      handleNext();
    }
  };

  const handleSkip = () => {
    // Mark tutorial as completed when skipped
    localStorage.setItem('tutorial_completed', 'true');
    onSkip();
  };

  const handleComplete = () => {
    // Mark tutorial as completed
    localStorage.setItem('tutorial_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl border-0 overflow-hidden">
        {/* Header with Progress */}
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-6 relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 font-poppins">
              {userRole === 'wholesaler' ? 'Wholesaler' : 'Seller'} Journey
            </Badge>
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 font-poppins">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          <Progress value={progress} className="h-2 bg-primary-foreground/20" />
          
          {currentStepData.highlight && (
            <div className="mt-4 bg-yellow-400 text-yellow-900 px-4 py-2 rounded-full text-center font-semibold animate-pulse">
              🎉 {currentStepData.highlight}
            </div>
          )}
        </div>

        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-muted to-muted/80 p-6 rounded-full shadow-lg">
                {currentStepData.icon}
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2 font-poppins">
              {currentStepData.title}
            </h2>
            
            <p className="text-lg text-primary font-semibold mb-4 font-poppins">
              {currentStepData.subtitle}
            </p>
            
            <p className="text-muted-foreground mb-6 font-poppins leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Benefits List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            {currentStepData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="bg-green-100 dark:bg-green-800/50 p-1 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 font-poppins">
                  {benefit}
                </span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              variant="outline"
              onClick={handleSkip}
              className="flex-1 font-poppins"
            >
              Skip Tour
            </Button>
            
            <Button
              onClick={handleAction}
              className="flex-1 bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 text-white font-poppins shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {currentStepData.action}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index <= currentStep 
                    ? 'bg-pakistani_green-600 shadow-md' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Progress Text */}
          <div className="text-center mt-4">
            <p className="text-sm text-gray-500 font-poppins">
              {currentStep === steps.length - 1 ? 
                'Ready to get started?' : 
                `${steps.length - currentStep - 1} more steps to complete`
              }
            </p>
          </div>

          {/* Complete Button for last step */}
          {currentStep === steps.length - 1 && (
            <div className="mt-6 text-center">
              <Button
                onClick={handleComplete}
                variant="ghost"
                className="font-poppins"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Tour
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedWelcomeOnboarding;
