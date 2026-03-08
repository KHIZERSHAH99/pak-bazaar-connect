import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <Layout 
      title="Contact Us - Pak Bazaar Connect"
      description="Get in touch with our team for sales inquiries, support, or partnerships."
    >
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4 font-poppins">
            Contact Our Team
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-poppins">
            Ready to grow your business with Pakistan's premier B2B marketplace? 
            Get in touch with our sales team today.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-poppins">
                <MessageSquare className="w-5 h-5" />
                Get in Touch
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground font-poppins">Email</h3>
                  <p className="text-muted-foreground font-poppins">sales@pakbazaarconnect.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground font-poppins">Phone</h3>
                  <p className="text-muted-foreground font-poppins">+92 300 1234567</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground font-poppins">Address</h3>
                  <p className="text-muted-foreground font-poppins">
                    Lahore, Punjab, Pakistan
                  </p>
                </div>
              </div>

              <div className="mt-8 p-4 bg-primary/5 rounded-lg">
                <h3 className="font-semibold text-foreground mb-2 font-poppins">
                  Business Hours
                </h3>
                <p className="text-muted-foreground font-poppins">
                  Monday - Friday: 9:00 AM - 6:00 PM PKT<br />
                  Saturday: 10:00 AM - 4:00 PM PKT<br />
                  Sunday: Closed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-poppins">Send Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1 font-poppins">
                      First Name
                    </label>
                    <Input placeholder="Enter your first name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1 font-poppins">
                      Last Name
                    </label>
                    <Input placeholder="Enter your last name" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 font-poppins">
                    Email
                  </label>
                  <Input type="email" placeholder="Enter your email" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 font-poppins">
                    Company
                  </label>
                  <Input placeholder="Enter your company name" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1 font-poppins">
                    Message
                  </label>
                  <Textarea 
                    placeholder="Tell us about your business needs..."
                    rows={5}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-poppins"
                >
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
