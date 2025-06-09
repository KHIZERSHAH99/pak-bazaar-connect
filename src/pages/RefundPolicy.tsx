
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

const RefundPolicy: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-pakistani_green-800 mb-6 font-poppins">Return & Refund Policy</h1>
          
          <div className="prose max-w-none space-y-6 font-poppins">
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We aim to provide our customers with the highest level of satisfaction. 
                If you receive a damaged or incorrect product, please contact us within 7 days of delivery. 
                We will evaluate the issue and offer a replacement or refund.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Refunds are issued only for:</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Damaged items</li>
                <li>Incorrect items delivered</li>
                <li>Unfulfilled orders</li>
              </ul>
              
              <p className="mt-6">
                To request a return or refund, email us at{' '}
                <a href="mailto:pakbazarconnect@gmail.com" className="text-pakistani_green-600 hover:text-pakistani_green-800 underline">
                  pakbazarconnect@gmail.com
                </a>{' '}
                with your order number and a description of the issue.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
