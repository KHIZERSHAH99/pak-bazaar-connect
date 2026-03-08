
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Calendar, DollarSign, User, Building, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Quote {
  id: string;
  quoteNumber: string;
  productName: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  validUntil: string;
  notes: string;
  createdAt: string;
}

interface QuoteManagerProps {
  userRole: 'buyer' | 'seller';
}

const QuoteManager: React.FC<QuoteManagerProps> = ({ userRole }) => {
  const [quotes, setQuotes] = useState<Quote[]>([
    {
      id: '1',
      quoteNumber: 'QT-2024-001',
      productName: 'Premium Rice Basmati',
      supplierName: 'Punjab Rice Mills',
      quantity: 1000,
      unitPrice: 8500,
      totalAmount: 8500000,
      status: 'pending',
      validUntil: '2024-02-15',
      notes: 'Bulk order for export',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      quoteNumber: 'QT-2024-002',
      productName: 'Cotton Fabric Rolls',
      supplierName: 'Textile Industries Ltd',
      quantity: 500,
      unitPrice: 1200,
      totalAmount: 600000,
      status: 'approved',
      validUntil: '2024-02-20',
      notes: 'High-grade cotton required',
      createdAt: '2024-01-10'
    }
  ]);

  const [showCreateQuote, setShowCreateQuote] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);

  const getStatusColor = (status: Quote['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Quote['status']) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = (quoteId: string, newStatus: Quote['status']) => {
    setQuotes(quotes.map(quote => 
      quote.id === quoteId ? { ...quote, status: newStatus } : quote
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold font-poppins">Quote Management</h2>
          <p className="text-gray-600 font-poppins">
            {userRole === 'buyer' ? 'Manage your quote requests' : 'Handle incoming quote requests'}
          </p>
        </div>
        {userRole === 'buyer' && (
          <Dialog open={showCreateQuote} onOpenChange={setShowCreateQuote}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request New Quote</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Product Name</label>
                  <Input placeholder="Enter product name" />
                </div>
                <div>
                  <label className="text-sm font-medium">Quantity</label>
                  <Input type="number" placeholder="Enter quantity" />
                </div>
                <div>
                  <label className="text-sm font-medium">Additional Notes</label>
                  <Textarea placeholder="Any specific requirements..." />
                </div>
                <Button className="w-full">
                  Send Quote Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {quotes.map((quote) => (
          <Card key={quote.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-pakistani_green-600" />
                  <div>
                    <h3 className="font-semibold font-poppins">{quote.quoteNumber}</h3>
                    <p className="text-sm text-gray-600 font-poppins">{quote.productName}</p>
                  </div>
                </div>
                <Badge className={`${getStatusColor(quote.status)} flex items-center gap-1`}>
                  {getStatusIcon(quote.status)}
                  {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 font-poppins">Supplier</p>
                    <p className="text-sm font-medium font-poppins">{quote.supplierName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 font-poppins">Quantity</p>
                    <p className="text-sm font-medium font-poppins">{quote.quantity.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 font-poppins">Unit Price</p>
                    <p className="text-sm font-medium font-poppins">PKR {quote.unitPrice.toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500 font-poppins">Valid Until</p>
                    <p className="text-sm font-medium font-poppins">{quote.validUntil}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-lg font-bold text-pakistani_green-600 font-poppins">
                    Total: PKR {quote.totalAmount.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  {userRole === 'seller' && quote.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(quote.id, 'rejected')}
                      >
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(quote.id, 'approved')}
                        className=""
                      >
                        Approve
                      </Button>
                    </>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuoteManager;
