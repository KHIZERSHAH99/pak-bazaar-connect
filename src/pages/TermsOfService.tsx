
import React from 'react';
import Layout from '@/components/Layout';

const TermsOfService: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-pakistani_green-800 dark:text-pakistani_green-300 mb-6 font-poppins">Terms of Service</h1>
        
        <div className="prose max-w-none space-y-6 font-poppins">
          <p className="text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              By accessing and using Pak Bazaar Connect, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Platform Description</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Pak Bazaar Connect is a B2B marketplace platform connecting wholesalers and sellers in Pakistan. We facilitate business transactions but are not party to the actual agreements between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">User Responsibilities</h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Provide accurate and truthful information during registration</li>
              <li>Maintain the security of your account credentials</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Respect intellectual property rights</li>
              <li>Conduct business transactions in good faith</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Prohibited Activities</h2>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Posting false, misleading, or fraudulent content</li>
              <li>Attempting to circumvent platform security measures</li>
              <li>Engaging in unfair business practices</li>
              <li>Violating any local, national, or international laws</li>
              <li>Harassing or abusing other platform users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Platform Fees</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Pak Bazaar Connect charges a commission on successful transactions:
            </p>
            <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-2">
              <li>Standard commission: 2.5% of transaction value</li>
              <li>Payment processing fees apply as per JazzCash terms</li>
              <li>Ad placement fees for premium visibility</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 dark:text-gray-300">
              All platform content, design, and functionality are owned by Pak Bazaar Connect and protected by Pakistani and international copyright laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 dark:text-gray-300">
              Pak Bazaar Connect is not liable for any direct, indirect, incidental, or consequential damages arising from platform use or business transactions between users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Governing Law</h2>
            <p className="text-gray-700 dark:text-gray-300">
              These terms are governed by the laws of Pakistan. Any disputes will be resolved through Pakistani courts or arbitration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Contact Information</h2>
            <p className="text-gray-700 dark:text-gray-300">
              For questions about these Terms of Service, contact us at{' '}
              <a href="mailto:khizercoding.com" className="text-pakistani_green-600 dark:text-pakistani_green-400 hover:text-pakistani_green-700 dark:hover:text-pakistani_green-300">
                khizercoding.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
