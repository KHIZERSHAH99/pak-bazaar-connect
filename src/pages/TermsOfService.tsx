
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

const TermsOfService: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-pakistani_green-800 mb-6 font-poppins">Terms & Conditions</h1>
          
          <div className="prose max-w-none space-y-6 font-poppins">
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
            
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>By using Pakistan B2B Connect, you agree to the following:</p>
              
              <ul className="list-disc pl-6 space-y-3">
                <li>Users must provide accurate business and contact information.</li>
                <li>Sellers are responsible for their listings, prices, delivery, and refunds.</li>
                <li>Buyers must verify products before confirming orders.</li>
                <li>We reserve the right to suspend any account found violating our policies.</li>
                <li>All disputes should be resolved between buyer and seller. Our platform will assist only in serious escalation cases.</li>
                <li>Use of our platform is at your own risk. We do not guarantee product quality, but we aim to ensure trust through seller reviews and buyer feedback.</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsOfService;
