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
                At Pak Bazaar Connect, we are committed to protecting your privacy and ensuring the security of your personal information. As Pakistan's leading B2B marketplace, we collect various types of information to provide you with the best possible service and to facilitate secure business transactions between wholesalers and retailers.
              </p>

              <h3 className="text-xl font-semibold text-pakistani_green-600 mb-3">
                Personal Information
              </h3>
              <p className="mb-4 text-foreground">
                We collect personal information that you provide directly to us when you register for an account, create a business profile, place orders, or communicate with us. This includes:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Name, email address, and phone number for account creation and communication</li>
                <li>Business information including company name, registration details, and tax identification</li>
                <li>Physical business address and contact information for verification purposes</li>
                <li>Payment information and banking details for transaction processing</li>
                <li>Transaction history and order details for record keeping and analytics</li>
                <li>Profile pictures, business logos, and other media you choose to upload</li>
                <li>Communication preferences and marketing consent settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-primary mb-3">
                Automatically Collected Information
              </h3>
              <p className="mb-4 text-foreground">
                We automatically collect certain information when you use our platform to improve your experience and ensure security:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>Device information, IP address, browser type, and operating system</li>
                <li>Usage patterns, page views, and time spent on different sections</li>
                <li>Location data (with your permission) for better local service recommendations</li>
                <li>Cookies and similar tracking technologies for personalization</li>
                <li>Search queries and interaction with product listings</li>
                <li>Performance data to optimize our platform's functionality</li>
              </ul>

              <h2 className="text-2xl font-semibold text-primary mb-4">
                How We Use Your Information
              </h2>
              <p className="mb-4 text-foreground">
                We use the information we collect for various business purposes that benefit both our users and the broader Pakistani B2B ecosystem:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li>To provide and maintain our B2B marketplace services and platform functionality</li>
                <li>To process transactions, manage orders, and facilitate payments between businesses</li>
                <li>To verify business credentials and prevent fraudulent activities</li>
                <li>To communicate with you about your account, orders, and our services</li>
                <li>To improve our platform based on user feedback and usage patterns</li>
                <li>To develop new features and services that benefit the Pakistani business community</li>
                <li>To comply with legal obligations and resolve disputes</li>
                <li>To send you relevant marketing communications (with your explicit consent)</li>
                <li>To provide customer support and technical assistance</li>
                <li>To conduct market research and business analytics</li>
              </ul>

              <h2 className="text-2xl font-semibold text-primary mb-4">
                Information Sharing and Disclosure
              </h2>
              <p className="mb-4 text-foreground">
                We respect your privacy and do not sell your personal information to third parties. However, we may share your information in specific circumstances:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li><strong>With business partners:</strong> To facilitate transactions and business connections within our marketplace</li>
                <li><strong>Service providers:</strong> Third-party vendors who help us operate our platform (payment processors, hosting services, etc.)</li>
                <li><strong>Legal compliance:</strong> When required by Pakistani law or to protect our legal rights and those of our users</li>
                <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales (with appropriate user notification)</li>
                <li><strong>With your consent:</strong> Any other sharing that you explicitly authorize</li>
                <li><strong>Emergency situations:</strong> To protect the safety and security of our users and platform</li>
              </ul>

              <h2 className="text-2xl font-semibold text-primary mb-4">
                Data Security and Protection
              </h2>
              <p className="mb-6 text-foreground">
                We implement comprehensive security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. Our security practices include encryption of sensitive data, secure servers with regular backups, access controls and authentication systems, regular security assessments and updates, compliance with international security standards, and staff training on data protection protocols. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>

              <h2 className="text-2xl font-semibold text-primary mb-4">
                Your Rights and Choices
              </h2>
              <p className="mb-4 text-foreground">
                As a user of Pak Bazaar Connect, you have several rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 mb-6 text-foreground">
                <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                <li><strong>Correction:</strong> Update or correct any inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information (subject to legal requirements)</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service provider</li>
                <li><strong>Withdrawal:</strong> Withdraw consent for data processing at any time</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
                <li><strong>Restriction:</strong> Request limitation of processing under certain circumstances</li>
              </ul>

              <h2 className="text-2xl font-semibold text-primary mb-4">
                Cookies and Tracking Technologies
              </h2>
              <p className="mb-6 text-foreground">
                We use cookies and similar technologies to enhance your experience on our platform. Cookies help us remember your preferences, analyze site traffic, provide personalized content, and improve our services. You can control cookie settings through your browser preferences, but disabling cookies may affect the functionality of certain features on our platform.
              </p>

              <h2 className="text-2xl font-semibold text-primary mb-4">
                International Data Transfers
              </h2>
              <p className="mb-6 text-foreground">
                While our primary operations are based in Pakistan, we may transfer your data to other countries for processing or storage. When we do so, we ensure appropriate safeguards are in place to protect your personal information in accordance with applicable data protection laws.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Children's Privacy
              </h2>
              <p className="mb-6 text-foreground">
                Our services are designed for businesses and individuals who are at least 18 years old. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>

              <h2 className="text-2xl font-semibold text-pakistani_green-700 mb-4">
                Contact Us
              </h2>
              <p className="mb-4 text-foreground">
                If you have any questions about this Privacy Policy, our data practices, or your rights regarding your personal information, please contact us through any of the following methods:
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