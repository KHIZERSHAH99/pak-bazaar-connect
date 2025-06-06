
import React from 'react';
import Layout from '@/components/Layout';

const RefundPolicy: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-pakistani_green-800 mb-6 font-poppins">Cancellation, Return & Refund Policy</h1>
        
        <div className="prose max-w-none space-y-6 font-poppins">
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Cancellation</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Orders can be cancelled within 24 hours of placement</li>
              <li>Cancellation after dispatch is subject to return policy</li>
              <li>Custom or personalized orders cannot be cancelled</li>
              <li>Bulk orders may have different cancellation terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Return Policy</h2>
            <p className="text-gray-700 mb-4">Returns are accepted under the following conditions:</p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Items must be returned within 7 days of delivery</li>
              <li>Products must be in original condition and packaging</li>
              <li>Return shipping costs are borne by the buyer unless the item is defective</li>
              <li>Perishable goods and custom orders are not returnable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Refund Process</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Refunds are processed within 7-14 business days</li>
              <li>Refunds are made to the original payment method</li>
              <li>Shipping charges are non-refundable except for defective items</li>
              <li>Platform commission (2.5%) is deducted from refunds</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Dispute Resolution</h2>
            <p className="text-gray-700 mb-4">
              In case of disputes between buyers and sellers:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Contact our support team within 48 hours</li>
              <li>Provide order details and evidence of the issue</li>
              <li>Our team will mediate to reach a fair resolution</li>
              <li>Final decisions are at the discretion of Pak Bazaar Connect</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact for Returns</h2>
            <p className="text-gray-700">
              For return requests, contact us at returns@pakbazaarconnect.com with your 
              order number and reason for return.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
