
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const ShippingPolicy = () => {
  return (
    <Layout 
      title="Shipping Policy - Pak Bazaar Connect"
      description="Shipping policy for Pakistan's leading B2B marketplace"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4 font-poppins">
              Shipping Policy
            </h1>
            <p className="text-muted-foreground font-poppins">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="p-8">
            <div className="prose prose-lg max-w-none font-poppins">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Shipping Coverage
              </h2>
              <p className="mb-6 text-foreground">
                We facilitate shipping across all major cities in Pakistan through our network of verified wholesalers.
              </p>

              <h3 className="text-xl font-semibold text-primary mb-3">
                Delivery Areas
              </h3>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Karachi - 1-2 business days</li>
                <li>Lahore - 1-2 business days</li>
                <li>Islamabad - 2-3 business days</li>
                <li>Other major cities - 3-5 business days</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Shipping Costs
              </h2>
              <p className="mb-6 text-foreground">
                Shipping costs are determined by the wholesaler and distance. Most orders over PKR 5,000 qualify for free shipping.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Tracking Orders
              </h2>
              <p className="mb-6 text-foreground">
                All orders include tracking information provided through your dashboard once shipped.
              </p>

              <div className="mt-4 p-4 bg-pakistani_green-50 rounded-lg">
                <p className="text-foreground"><strong>Shipping Support:</strong> khizercoding.com</p>
                <p className="text-foreground"><strong>Phone:</strong> +92 3149388513</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;
