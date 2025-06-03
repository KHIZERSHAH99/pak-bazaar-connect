
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getUserTransactions, getCommissionRates } from '@/lib/payment';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Filter,
  Download
} from 'lucide-react';

interface CommissionData {
  total_earned: number;
  total_paid: number;
  pending_amount: number;
  transaction_count: number;
  monthly_earnings: number;
}

const CommissionTracker: React.FC = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [commissionData, setCommissionData] = useState<CommissionData>({
    total_earned: 0,
    total_paid: 0,
    pending_amount: 0,
    transaction_count: 0,
    monthly_earnings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadCommissionData();
    }
  }, [user]);

  const loadCommissionData = async () => {
    try {
      setLoading(true);
      
      if (!user) return;
      
      const userTransactions = await getUserTransactions(user.id);
      setTransactions(userTransactions);
      
      // Calculate commission data based on user role
      const isWholesaler = profile?.role === 'wholesaler';
      let totalEarned = 0;
      let totalPaid = 0;
      let pendingAmount = 0;
      let monthlyEarnings = 0;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      userTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.created_at);
        const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                              transactionDate.getFullYear() === currentYear;
        
        if (transaction.status === 'completed') {
          if (isWholesaler && transaction.seller_id === user.id) {
            // Wholesaler earning from sales (minus commission)
            const earning = transaction.amount - transaction.commission_amount;
            totalEarned += earning;
            if (isCurrentMonth) monthlyEarnings += earning;
          } else if (!isWholesaler && transaction.buyer_id === user.id) {
            // Seller's purchases (commission paid)
            totalPaid += transaction.commission_amount;
          }
        } else if (transaction.status === 'pending' || transaction.status === 'processing') {
          if (isWholesaler && transaction.seller_id === user.id) {
            pendingAmount += transaction.amount - transaction.commission_amount;
          }
        }
      });
      
      setCommissionData({
        total_earned: totalEarned,
        total_paid: totalPaid,
        pending_amount: pendingAmount,
        transaction_count: userTransactions.length,
        monthly_earnings: monthlyEarnings
      });
      
    } catch (error) {
      console.error('Error loading commission data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isWholesaler = profile?.role === 'wholesaler';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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

      {/* Commission Rate Info */}
      <Card className="p-6 bg-gradient-to-r from-pakistani_green-50 to-green-50 border-pakistani_green-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-pakistani_green-800 font-poppins">Commission Structure</h3>
            <p className="text-pakistani_green-700 font-poppins">
              Platform commission: <strong>2.5%</strong> per successful transaction
            </p>
            <p className="text-sm text-pakistani_green-600 font-poppins mt-1">
              One of the lowest rates in Pakistan's B2B marketplace industry
            </p>
          </div>
          <div className="text-3xl font-bold text-pakistani_green-700">2.5%</div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 font-poppins">Recent Transactions</h3>
            <Badge variant="outline" className="font-poppins">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Badge>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Commission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-poppins">
                  {isWholesaler ? 'Net Earning' : 'Total Cost'}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 10).map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-poppins">
                    {new Date(transaction.created_at).toLocaleDateString('en-PK')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-poppins">
                    {formatCurrency(transaction.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-poppins">
                    {formatCurrency(transaction.commission_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge className={`${getStatusColor(transaction.status)} font-poppins`}>
                      {transaction.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium font-poppins">
                    {isWholesaler 
                      ? formatCurrency(transaction.amount - transaction.commission_amount)
                      : formatCurrency(transaction.amount + transaction.commission_amount)
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-gray-500 font-poppins">No transactions yet. Start trading to see your commission history!</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CommissionTracker;
