
import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, Calendar, Filter } from 'lucide-react';

interface CommissionData {
  total_earned: number;
  total_paid: number;
  pending_amount: number;
  transaction_count: number;
  monthly_earnings: number;
}

interface SummaryCardsProps {
  commissionData: CommissionData;
  isWholesaler: boolean;
  formatCurrency: (amount: number) => string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ commissionData, isWholesaler, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-green-600 font-poppins">
              {isWholesaler ? 'Total Earned' : 'Total Spent'}
            </p>
            <p className="text-2xl font-bold text-green-700 font-poppins">
              {formatCurrency(isWholesaler ? commissionData.total_earned : commissionData.total_paid)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600 font-poppins">
              {isWholesaler ? 'Pending Earnings' : 'Commission Paid'}
            </p>
            <p className="text-2xl font-bold text-blue-700 font-poppins">
              {formatCurrency(isWholesaler ? commissionData.pending_amount : commissionData.total_paid)}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-blue-600" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-600 font-poppins">This Month</p>
            <p className="text-2xl font-bold text-purple-700 font-poppins">
              {formatCurrency(commissionData.monthly_earnings)}
            </p>
          </div>
          <Calendar className="h-8 w-8 text-purple-600" />
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-orange-600 font-poppins">Total Transactions</p>
            <p className="text-2xl font-bold text-orange-700 font-poppins">
              {commissionData.transaction_count}
            </p>
          </div>
          <Filter className="h-8 w-8 text-orange-600" />
        </div>
      </Card>
    </div>
  );
};

export default SummaryCards;
