
import React from 'react';
import Layout from '@/components/Layout';

const ShippingPolicy: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-pakistani_green-800 mb-6 font-poppins">Shipping & Delivery Policy</h1>
        
        <div className="prose max-w-none space-y-6 font-poppins">
          <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Order Processing</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Standard order processing time is 1-3 business days.</li>
              <li>Processing times may vary for bulk or custom orders. You will be notified of any significant delays.</li>
              <li>Orders are processed Monday through Saturday, excluding public holidays in Pakistan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shipping Methods & Costs</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>We partner with various local courier services to ensure reliable delivery across Pakistan.</li>
              <li>Shipping costs are calculated at checkout based on order weight, dimensions, and delivery location.</li>
              <li>Estimated delivery times are typically 3-7 business days after dispatch, depending on the destination.</li>
              <li>Expedited shipping options may be available at an additional cost for select areas.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Shipment Tracking</h2>
            <p className="text-gray-700">
              Once your order is dispatched, you will receive a shipping confirmation email with a tracking number and a link to the courier's website to monitor your shipment's progress.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">International Shipping</h2>
            <p className="text-gray-700">
              Currently, Pak Bazaar Connect primarily facilitates domestic B2B transactions within Pakistan. We do not offer international shipping as a standard service. Wholesalers and sellers may arrange international shipping independently.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Incorrect Address & Undeliverable Packages</h2>
            <p className="text-gray-700">
              Please ensure your shipping address is complete and accurate. Pak Bazaar Connect is not responsible for orders shipped to incorrect addresses provided by the buyer. If a package is returned as undeliverable, additional shipping fees may apply for re-shipment.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Contact Information</h2>
            <p className="text-gray-700">
              If you have any questions or concerns regarding our Shipping & Delivery Policy, please contact us at{' '}
              <a href="mailto:khizercoding.com" className="text-pakistani_green-600 hover:text-pakistani_green-700">
                khizercoding.com
              </a>{' '}
              or call us at +92 3149388513.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;
