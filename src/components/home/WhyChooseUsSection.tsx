
import React from 'react';
import { Card } from '@/components/ui/card';
import { Store, ShoppingBag, Shield, CheckCircle } from 'lucide-react';

const featuresData = [
  {
    icon: <Store className="h-8 w-8" />,
    title: 'For Wholesalers',
    description: 'Create shops, list products, and reach retailers across Pakistan',
    color: 'from-blue-500 to-blue-600',
    benefits: ['Unlimited product listings', 'Advanced analytics', 'Promotional ads'],
  },
  {
    icon: <ShoppingBag className="h-8 w-8" />,
    title: 'For Sellers',
    description: 'Source quality products directly from verified wholesalers',
    color: 'from-purple-500 to-purple-600',
    benefits: ['Bulk pricing', 'Quick ordering', 'Inventory management'],
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: 'Secure Trading',
    description: 'End-to-end security with verified businesses and secure payments',
    color: 'from-green-500 to-green-600',
    benefits: ['Business verification', 'Secure payments', 'Dispute resolution'],
  },
];

const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-12 md:py-20 px-4 md:px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 md:mb-4 font-poppins">
            Why Choose Pak Bazaar Connect?
          </h2>
          <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto font-poppins px-2">
            Designed specifically for Pakistani businesses with local payment methods and regional expertise
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {featuresData.map((feature, index) => (
            <Card key={index} className="p-6 md:p-8 border border-border shadow-xl hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 bg-card">
              <div className={`bg-gradient-to-r ${feature.color} p-4 rounded-2xl w-16 h-16 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <div className="text-white">{feature.icon}</div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-3 font-poppins">{feature.title}</h3>
              <p className="text-muted-foreground mb-6 font-poppins leading-relaxed">{feature.description}</p>
              
              <ul className="space-y-3">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center text-sm text-foreground font-poppins">
                    <CheckCircle className="h-4 w-4 text-primary mr-3 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
