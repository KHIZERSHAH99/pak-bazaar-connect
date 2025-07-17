import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4 font-poppins">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground font-poppins">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="p-8">
            <div className="prose prose-lg max-w-none font-poppins">
              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Information We Collect
              </h2>
              <p className="mb-6 text-foreground">
                At Pak Bazaar Connect, we collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support.
              </p>

              <h3 className="text-xl font-semibold text-pakistani_green-600 mb-3">
                Personal Information
              </h3>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Name and contact information</li>
                <li>Business information and credentials</li>
                <li>Payment information</li>
                <li>Transaction history</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                How We Use Your Information
              </h2>
              <p className="mb-6 text-foreground">
                We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Information Sharing
              </h2>
              <p className="mb-6 text-foreground">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in specific circumstances outlined in this policy.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Data Security
              </h2>
              <p className="mb-6 text-foreground">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Contact Us
              </h2>
              <p className="text-foreground">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-pakistani_green-50 rounded-lg">
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

export default PrivacyPolicy;