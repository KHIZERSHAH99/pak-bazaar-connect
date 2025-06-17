
import React from 'react';
import Layout from '@/components/Layout';

const TermsOfService: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-pakistani_green-800 mb-6 font-poppins">Terms of Service</h1>
        
        <div className="prose max-w-none space-y-6 font-poppins">
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using Pak Bazaar Connect, you accept and agree to be bound by the 
              terms and provision of this agreement.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Accounts</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>You must provide accurate and complete information when creating an account</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You must be a legitimate business entity to use our platform</li>
              <li>One email can be used for multiple roles (wholesaler and seller)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Platform Usage</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Use the platform only for legitimate business purposes</li>
              <li>Do not post false or misleading product information</li>
              <li>Respect intellectual property rights</li>
              <li>Comply with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Commission and Payments</h2>
            <p className="text-gray-700 mb-4">
              Our platform charges a 2.5% commission on successful transactions. Payments are 
              processed securely through JazzCash.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Prohibited Activities</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Fraudulent or deceptive practices</li>
              <li>Violating any applicable laws</li>
              <li>Interfering with platform operations</li>
              <li>Harassment or abuse of other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700">
              Pak Bazaar Connect shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <p className="text-gray-700">
              For any questions regarding these Terms of Service, please contact us at{' '}
              <a href="mailto:khizercoding.com" className="text-pakistani_green-600 hover:text-pakistani_green-700">
                khizercoding.com
              </a>{' '}
              or reach us at +92 3149388513.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default TermsOfService;
