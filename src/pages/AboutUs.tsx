import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Award, Shield } from 'lucide-react';
const AboutUs: React.FC = () => {
  return <Layout title="About Us - Pak Bazaar Connect" description="Learn about Pak Bazaar Connect — Pakistan's modern B2B marketplace connecting wholesalers and retailers for seamless trade.">
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-foreground mb-6 font-poppins">About PakBazaar Connect</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-poppins leading-relaxed">
              Connecting Pakistani wholesalers and retailers through a modern, secure, and efficient B2B marketplace. 
              Empowering businesses to grow together.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <Card className="h-full">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Target className="w-8 h-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold font-poppins">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed font-poppins">
                   To revolutionize B2B commerce in Pakistan by providing a transparent, efficient, and trustworthy 
                   platform that connects wholesalers with retailers, enabling business growth and economic prosperity 
                   across the country.
                </p>
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  <Award className="w-8 h-8 text-primary mr-3" />
                  <h2 className="text-2xl font-bold font-poppins">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed font-poppins">
                  To become Pakistan's leading B2B marketplace, fostering a thriving ecosystem where businesses 
                  of all sizes can discover opportunities, build partnerships, and achieve sustainable growth 
                  through technology and innovation.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* What We Do */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 font-poppins text-foreground">What We Do</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 font-poppins">Connect Businesses</h3>
                   <p className="text-muted-foreground font-poppins">
                    We bridge the gap between wholesalers and retailers, creating meaningful business relationships 
                    that drive mutual growth and success.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 font-poppins">Ensure Security</h3>
                   <p className="text-muted-foreground font-poppins">
                    Our platform employs advanced security measures and verification processes to ensure 
                    safe and trustworthy transactions for all users.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 font-poppins">Drive Growth</h3>
                  <p className="text-muted-foreground font-poppins">
                    Through our comprehensive tools and analytics, we help businesses make informed decisions 
                    and optimize their operations for maximum efficiency.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Company Story */}
          <Card className="mb-16">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-6 font-poppins text-center">Our Story</h2>
              <div className="prose max-w-none">
                <p className="text-muted-foreground mb-4 font-poppins leading-relaxed">
                   PakBazaar Connect was founded with a simple yet powerful vision: to transform the way businesses 
                   interact and trade in Pakistan. Recognizing the challenges faced by both wholesalers and retailers 
                   in finding reliable partners and conducting efficient transactions, we set out to create a platform 
                   that would bridge these gaps.
                </p>
                <p className="text-muted-foreground mb-4 font-poppins leading-relaxed">
                   Our platform emerged from understanding the unique needs of Pakistani businesses. We recognized 
                   that traditional methods of B2B commerce were often inefficient, time-consuming, and lacked 
                   transparency. This insight drove us to develop a modern, technology-driven solution that addresses 
                   these pain points while respecting local business practices and cultural nuances.
                </p>
                <p className="text-muted-foreground font-poppins leading-relaxed">
                   Today, PakBazaar Connect serves as a trusted intermediary, facilitating thousands of successful 
                   business connections and transactions. We continue to evolve and improve our platform, always 
                   keeping our users' success at the heart of everything we do.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Values */}
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-12 font-poppins">Our Core Values</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 font-poppins">Trust</h3>
                <p className="text-sm text-gray-600 font-poppins">Building lasting relationships through transparency and reliability</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 font-poppins">Collaboration</h3>
                <p className="text-sm text-gray-600 font-poppins">Fostering partnerships that benefit all stakeholders</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 font-poppins">Excellence</h3>
                <p className="text-sm text-gray-600 font-poppins">Continuously improving to deliver exceptional value</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2 font-poppins">Innovation</h3>
                <p className="text-sm text-gray-600 font-poppins">Leveraging technology to solve real business challenges</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>;
};
export default AboutUs;