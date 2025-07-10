
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createInquiry } from '@/lib/marketplace';
import { useAuth } from '@/contexts/AuthContextFixed';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, ArrowLeft } from 'lucide-react';

const InquiryForm: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const { product, shop } = location.state || {};
  
  const [formData, setFormData] = useState({
    buyer_name: '',
    buyer_phone: '',
    buyer_email: '',
    message: '',
    quantity_needed: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to send an inquiry.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!product || !shop) {
      toast({
        title: 'Invalid Request',
        description: 'Product or supplier information is missing.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.buyer_name || !formData.buyer_phone || !formData.message) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      await createInquiry({
        buyer_id: user.id,
        seller_id: shop.owner_id,
        product_id: product.id,
        buyer_name: formData.buyer_name,
        buyer_phone: formData.buyer_phone,
        buyer_email: formData.buyer_email,
        message: formData.message,
        quantity_needed: formData.quantity_needed ? parseInt(formData.quantity_needed) : undefined,
        status: 'pending',
      });

      toast({
        title: 'Inquiry Sent',
        description: 'Your inquiry has been sent to the supplier successfully.',
      });

      navigate(`/product/${product.id}`);
    } catch (error: any) {
      toast({
        title: 'Failed to Send Inquiry',
        description: error.message || 'An error occurred while sending your inquiry.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product || !shop) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">Invalid Request</h3>
            <p className="text-gray-600 mb-6 font-poppins">
              No product or supplier information found. Please navigate from a product page.
            </p>
            <Button onClick={() => navigate('/products')} className="bg-primary hover:bg-pakistani-green-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-primary hover:text-pakistani-green-800 font-poppins"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-poppins">Send Inquiry</h1>
            <p className="text-gray-600 font-poppins">
              Send a message to the supplier about this product
            </p>
          </div>

          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-16 w-16 rounded-lg object-cover mr-4"
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center mr-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg font-poppins">{product.name}</h3>
                <p className="text-gray-600 font-poppins">PKR {product.price.toLocaleString()}</p>
                <p className="text-sm text-gray-500 font-poppins">
                  Supplier: {shop.company_profiles?.company_name || shop.name}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="buyer_name" className="font-poppins">Your Name *</Label>
              <Input
                id="buyer_name"
                name="buyer_name"
                value={formData.buyer_name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="buyer_phone" className="font-poppins">Phone Number *</Label>
              <Input
                id="buyer_phone"
                name="buyer_phone"
                type="tel"
                value={formData.buyer_phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="buyer_email" className="font-poppins">Email Address</Label>
              <Input
                id="buyer_email"
                name="buyer_email"
                type="email"
                value={formData.buyer_email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="quantity_needed" className="font-poppins">Quantity Needed</Label>
              <Input
                id="quantity_needed"
                name="quantity_needed"
                type="number"
                min="1"
                value={formData.quantity_needed}
                onChange={handleInputChange}
                placeholder="Enter quantity you need"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="message" className="font-poppins">Message *</Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please provide details about your requirements, expected price, delivery location, etc."
                rows={5}
                required
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary hover:bg-pakistani-green-800"
              >
                {isSubmitting ? 'Sending...' : 'Send Inquiry'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default InquiryForm;
