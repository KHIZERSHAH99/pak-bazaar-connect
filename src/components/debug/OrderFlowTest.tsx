
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getProducts, getProductById } from '@/lib/products';
import { getPaymentMethodsForShop } from '@/lib/payment-methods';
import { useAuth } from '@/contexts/AuthContextFixed';

const OrderFlowTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>({});
  const [productId, setProductId] = useState('');
  const [shopId, setShopId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user, profile } = useAuth();

  const testProductFetch = async () => {
    setIsLoading(true);
    try {
      const products = await getProducts(5);
      console.log('Test: Products fetched:', products);
      setTestResults(prev => ({ ...prev, products }));
    } catch (error) {
      console.error('Test: Error fetching products:', error);
      setTestResults(prev => ({ ...prev, productsError: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const testProductById = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const product = await getProductById(productId);
      console.log('Test: Product by ID:', product);
      setTestResults(prev => ({ ...prev, productById: product }));
    } catch (error) {
      console.error('Test: Error fetching product by ID:', error);
      setTestResults(prev => ({ ...prev, productByIdError: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const testPaymentMethods = async () => {
    if (!shopId) return;
    setIsLoading(true);
    try {
      const methods = await getPaymentMethodsForShop(shopId);
      console.log('Test: Payment methods:', methods);
      setTestResults(prev => ({ ...prev, paymentMethods: methods }));
    } catch (error) {
      console.error('Test: Error fetching payment methods:', error);
      setTestResults(prev => ({ ...prev, paymentMethodsError: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || profile?.role !== 'admin') {
    return (
      <Card>
        <CardContent className="p-4">
          <p>This debug component is only available for admin users.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Order Flow Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button onClick={testProductFetch} disabled={isLoading}>
            Test Product Fetch
          </Button>
          
          <div className="space-y-2">
            <Label htmlFor="productId">Product ID</Label>
            <Input
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="Enter product ID"
            />
            <Button onClick={testProductById} disabled={isLoading || !productId}>
              Test Product by ID
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shopId">Shop ID</Label>
            <Input
              id="shopId"
              value={shopId}
              onChange={(e) => setShopId(e.target.value)}
              placeholder="Enter shop ID"
            />
            <Button onClick={testPaymentMethods} disabled={isLoading || !shopId}>
              Test Payment Methods
            </Button>
          </div>
        </div>

        {Object.keys(testResults).length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-4">Test Results:</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
              {JSON.stringify(testResults, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderFlowTest;
