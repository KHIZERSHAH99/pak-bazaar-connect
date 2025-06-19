
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, Eye, DollarSign, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { markCommissionAsPaid } from '@/lib/commission-management';
import { CommissionRecord } from '@/lib/types';

interface CommissionRecordsListProps {
  records: CommissionRecord[];
  onRefresh: () => void;
}

const CommissionRecordsList: React.FC<CommissionRecordsListProps> = ({
  records,
  onRefresh
}) => {
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString('en-PK', { minimumFractionDigits: 2 })}`;
  };

  const handleMarkAsPaid = async (commissionId: string) => {
    try {
      setProcessingPayment(commissionId);
      await markCommissionAsPaid(commissionId);
      
      toast({
        title: "Commission Marked as Paid",
        description: "The commission has been successfully marked as paid",
        variant: "default"
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to mark commission as paid",
        variant: "destructive"
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-poppins">
          <DollarSign className="h-5 w-5" />
          Commission Records
          <Badge variant="outline" className="ml-2">
            {records.length} records
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 font-poppins">No commission records found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-poppins">Date</TableHead>
                  <TableHead className="font-poppins">Wholesaler</TableHead>
                  <TableHead className="font-poppins">Order ID</TableHead>
                  <TableHead className="font-poppins">Sale Amount</TableHead>
                  <TableHead className="font-poppins">Commission</TableHead>
                  <TableHead className="font-poppins">Status</TableHead>
                  <TableHead className="font-poppins">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-poppins">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {new Date(record.created_at!).toLocaleDateString('en-PK')}
                      </div>
                    </TableCell>
                    <TableCell className="font-poppins">
                      {record.profiles?.business_name || record.profiles?.email || 'Unknown'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {record.order_id.slice(0, 8)}...
                    </TableCell>
                    <TableCell className="font-medium font-poppins">
                      {formatCurrency(record.sale_amount)}
                    </TableCell>
                    <TableCell className="font-medium text-pakistani_green-700 font-poppins">
                      {formatCurrency(record.commission_amount)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(record.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {record.status === 'pending' && (
                          <Button
                            onClick={() => handleMarkAsPaid(record.id)}
                            disabled={processingPayment === record.id}
                            size="sm"
                            className="bg-pakistani_green-600 hover:bg-pakistani_green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            {processingPayment === record.id ? 'Processing...' : 'Mark Paid'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // View order details - could navigate to order page
                            console.log('View order:', record.order_id);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CommissionRecordsList;
