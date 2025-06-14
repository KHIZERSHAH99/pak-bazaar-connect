
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ProductsGrid from '@/components/products/ProductsGrid';
import { demoProducts } from '@/data/demoProducts';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { Product } from '@/lib/types';

const FeaturedProducts: React.FC = () => {
  // Convert DemoProduct to Product format for ProductsGrid compatibility
  const productsToDisplay: Product[] = demoProducts.slice(0, 8).map(product => ({
    id: product.id,
    shop_id: product.shop_id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    is_active: product.is_active,
    verification_status: product.verification_status,
    moq: product.minOrder,
    shops: {
      name: product.wholesaler,
      cities: { name: product.location }
    }
  }));

  return (
    <section className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 font-poppins flex items-center justify-center">
            <ShoppingCart className="h-8 w-8 mr-3 text-pakistani_green-700" />
            Featured Products
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-poppins">
            Discover a selection of top-quality products from verified wholesalers across Pakistan.
          </p>
        </div>

        <ProductsGrid products={productsToDisplay} loading={false} />

        {demoProducts.length > 0 && (
          <div className="mt-12 text-center">
            <Link to="/products">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-700 hover:from-pakistani_green-700 hover:to-pakistani_green-800 text-white px-8 py-4 text-lg font-poppins shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                View All Products
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
