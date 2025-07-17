import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

const ShippingPolicy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
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
              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Shipping Overview
              </h2>
              <p className="mb-6 text-foreground">
                Pak Bazaar Connect is a B2B marketplace platform. All shipping arrangements are made directly between wholesalers and buyers. We do not handle physical shipping of products.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Shipping Arrangements
              </h2>
              <p className="mb-4 text-foreground">
                When placing an order through our platform:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Shipping terms are agreed upon between buyer and seller</li>
                <li>Shipping costs are determined by the wholesaler</li>
                <li>Delivery timeframes are set by individual suppliers</li>
                <li>Shipping methods vary by supplier and location</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Common Shipping Methods in Pakistan
              </h2>
              <p className="mb-4 text-foreground">
                Most suppliers on our platform use these shipping methods:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li><strong>TCS:</strong> Nationwide courier service</li>
                <li><strong>Leopards:</strong> Fast courier and cargo service</li>
                <li><strong>Pakistan Post:</strong> Government postal service</li>
                <li><strong>M&P Express:</strong> Express delivery service</li>
                <li><strong>Local Transport:</strong> For bulk orders within cities</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Delivery Timeframes
              </h2>
              <p className="mb-4 text-foreground">
                Typical delivery times within Pakistan:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li><strong>Same City:</strong> 1-2 business days</li>
                <li><strong>Major Cities:</strong> 2-3 business days</li>
                <li><strong>Other Cities:</strong> 3-5 business days</li>
                <li><strong>Remote Areas:</strong> 5-7 business days</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Shipping Costs
              </h2>
              <p className="mb-6 text-foreground">
                Shipping costs vary based on product weight, dimensions, destination, and chosen courier service. Most suppliers provide shipping cost estimates before order confirmation.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Order Tracking
              </h2>
              <p className="mb-6 text-foreground">
                Once your order is shipped, the supplier will provide tracking information. You can monitor your order status through our platform or directly with the courier service.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Shipping Issues
              </h2>
              <p className="mb-6 text-foreground">
                For any shipping-related issues, please contact the supplier directly. If you need assistance resolving shipping disputes, our support team can help facilitate communication.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Contact Us
              </h2>
              <p className="mb-4 text-foreground">
                For questions about shipping policies or order-related issues:
              </p>
              <div className="p-4 bg-pakistani_green-50 rounded-lg">
                <p className="text-foreground"><strong>Email:</strong> khizercoding.com</p>
                <p className="text-foreground"><strong>Phone:</strong> +92 3149388513</p>
                <p className="text-foreground"><strong>Address:</strong> Mardan, Pakistan</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;