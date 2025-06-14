
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, MessageCircle, Star, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { getProductById, DemoProduct } from '@/data/demoProducts';
import { useToast } from '@/hooks/use-toast';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<DemoProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('ProductDetail - Product ID from params:', id);
    
    if (!id) {
      console.log('No product ID provided');
      setLoading(false);
      return;
    }

    // Get product from demo data
    const foundProduct = getProductById(id);
    console.log('Found product:', foundProduct);
    
    setProduct(foundProduct || null);
    setLoading(false);
  }, [id]);

  const handleBackToProducts = () => {
    navigate('/products');
  };

  const handleInquiry = () => {
    toast({
      title: "Inquiry Sent",
      description: "Your inquiry has been sent to the wholesaler. They will contact you soon.",
    });
  };

  const handleAddToCart = () => {
    toast({
      title: "Added to Cart",
      description: `${product?.name} has been added to your cart.`,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
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
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-2xl font-bold text-gray-800 mb-4 font-poppins">Product not found</h1>
            <p className="text-gray-600 mb-8 font-poppins">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={handleBackToProducts}
              className="bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={handleBackToProducts}
          className="mb-6 font-poppins"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2 font-poppins">
                {product.category}
              </Badge>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
                {product.name}
              </h1>
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="h-4 w-4" />
                <span className="font-poppins">{product.location}</span>
              </div>
            </div>

            <div className="text-3xl font-bold text-pakistani_green-600 font-poppins">
              Rs. {product.price.toLocaleString()}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 font-poppins">Wholesaler:</span>
                <span className="font-medium font-poppins">{product.wholesaler}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-poppins">Minimum Order:</span>
                <span className="font-medium font-poppins">{product.minOrder} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-poppins">Stock Status:</span>
                <Badge variant={product.inStock ? "default" : "destructive"} className="font-poppins">
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold font-poppins">Description</h3>
              <p className="text-gray-700 font-poppins">{product.description}</p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-pakistani_green-600 hover:bg-pakistani_green-700 font-poppins"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={handleInquiry}
                variant="outline"
                className="flex-1 font-poppins"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Send Inquiry
              </Button>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-semibold mb-4 font-poppins">Wholesaler Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2 font-poppins">Business Name</h4>
                <p className="text-gray-600 font-poppins">{product.wholesaler}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 font-poppins">Location</h4>
                <p className="text-gray-600 font-poppins">{product.location}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2 font-poppins">Rating</h4>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2 font-poppins">(4.8/5)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ProductDetail;
