
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getShopById, getProductsByShopPublic } from '@/lib/marketplace';
import { Shop, Product } from '@/lib/types';
import { Store, MapPin, Phone, MessageSquare, Globe, Package, ArrowLeft, ExternalLink } from 'lucide-react';

const SellerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [shopData, productsData] = await Promise.all([
        getShopById(id),
        getProductsByShopPublic(id),
      ]);
      
      setShop(shopData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    if (!shop?.company_profiles?.whatsapp) return;
    
    const message = `Hello! I'm interested in your products. Please provide more details about your offerings.`;
    const whatsappUrl = `https://wa.me/${shop.company_profiles.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handlePhoneContact = () => {
    if (!shop?.company_profiles?.phone) return;
    window.open(`tel:${shop.company_profiles.phone}`, '_self');
  };

  const handleWebsiteVisit = () => {
    if (!shop?.company_profiles?.website) return;
    const url = shop.company_profiles.website.startsWith('http') 
      ? shop.company_profiles.website 
      : `https://${shop.company_profiles.website}`;
    window.open(url, '_blank');
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

  if (!shop) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-12 text-center">
            <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">Supplier not found</h3>
            <p className="text-gray-600 mb-6 font-poppins">The supplier you're looking for doesn't exist.</p>
            <Link to="/sellers">
              <Button className="bg-primary hover:bg-pakistani-green-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Suppliers
              </Button>
            </Link>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link to="/sellers" className="inline-flex items-center text-primary hover:text-pakistani-green-800 font-poppins">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Suppliers
          </Link>
        </div>

        {/* Supplier Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary to-pakistani-green-600 relative">
            {shop.company_profiles?.logo ? (
              <img 
                src={shop.company_profiles.logo} 
                alt={shop.name} 
                className="absolute bottom-4 left-6 h-20 w-20 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="absolute bottom-4 left-6 h-20 w-20 rounded-full border-4 border-white bg-white flex items-center justify-center">
                <Store className="h-10 w-10 text-primary" />
              </div>
            )}
          </div>
          
          <div className="p-6 pt-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2 font-poppins">
                  {shop.company_profiles?.company_name || shop.name}
                </h1>
                
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span className="font-poppins">
                    {shop.address}
                    {shop.cities && `, ${shop.cities.name}, ${shop.cities.province}`}
                  </span>
                </div>

                {shop.company_profiles?.description && (
                  <p className="text-gray-700 font-poppins">{shop.company_profiles.description}</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {shop.company_profiles?.whatsapp && (
                  <Button 
                    onClick={handleWhatsAppContact}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                
                {shop.company_profiles?.phone && (
                  <Button 
                    onClick={handlePhoneContact}
                    variant="outline"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Now
                  </Button>
                )}

                {shop.company_profiles?.website && (
                  <Button 
                    onClick={handleWebsiteVisit}
                    variant="outline"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Website
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 font-poppins">Products</h2>
          
          {products.length === 0 ? (
            <Card className="p-12 text-center">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2 font-poppins">No products available</h3>
              <p className="text-gray-600 font-poppins">This supplier hasn't added any products yet.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 h-full">
                    <div className="h-48 bg-gray-100">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://via.placeholder.com/300x200?text=Product";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 font-poppins line-clamp-2">{product.name}</h3>
                      
                      {product.categories && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                          {product.categories.name}
                        </span>
                      )}
                      
                      <p className="text-xl font-bold text-primary mb-2 font-poppins">
                        PKR {product.price.toLocaleString()}
                      </p>
                      
                      {product.moq && product.moq > 1 && (
                        <p className="text-sm text-gray-600 font-poppins">
                          MOQ: {product.moq} pieces
                        </p>
                      )}

                      <Button className="w-full mt-3 bg-primary hover:bg-pakistani-green-800" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SellerProfile;
