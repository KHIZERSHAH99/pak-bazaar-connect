
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, DollarSign, Percent, TrendingUp } from 'lucide-react';
import { Commission } from '@/lib/supabase';

interface CommissionSummaryProps {
  commissions: Commission[];
}

const CommissionSummary: React.FC<CommissionSummaryProps> = ({ commissions }) => {
  // Calculate total sales, commissions and payouts
  const totalSales = commissions.reduce((sum, comm) => sum + (comm.sale_amount || 0), 0);
  const totalCommissions = commissions.reduce((sum, comm) => sum + (comm.commission_amount || 0), 0);
  const totalPayouts = commissions.reduce((sum, comm) => sum + (comm.payout_amount || 0), 0);
  
  // Calculate commission rate
  const avgCommissionRate = totalSales > 0 ? (totalCommissions / totalSales) * 100 : 5;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-green-100 p-2">
                <DollarSign className="h-4 w-4 text-green-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">PKR {totalSales.toFixed(2)}</div>
                <p className="text-xs text-gray-500">All time sales volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Platform Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-red-100 p-2">
                <Percent className="h-4 w-4 text-red-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">PKR {totalCommissions.toFixed(2)}</div>
                <p className="text-xs text-gray-500">{avgCommissionRate.toFixed(1)}% commission rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Net Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="mr-2 rounded-full bg-blue-100 p-2">
                <TrendingUp className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <div className="text-2xl font-bold">PKR {totalPayouts.toFixed(2)}</div>
                <p className="text-xs text-gray-500">Total earnings after fees</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
          <CardDescription>Detailed breakdown of platform fees</CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No commission history yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-500">Transaction ID</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Sale Amount</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Commission</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-500">Payout</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.map((commission) => (
                    <tr key={commission.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {new Date(commission.created_at || '').toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">
                        {commission.transaction_id.substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 text-right">
                        PKR {commission.sale_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right text-red-600">
                        -PKR {commission.commission_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        PKR {commission.payout_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommissionSummary;
