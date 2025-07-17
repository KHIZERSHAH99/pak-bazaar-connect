
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  return (
    <Layout 
      title="Terms of Service - Pak Bazaar Connect"
      description="Terms of Service for Pakistan's leading B2B marketplace"
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

              <h3 className="text-xl font-semibold text-pakistani_green-600 mb-3">
                User Responsibilities
              </h3>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Provide accurate and truthful information</li>
                <li>Maintain the security of your account</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Respect other users and their intellectual property</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Platform Usage
              </h2>
              <p className="mb-6 text-foreground">
                Pak Bazaar Connect is a B2B marketplace designed to connect wholesalers and retailers in Pakistan. Users must be legitimate businesses to participate.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Prohibited Activities
              </h2>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Fraudulent or deceptive practices</li>
                <li>Unauthorized access to other accounts</li>
                <li>Spamming or unsolicited communications</li>
                <li>Violation of intellectual property rights</li>
              </ul>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Contact Information
              </h2>
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

export default TermsOfService;
