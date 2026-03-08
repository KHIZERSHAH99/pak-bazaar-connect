
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const RefundPolicy = () => {
  return (
    <Layout 
      title="Refund Policy - Pak Bazaar Connect"
      description="Refund policy for Pakistan's leading B2B marketplace"
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
              Refund Policy
            </h1>
            <p className="text-muted-foreground font-poppins">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="p-8">
            <div className="prose prose-lg max-w-none font-poppins">
              <h2 className="text-2xl font-semibold text-primary mb-4">
                Refund Eligibility
              </h2>
              <p className="mb-6 text-foreground">
                Refunds are available for orders that meet specific criteria within our return window.
              </p>

              <h3 className="text-xl font-semibold text-primary mb-3">
                Eligible Items
              </h3>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Products not as described</li>
                <li>Damaged items upon delivery</li>
                <li>Orders not fulfilled by wholesaler</li>
                <li>Quality issues with products</li>
              </ul>

              <h2 className="text-2xl font-semibold text-primary mb-4">
                Refund Process
              </h2>
              <p className="mb-6 text-foreground">
                To request a refund, contact our support team with your order details and reason for return.
              </p>

              <h2 className="text-2xl font-semibold text-primary mb-4">
                Processing Time
              </h2>
              <p className="mb-6 text-foreground">
                Refunds are typically processed within 5-7 business days after approval.
              </p>

              <div className="mt-4 p-4 bg-pakistani_green-50 rounded-lg">
                <p className="text-foreground"><strong>Support Email:</strong> khizercoding.com</p>
                <p className="text-foreground"><strong>Phone:</strong> +92 3149388513</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default RefundPolicy;
