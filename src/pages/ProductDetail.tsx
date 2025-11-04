import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Home, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import Layout from '@/components/Layout';
import { getProductById } from '@/lib/products';
import { Product } from '@/lib/types';
import OptimizedProductDetail from '@/components/products/OptimizedProductDetail';
import ProductsErrorBoundary from '@/components/ui/ProductsErrorBoundary';

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

  // SEO Meta Tags
  const pageTitle = `${product.name} - ${product.shops?.name || 'Shop'} | Pak Bazaar Connect`;
  const pageDescription = product.description 
    ? product.description.substring(0, 160) 
    : `Buy ${product.name} from ${product.shops?.name || 'verified wholesaler'}. Starting at Rs. ${product.price.toLocaleString()}. MOQ: ${product.moq || 1} units.`;
  const productUrl = `https://pakbazaarconnect.com/product/${product.id}`;
  const productImageUrl = product.product_images?.[0]?.image_url || product.image || '';

  return (
    <Layout>
      <Helmet>
        {/* Basic Meta Tags */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={productUrl} />
        
        {/* Open Graph Tags */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={productImageUrl} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:type" content="product" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={productImageUrl} />
        
        {/* Product Schema JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": product.name,
            "image": productImageUrl,
            "description": product.description || pageDescription,
            "brand": {
              "@type": "Brand",
              "name": product.brand || product.shops?.name || "Unknown"
            },
            "offers": {
              "@type": "Offer",
              "url": productUrl,
              "priceCurrency": "PKR",
              "price": product.price,
              "availability": product.stock_quantity && product.stock_quantity > 0 
                ? "https://schema.org/InStock" 
                : "https://schema.org/OutOfStock",
              "seller": {
                "@type": "Organization",
                "name": product.shops?.name || "Pak Bazaar Connect"
              }
            },
            ...(product.avg_rating && product.total_reviews ? {
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.avg_rating,
                "reviewCount": product.total_reviews
              }
            } : {})
          })}
        </script>
      </Helmet>
      
      {/* Breadcrumb Navigation */}
      <div className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm overflow-x-auto">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="h-auto p-1 hover:bg-transparent"
            >
              <Home className="h-4 w-4" />
            </Button>
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/products')}
              className="h-auto p-1 hover:underline whitespace-nowrap"
            >
              Products
            </Button>
            {product.categories && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(`/products?category=${product.category_id}`)}
                  className="h-auto p-1 hover:underline whitespace-nowrap"
                >
                  {product.categories.name}
                </Button>
              </>
            )}
            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground truncate">{product.name}</span>
          </nav>
        </div>
      </div>
      
      <ProductsErrorBoundary>
        <OptimizedProductDetail product={product} onBack={handleBackToProducts} />
      </ProductsErrorBoundary>
    </Layout>
  );
};

export default ProductDetail;
