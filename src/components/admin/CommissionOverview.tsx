
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, CheckCircle, TrendingUp } from 'lucide-react';

interface CommissionSummary {
  total_pending: number;
  total_paid: number;
  total_amount: number;
}

interface CommissionOverviewProps {
  summary: CommissionSummary;
}

const CommissionOverview: React.FC<CommissionOverviewProps> = ({ summary }) => {
  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
  };

  const pendingPercentage = summary.total_amount > 0 
    ? (summary.total_pending / summary.total_amount) * 100 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 font-poppins">
            Total Commission
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-800 font-poppins">
            {formatCurrency(summary.total_amount)}
          </div>
          <p className="text-xs text-green-600 font-poppins">
            All time platform earnings
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700 font-poppins">
            Pending Commission
          </CardTitle>
          <Clock className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-800 font-poppins">
            {formatCurrency(summary.total_pending)}
          </div>
          <p className="text-xs text-yellow-600 font-poppins">
            {pendingPercentage.toFixed(1)}% of total
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 font-poppins">
            Paid Commission
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-800 font-poppins">
            {formatCurrency(summary.total_paid)}
          </div>
          <p className="text-xs text-blue-600 font-poppins">
            Successfully processed
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 font-poppins">
            Commission Rate
          </CardTitle>
          <DollarSign className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-800 font-poppins">
            5.0%
          </div>
          <p className="text-xs text-purple-600 font-poppins">
            Platform standard rate
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionOverview;
