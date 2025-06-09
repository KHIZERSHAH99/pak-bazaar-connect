
import React from 'react';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { MapPin, Phone, Mail } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-pakistani_green-800 mb-6 font-poppins">Contact Us</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-pakistani_green-100 p-3 rounded-full">
                  <MapPin className="h-6 w-6 text-pakistani_green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 font-poppins">Address</h3>
                  <p className="text-gray-600 font-poppins">
                    Pakistan B2B Connect<br />
                    Office #12, Mardan<br />
                    Khyber Pakhtunkhwa, Pakistan
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-pakistani_green-100 p-3 rounded-full">
                  <Phone className="h-6 w-6 text-pakistani_green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 font-poppins">Phone</h3>
                  <a href="tel:+923418337167" className="text-pakistani_green-600 hover:text-pakistani_green-800 font-poppins">
                    +92 341 833 7167
                  </a>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="bg-pakistani_green-100 p-3 rounded-full">
                  <Mail className="h-6 w-6 text-pakistani_green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 font-poppins">Email</h3>
                  <a href="mailto:khizerfight@gmail.com" className="text-pakistani_green-600 hover:text-pakistani_green-800 font-poppins">
                    khizerfight@gmail.com
                  </a>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 font-poppins">Business Hours</h3>
              <div className="space-y-2 text-gray-600 font-poppins">
                <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
              
              <div className="mt-6">
                <h4 className="font-semibold text-gray-800 mb-2 font-poppins">For Support</h4>
                <p className="text-gray-600 font-poppins">
                  Email us at{' '}
                  <a href="mailto:pakbazarconnect@gmail.com" className="text-pakistani_green-600 hover:text-pakistani_green-800 underline">
                    pakbazarconnect@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Contact;
