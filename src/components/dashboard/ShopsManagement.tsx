import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Store, Plus, Edit, MapPin, Phone, Package, AlertCircle, ArrowDown } from 'lucide-react';
import { Shop } from '@/lib/types';
import { getShopsByOwner } from '@/lib/shops';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import CreateShopDialog from '@/components/shops/CreateShopDialog';
import EditShopDialog from '@/components/shops/EditShopDialog';
import PaymentMethodsSetup from '@/components/payment/PaymentMethodsSetup';
import { useQuery } from '@tanstack/react-query';
import { getMyPaymentMethods } from '@/lib/payment-methods';
import { PaymentMethodInfo } from '@/types/enhanced-payment';
const ShopsManagement: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const paymentSetupRef = useRef<HTMLDivElement>(null);
  const {
    data: shops = [],
    isLoading,
    refetch
  } = useQuery<Shop[]>({
    queryKey: ['user-shops'],
    queryFn: getShopsByOwner
  });

  const { data: paymentMethods } = useQuery<PaymentMethodInfo | null>({
    queryKey: ['my-payment-methods'],
    queryFn: getMyPaymentMethods
  });
  const handleShopCreated = () => {
    refetch();
    toast({
      title: t('shopCreatedSuccessfully'),
      description: t('shopCreatedSuccessfully')
    });
  };
  const handleShopUpdated = () => {
    refetch();
    setSelectedShop(null);
  };
  const handleEditShop = (shop: Shop) => {
    setSelectedShop(shop);
    setIsEditDialogOpen(true);
  };

  const scrollToPaymentSetup = () => {
    paymentSetupRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  };

  const hasPaymentMethods = Boolean(
    paymentMethods && (
      (paymentMethods.bank_name?.trim() && paymentMethods.account_number?.trim()) ||
      paymentMethods.jazzcash_number?.trim() ||
      paymentMethods.easypaisa_number?.trim()
    )
  );
  if (isLoading) {
    return <div className="space-y-4">
        {[...Array(2)].map((_, i) => <div key={i} className="animate-pulse bg-muted h-48 rounded-lg"></div>)}
      </div>;
  }
  return <div className="space-y-3 sm:space-y-4 py-2 sm:py-4">
      {/* Payment Methods Reminder Banner */}
      {shops.length > 0 && !hasPaymentMethods && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between gap-4">
            <span className="text-sm text-orange-800 font-poppins">
              <strong>Action Required:</strong> Set up your payment methods to start receiving orders from sellers.
            </span>
            <Button
              size="sm"
              onClick={scrollToPaymentSetup}
              className="bg-orange-600 hover:bg-orange-700 font-poppins whitespace-nowrap"
            >
              <ArrowDown className="h-3 w-3 mr-1" />
              Setup Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold font-poppins text-foreground">{t('myShops')}</h1>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-poppins text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 rtl:mr-0 rtl:ml-1 sm:rtl:mr-0 sm:rtl:ml-2" />
          <span className="hidden sm:inline">{t('createShop')}</span>
          <span className="sm:hidden">{t('create')}</span>
        </Button>
      </div>

      {shops.length === 0 ? <Card>
          <CardContent className="flex flex-col items-center justify-center py-6 sm:py-8">
            <Store className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-3" />
            <h3 className="text-sm sm:text-base font-medium text-foreground mb-2 font-poppins">
              {t('noShopsYet')}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 font-poppins text-center px-4">
              {t('createFirstShop')}
            </p>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-poppins text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 rtl:mr-0 rtl:ml-1 sm:rtl:mr-0 sm:rtl:ml-2" />
              {t('createYourFirstShop')}
            </Button>
          </CardContent>
        </Card> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {shops.map(shop => <Card key={shop.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {shop.logo && <div className="aspect-video relative h-24 sm:h-32">
                  <img src={shop.logo} alt={shop.name} className="w-full h-full object-cover" />
                </div>}
              
              <CardHeader className="p-3 sm:p-4">
                <div className="flex justify-between items-start gap-2">
                  <CardTitle className="font-poppins text-sm sm:text-base">{shop.name}</CardTitle>
                  <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleEditShop(shop)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-2 p-3 sm:p-4 pt-0 sm:pt-0">
                <div className="flex items-center text-muted-foreground">
                  <Phone className="w-3 h-3 mr-1.5" />
                  <span className="font-poppins text-xs sm:text-sm">{shop.contact}</span>
                </div>
                
                <div className="flex items-start text-muted-foreground">
                  <MapPin className="w-3 h-3 mr-1.5 rtl:mr-0 rtl:ml-1.5 mt-0.5" />
                  <div className="font-poppins">
                    <p className="text-xs sm:text-sm">{shop.address}</p>
                    <p className="text-xs">{t('postalCode')}: {shop.postal_code}</p>
                    {shop.cities && <p className="text-xs">{shop.cities.name}, {shop.cities.province}</p>}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-1">
                  {shop.is_verified && <Badge className="bg-green-100 text-green-800 font-poppins text-xs px-2 py-0.5">
                      {t('verified')}
                    </Badge>}
                </div>

                {/* Payment Methods Summary */}
                <div className="pt-3 mt-3 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-600 mb-2 font-poppins">Payment Methods:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {paymentMethods?.bank_name && paymentMethods?.account_number ? (
                      <Badge variant="success" size="sm" className="font-poppins">
                        Bank
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm" className="font-poppins text-gray-400">
                        Bank
                      </Badge>
                    )}
                    
                    {paymentMethods?.jazzcash_number ? (
                      <Badge variant="success" size="sm" className="font-poppins">
                        JazzCash
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm" className="font-poppins text-gray-400">
                        JazzCash
                      </Badge>
                    )}
                    
                    {paymentMethods?.easypaisa_number ? (
                      <Badge variant="success" size="sm" className="font-poppins">
                        EasyPaisa
                      </Badge>
                    ) : (
                      <Badge variant="outline" size="sm" className="font-poppins text-gray-400">
                        EasyPaisa
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>)}
        </div>}

      {/* Payment Methods Section */}
      {shops.length > 0 && (
        <div ref={paymentSetupRef} className="mt-8 scroll-mt-4">
          <PaymentMethodsSetup />
        </div>
      )}

      <CreateShopDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onShopCreated={handleShopCreated} />

      <EditShopDialog isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} shop={selectedShop} onShopUpdated={handleShopUpdated} />
    </div>;
};
export default ShopsManagement;