
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getProductById } from '@/lib/marketplace';
import { Product } from '@/lib/types';
import { Package, MapPin, Phone, MessageSquare, Store, ArrowLeft, ExternalLink } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await getProductById(id);
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!product?.shops?.company_profiles?.whatsapp) return;
    
    const message = `Hello! I'm interested in your product: ${product.name}. Please provide more details.`;
    const whatsappUrl = `https://wa.me/${product.shops.company_profiles.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneContact = () => {
    if (!product?.shops?.company_profiles?.phone) return;
    window.open(`tel:${product.shops.company_profiles.phone}`, '_self');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">Product not found</h3>
            <p className="text-gray-600 mb-6 font-poppins">The product you're looking for doesn't exist or has been removed.</p>
            <Link to="/products">
              <Button className="bg-primary hover:bg-pakistani-green-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/products" className="inline-flex items-center text-primary hover:text-pakistani-green-800 font-poppins">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="space-y-4">
            <Card className="overflow-hidden">
              <div className="h-96 bg-gray-100">
                {product.image ? (
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/600x400?text=Product";
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-24 w-24 text-gray-400" />
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4 font-poppins">{product.name}</h1>
              
              {product.categories && (
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
                  {product.categories.name}
                </span>
              )}
              
              <div className="mb-6">
                <p className="text-4xl font-bold text-primary mb-2 font-poppins">
                  PKR {product.price.toLocaleString()}
                </p>
                {product.moq && product.moq > 1 && (
                  <p className="text-gray-600 font-poppins">
                    Minimum Order Quantity: {product.moq} pieces
                  </p>
                )}
              </div>

              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2 font-poppins">Description</h3>
                  <p className="text-gray-700 leading-relaxed font-poppins">{product.description}</p>
                </div>
              )}
            </div>

            {/* Supplier Info */}
            {product.shops && (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {product.shops.company_profiles?.logo ? (
                      <img 
                        src={product.shops.company_profiles.logo} 
                        alt={product.shops.name} 
                        className="h-12 w-12 rounded-full object-cover mr-4"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-lg font-poppins">
                        {product.shops.company_profiles?.company_name || product.shops.name}
                      </h3>
                      {product.shops.cities && (
                        <div className="flex items-center text-gray-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="font-poppins">{product.shops.cities.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Link to={`/seller/${product.shops.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                </div>

                {product.shops.company_profiles?.description && (
                  <p className="text-gray-600 mb-4 font-poppins">
                    {product.shops.company_profiles.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {product.shops.company_profiles?.whatsapp && (
                    <Button 
                      onClick={handleWhatsAppContact}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                  )}
                  
                  {product.shops.company_profiles?.phone && (
                    <Button 
                      onClick={handlePhoneContact}
                      variant="outline"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Call Now
                    </Button>
                  )}
                </div>

                <Link to="/inquiry" state={{ product, shop: product.shops }}>
                  <Button className="w-full mt-3 bg-primary hover:bg-pakistani-green-800">
                    Send Inquiry
                  </Button>
                </Link>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
