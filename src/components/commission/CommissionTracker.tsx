
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { getUserTransactions } from '@/lib/payment';
import { useAuth } from '@/contexts/AuthContextFixed';
import SummaryCards from './SummaryCards';
import TransactionTable from './TransactionTable';

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
            const earning = transaction.amount - transaction.commission_amount;
            totalEarned += earning;
            if (isCurrentMonth) monthlyEarnings += earning;
          } else if (!isWholesaler && transaction.buyer_id === user.id) {
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
      <SummaryCards 
        commissionData={commissionData}
        isWholesaler={isWholesaler}
        formatCurrency={formatCurrency}
      />

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

      <TransactionTable
        transactions={transactions}
        isWholesaler={isWholesaler}
        formatCurrency={formatCurrency}
        getStatusColor={getStatusColor}
      />
    </div>
  );
};

export default CommissionTracker;
