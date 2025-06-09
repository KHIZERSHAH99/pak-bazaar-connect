
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

const ShippingPolicy: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-pakistani_green-800 mb-6 font-poppins">Shipping / Service Policy</h1>
          
          <div className="prose max-w-none space-y-6 font-poppins">
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We connect wholesalers and buyers across Pakistan through our digital marketplace. 
                Our sellers are responsible for shipping the products directly to the buyers.
              </p>
              
              <p>
                Shipping details (duration, method, fees) are mentioned on each product listing. 
                If you have any shipping-related issues, please contact the seller directly or reach out to us at{' '}
                <a href="mailto:pakbazarconnect@gmail.com" className="text-pakistani_green-600 hover:text-pakistani_green-800 underline">
                  pakbazarconnect@gmail.com
                </a>.
              </p>
              
              <p>
                We do not charge customers for delivery — delivery charges (if any) are set by individual sellers.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;
