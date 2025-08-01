import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { getProductById } from '@/lib/products';
import { Product } from '@/lib/types';
import EnhancedProductDetail from '@/components/products/EnhancedProductDetail';
import HeaderAdBanner from '@/components/ads/HeaderAdBanner';
import InContentAdBanner from '@/components/ads/InContentAdBanner';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ProductDetail - Product ID from params:', id);
    
    if (!id) {
      console.log('No product ID provided');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        const foundProduct = await getProductById(id);
        console.log('Found product:', foundProduct);
        
        setProduct(foundProduct);

        // Set MOQ as initial quantity if product found
        if (foundProduct && foundProduct.moq) {
          console.log('Product MOQ:', foundProduct.moq);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBackToProducts = () => {
    navigate('/products');
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-2xl font-bold mb-4 font-poppins">Product not found</h1>
            <p className="text-muted-foreground mb-8 font-poppins">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={handleBackToProducts} className="font-poppins">
              Back to Products
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <HeaderAdBanner />
      <EnhancedProductDetail product={product} onBack={handleBackToProducts} />
      <InContentAdBanner className="my-8" />
    </Layout>
  );
};

export default ProductDetail;
