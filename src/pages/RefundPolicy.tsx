import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

const RefundPolicy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4 font-poppins">
              Refund Policy
            </h1>
            <p className="text-muted-foreground font-poppins">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="p-8">
            <div className="prose prose-lg max-w-none font-poppins">
              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                General Refund Policy
              </h2>
              <p className="mb-6 text-foreground">
                At Pak Bazaar Connect, we facilitate B2B transactions between wholesalers and sellers. Refunds are handled directly between the buyer and seller according to their agreement.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Platform Service Fees
              </h2>
              <p className="mb-4 text-foreground">
                Service fees charged by Pak Bazaar Connect are generally non-refundable. However, we may consider refunds in the following cases:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Technical errors that prevented service delivery</li>
                <li>Duplicate charges due to system errors</li>
                <li>Services not delivered due to platform issues</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Transaction Disputes
              </h2>
              <p className="mb-6 text-foreground">
                For disputes related to product quality, delivery, or other transaction issues, please contact the seller directly. If resolution cannot be reached, our support team may assist in mediation.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                How to Request a Refund
              </h2>
              <p className="mb-4 text-foreground">
                To request a refund for platform services:
              </p>
              <ol className="list-decimal pl-6 mb-6 text-foreground">
                <li>Contact our support team within 7 days of the charge</li>
                <li>Provide your transaction details and reason for refund</li>
                <li>Allow 5-10 business days for review and processing</li>
              </ol>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Processing Time
              </h2>
              <p className="mb-6 text-foreground">
                Approved refunds will be processed within 7-14 business days and will appear in your original payment method.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Contact for Refunds
              </h2>
              <p className="mb-4 text-foreground">
                For refund requests or questions, please contact us:
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

export default RefundPolicy;