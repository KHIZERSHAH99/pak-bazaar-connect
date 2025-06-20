
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { ShoppingCart, DollarSign, Clock, AlertTriangle } from 'lucide-react';

interface AdMetricsProps {
  currentSpend: number;
  budgetCap: number;
  totalOrders: number;
  remainingDays: number | null;
  isAutoStopped: boolean;
}

const AdMetrics: React.FC<AdMetricsProps> = ({
  currentSpend,
  budgetCap,
  totalOrders,
  remainingDays,
  isAutoStopped
}) => {
  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`;
  };

  const getBudgetProgress = () => {
    if (budgetCap <= 0) return 0;
    return (currentSpend / budgetCap) * 100;
  };

  const getCostPerOrder = () => {
    if (totalOrders === 0) return 0;
    return currentSpend / totalOrders;
  };

  const budgetProgress = getBudgetProgress();
  const costPerOrder = getCostPerOrder();

  return (
    <div className="space-y-4">
      {/* Budget Progress */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Budget Used</span>
          <span className="text-sm text-gray-600">
            {formatCurrency(currentSpend)} / {formatCurrency(budgetCap)}
          </span>
        </div>
        <Progress value={budgetProgress} className="h-2" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ShoppingCart className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Orders</span>
          </div>
          <div className="text-lg font-bold text-blue-600">{totalOrders}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">CPO</span>
          </div>
          <div className="text-lg font-bold text-green-600">
            {costPerOrder > 0 ? formatCurrency(costPerOrder) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Time Remaining */}
      {remainingDays !== null && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            {remainingDays === 0 ? 'Campaign ended' : `${remainingDays} days remaining`}
          </span>
        </div>
      )}

      {/* Auto Stop Warning */}
      {(budgetProgress > 80 || (remainingDays !== null && remainingDays <= 2)) && !isAutoStopped && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            {budgetProgress > 80 ? 'Budget nearly exhausted' : 'Campaign ending soon'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AdMetrics;
