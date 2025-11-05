import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUser } from '@/lib/auth';

interface InquiryButtonProps {
  sellerId: string;
  productId?: string;
  className?: string;
}

const InquiryButton: React.FC<InquiryButtonProps> = ({ sellerId, productId, className }) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    message: '',
    quantityNeeded: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sellerPhone, setSellerPhone] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchSellerPhone = async () => {
      const { data } = await supabase
        .from('company_profiles')
        .select('phone, whatsapp')
        .eq('user_id', sellerId)
        .single();
      
      if (data?.whatsapp || data?.phone) {
        setSellerPhone(data.whatsapp || data.phone);
      }
    };
    
    if (open) {
      fetchSellerPhone();
    }
  }, [open, sellerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.buyerName || !formData.buyerPhone || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please login to send an inquiry",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('inquiries')
        .insert({
          buyer_id: user.id,
          seller_id: sellerId,
          product_id: productId || null,
          buyer_name: formData.buyerName,
          buyer_phone: formData.buyerPhone,
          buyer_email: formData.buyerEmail || null,
          message: formData.message,
          quantity_needed: formData.quantityNeeded ? parseInt(formData.quantityNeeded) : null,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Inquiry Sent",
        description: "Your inquiry has been sent successfully!",
        variant: "default"
      });

      setFormData({
        buyerName: '',
        buyerPhone: '',
        buyerEmail: '',
        message: '',
        quantityNeeded: ''
      });
      setOpen(false);
    } catch (error: any) {
      console.error('Error sending inquiry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send inquiry",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppInquiry = () => {
    if (!sellerPhone) {
      toast({
        title: "Error",
        description: "Seller phone number not available",
        variant: "destructive"
      });
      return;
    }

    const cleanPhone = sellerPhone.replace(/[^\d]/g, '');
    const whatsappPhone = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0/, '')}`;
    
    const message = productId 
      ? `Hi, I'm interested in your product. I'd like to discuss bulk pricing and custom requirements.`
      : `Hi, I'm interested in your products. I'd like to discuss bulk pricing and custom requirements.`;
    
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <MessageCircle className="w-4 h-4 mr-2" />
          Send Inquiry
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-poppins">Contact Seller</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="form" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Inquiry Form</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          </TabsList>
          
          <TabsContent value="form" className="mt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyerName">Full Name *</Label>
              <Input
                id="buyerName"
                value={formData.buyerName}
                onChange={(e) => setFormData(prev => ({...prev, buyerName: e.target.value}))}
                placeholder="Your full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="buyerPhone">Phone Number *</Label>
              <Input
                id="buyerPhone"
                value={formData.buyerPhone}
                onChange={(e) => setFormData(prev => ({...prev, buyerPhone: e.target.value}))}
                placeholder="03XX-XXXXXXX"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="buyerEmail">Email (Optional)</Label>
            <Input
              id="buyerEmail"
              type="email"
              value={formData.buyerEmail}
              onChange={(e) => setFormData(prev => ({...prev, buyerEmail: e.target.value}))}
              placeholder="your@email.com"
            />
          </div>

          {productId && (
            <div>
              <Label htmlFor="quantityNeeded">Quantity Needed</Label>
              <Input
                id="quantityNeeded"
                type="number"
                value={formData.quantityNeeded}
                onChange={(e) => setFormData(prev => ({...prev, quantityNeeded: e.target.value}))}
                placeholder="Enter quantity"
                min="1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({...prev, message: e.target.value}))}
              placeholder="Please provide details about your requirements..."
              required
              rows={4}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Sending...' : 'Send Inquiry'}
            </Button>
          </div>
            </form>
          </TabsContent>
          
          <TabsContent value="whatsapp" className="mt-4 space-y-4">
            <div className="text-center space-y-4 py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Chat on WhatsApp</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Send a direct message to the seller on WhatsApp for instant communication
                </p>
              </div>
              <Button
                onClick={handleWhatsAppInquiry}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={!sellerPhone}
              >
                <Send className="w-4 h-4 mr-2" />
                Open WhatsApp Chat
              </Button>
              {!sellerPhone && (
                <p className="text-xs text-muted-foreground">
                  Seller contact not available
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default InquiryButton;