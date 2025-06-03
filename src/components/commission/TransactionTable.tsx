
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';

interface TransactionTableProps {
  transactions: any[];
  isWholesaler: boolean;
  formatCurrency: (amount: number) => string;
  getStatusColor: (status: string) => string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({ 
  transactions, 
  isWholesaler, 
  formatCurrency, 
  getStatusColor 
}) => {
  return (
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
  );
};

export default TransactionTable;
