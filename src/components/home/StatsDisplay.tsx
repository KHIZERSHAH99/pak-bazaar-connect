
import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Globe, TrendingUp, Heart } from 'lucide-react';

const statsData = [
  { number: '10,000+', label: 'Active Businesses', icon: <Users className="h-5 w-5" /> },
  { number: '500+', label: 'Cities Covered', icon: <Globe className="h-5 w-5" /> },
  { number: '2.5%', label: 'Low Commission', icon: <TrendingUp className="h-5 w-5" /> },
  { number: '24/7', label: 'Support', icon: <Heart className="h-5 w-5" /> },
];

const StatsDisplay: React.FC = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
      {statsData.map((stat, index) => (
        <Card key={index} className="p-6 bg-white/80 backdrop-blur-sm border-none shadow-xl hover:shadow-2xl transition-all duration-300 group">
          <div className="flex items-center justify-center mb-3">
            <div className="bg-gradient-to-r from-pakistani_green-100 to-green-100 p-3 rounded-full group-hover:scale-110 transition-transform">
              <div className="text-pakistani_green-600">{stat.icon}</div>
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1 font-poppins">{stat.number}</div>
          <div className="text-gray-600 font-poppins text-sm">{stat.label}</div>
        </Card>
      ))}
    </div>
  );
};

export default StatsDisplay;
