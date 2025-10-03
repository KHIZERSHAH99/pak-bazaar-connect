
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Globe, TrendingUp, Heart } from 'lucide-react';

const statsData = [
  { number: '10,000+', label: 'Active Businesses', icon: <Users className="h-5 w-5" aria-hidden="true" /> },
  { number: '500+', label: 'Cities Covered', icon: <Globe className="h-5 w-5" aria-hidden="true" /> },
  { number: '0%', label: 'Platform Fee', icon: <TrendingUp className="h-5 w-5" aria-hidden="true" /> },
  { number: '24/7', label: 'Support', icon: <Heart className="h-5 w-5" aria-hidden="true" /> },
];

const StatsDisplay: React.FC = () => {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto animate-fade-in"
      aria-label="Business statistics"
    >
      {statsData.map((stat, index) => (
        <Card
          key={index}
          className="p-5 md:p-6 bg-card/80 backdrop-blur-sm border-border shadow-xl hover:shadow-2xl transition-all duration-300 group focus-within:ring-2 focus-within:ring-pakistani_green-300"
          tabIndex={0}
          aria-label={stat.label}
        >
          <div className="flex items-center justify-center mb-2 md:mb-3">
            <div className="bg-primary/10 p-2 md:p-3 rounded-full group-hover:scale-110 transition-transform">
              <div className="text-primary">{stat.icon}</div>
            </div>
          </div>
          <div className="text-xl xs:text-2xl md:text-3xl font-bold text-foreground mb-1 font-poppins">{stat.number}</div>
          <div className="text-muted-foreground font-poppins text-xs md:text-sm">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
};

export default StatsDisplay;
