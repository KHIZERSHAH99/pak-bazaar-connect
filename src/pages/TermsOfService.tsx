import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4 font-poppins">
              Terms of Service
            </h1>
            <p className="text-muted-foreground font-poppins">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>

          <Card className="p-8">
            <div className="prose prose-lg max-w-none font-poppins">
              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Acceptance of Terms
              </h2>
              <p className="mb-6 text-foreground">
                By accessing and using Pak Bazaar Connect, you accept and agree to be bound by the terms and provision of this agreement.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                User Accounts
              </h2>
              <p className="mb-4 text-foreground">
                To access certain features of our platform, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your password</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Permitted Use
              </h2>
              <p className="mb-4 text-foreground">
                You may use our platform for legitimate business purposes only. Prohibited activities include:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Posting false or misleading information</li>
                <li>Engaging in fraudulent activities</li>
                <li>Violating any applicable laws or regulations</li>
                <li>Interfering with the platform's operation</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Transaction Terms
              </h2>
              <p className="mb-6 text-foreground">
                All transactions conducted through our platform are between buyers and sellers. Pak Bazaar Connect acts as a facilitator and is not party to the actual transaction.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Payment and Fees
              </h2>
              <p className="mb-6 text-foreground">
                Certain services may require payment of fees. All fees are non-refundable unless otherwise stated. We reserve the right to change our fee structure with notice.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Limitation of Liability
              </h2>
              <p className="mb-6 text-foreground">
                Pak Bazaar Connect shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Contact Information
              </h2>
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

export default TermsOfService;