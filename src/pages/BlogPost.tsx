import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, Clock, ArrowLeft, Share2 } from 'lucide-react';

const BlogPost = () => {
  const { id } = useParams();
  
  // In a real app, you'd fetch the post data based on the ID
  const blogPosts = {
    '1': {
      title: "How to Find the Right Supplier in Pakistan",
      content: `
        <h2>Understanding the Pakistani B2B Market</h2>
        <p>Pakistan's B2B marketplace is diverse and rapidly growing, with opportunities across multiple sectors. Finding the right supplier requires careful research and due diligence to ensure long-term business success.</p>
        
        <h3>1. Verify Business Credentials</h3>
        <p>Before engaging with any supplier, verify their business registration with SECP (Securities and Exchange Commission of Pakistan). Check their NTN (National Tax Number) and ensure they have proper licenses for their industry.</p>
        
        <h3>2. Assess Product Quality</h3>
        <p>Request samples before placing large orders. Pakistani manufacturers are known for quality in textiles, surgical instruments, sports goods, and agricultural products. Always test products against your quality standards.</p>
        
        <h3>3. Check References and Reviews</h3>
        <p>Contact previous clients and check online reviews. Reliable suppliers will readily provide references. Look for suppliers with consistent positive feedback and long-term business relationships.</p>
        
        <h3>4. Evaluate Communication</h3>
        <p>Effective communication is crucial for successful partnerships. Suppliers should respond promptly, understand your requirements clearly, and provide regular updates on orders and deliveries.</p>
        
        <h3>5. Consider Location and Logistics</h3>
        <p>Proximity to major cities like Karachi, Lahore, and Faisalabad often means better infrastructure and logistics capabilities. Consider shipping costs and delivery times when choosing suppliers.</p>
        
        <h3>6. Financial Stability</h3>
        <p>Assess the supplier's financial health through bank references or financial statements. Stable suppliers are more likely to fulfill long-term contracts and maintain consistent quality.</p>
        
        <h2>Red Flags to Avoid</h2>
        <ul>
          <li>Suppliers demanding full payment upfront without established trust</li>
          <li>Lack of proper business documentation</li>
          <li>Unwillingness to provide samples or references</li>
          <li>Poor communication or delayed responses</li>
          <li>Prices significantly below market rates without explanation</li>
        </ul>
        
        <h2>Building Long-term Relationships</h2>
        <p>Successful B2B relationships in Pakistan are built on trust, mutual respect, and consistent communication. Start with smaller orders to test reliability, then gradually increase volumes as confidence builds.</p>
      `,
      author: "Ahmad Ali",
      date: "2024-01-15",
      readTime: "8 min read",
      category: "Business Guide",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop"
    },
    '2': {
      title: "Top 10 Wholesale Niches in Pakistan for 2024",
      content: `
        <h2>Pakistan's Most Profitable Wholesale Sectors</h2>
        <p>Pakistan's economy offers diverse opportunities for wholesale businesses. Here are the top 10 niches showing strong growth potential in 2024.</p>
        
        <h3>1. Textile and Garments</h3>
        <p>Pakistan is the world's 4th largest cotton producer. The textile sector contributes 8.5% to GDP and 57% to total exports. Cotton fabrics, ready-made garments, and home textiles offer excellent opportunities.</p>
        
        <h3>2. Electronics and Mobile Accessories</h3>
        <p>With smartphone penetration growing rapidly, demand for mobile accessories, chargers, cases, and electronic components continues to rise. Karachi and Lahore are major distribution hubs.</p>
        
        <h3>3. Food Products and Spices</h3>
        <p>Pakistani rice, especially Basmati, has global demand. Spices, dried fruits, and processed foods offer both domestic and export opportunities. Punjab and Sindh are key production areas.</p>
        
        <h3>4. Surgical Instruments</h3>
        <p>Sialkot produces 20% of the world's surgical instruments. These precision-made tools are exported to over 180 countries, offering premium wholesale opportunities.</p>
        
        <h3>5. Leather Goods</h3>
        <p>Pakistan is among the top 5 leather producers globally. Karachi and Kasur specialize in leather garments, footwear, and goods with strong international demand.</p>
        
        <h3>6. Sports Goods</h3>
        <p>Sialkot manufactures 70% of the world's soccer balls and significant portions of hockey sticks, cricket equipment, and boxing gear. Global sports brands source from Pakistan.</p>
        
        <h3>7. Chemical and Pharmaceutical Products</h3>
        <p>Pakistan's pharmaceutical industry is growing at 15% annually. Chemical products for textiles, agriculture, and manufacturing offer substantial wholesale opportunities.</p>
        
        <h3>8. Agricultural Machinery</h3>
        <p>Increasing mechanization in agriculture drives demand for tractors, harvesters, and farming equipment. Local manufacturing and imports both offer opportunities.</p>
        
        <h3>9. Construction Materials</h3>
        <p>Rapid urbanization and infrastructure development fuel demand for cement, steel, tiles, and construction equipment across major cities.</p>
        
        <h3>10. Handicrafts and Home Décor</h3>
        <p>Pakistani handicrafts, carpets, and home décor items have unique appeal in international markets. Artisanal products from different regions offer niche opportunities.</p>
        
        <h2>Market Entry Strategies</h2>
        <p>Each niche requires different approaches. Research local suppliers, understand quality standards, and consider seasonal demand patterns. Start with proven products before exploring niche items.</p>
      `,
      author: "Fatima Khan",
      date: "2024-01-10",
      readTime: "12 min read",
      category: "Market Analysis",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop"
    },
    '3': {
      title: "Why B2B Marketplaces Are the Future for Small Businesses",
      content: `
        <h2>Digital Transformation in Pakistani B2B</h2>
        <p>Digital B2B marketplaces are revolutionizing how small businesses operate in Pakistan. These platforms offer unprecedented opportunities for growth and market access.</p>
        
        <h3>Breaking Geographical Barriers</h3>
        <p>Traditional B2B required physical presence or extensive travel. Digital marketplaces allow businesses in remote areas to access customers nationwide, expanding market reach significantly.</p>
        
        <h3>Reduced Marketing Costs</h3>
        <p>Digital platforms eliminate expensive traditional advertising. Small businesses can showcase products professionally without costly showrooms or sales teams, leveling the playing field with larger competitors.</p>
        
        <h3>Direct Buyer-Seller Communication</h3>
        <p>Platforms enable direct communication between buyers and sellers, eliminating intermediaries. This reduces costs, improves margins, and builds stronger business relationships.</p>
        
        <h3>Secure Payment Systems</h3>
        <p>Digital platforms provide secure payment gateways, escrow services, and dispute resolution mechanisms. This reduces payment risks and builds trust between unknown parties.</p>
        
        <h3>Professional Product Catalogs</h3>
        <p>Small businesses can create professional product catalogs with high-quality images, detailed specifications, and competitive pricing, competing effectively with larger companies.</p>
        
        <h3>Data-Driven Insights</h3>
        <p>Platforms provide analytics on customer behavior, popular products, and market trends. This data helps small businesses make informed decisions about inventory and pricing.</p>
        
        <h3>Mobile Accessibility</h3>
        <p>Mobile-optimized platforms allow business operations from anywhere. Sellers can manage orders, respond to inquiries, and track payments using smartphones, increasing operational efficiency.</p>
        
        <h3>Global Market Access</h3>
        <p>Digital platforms can connect Pakistani businesses with international buyers, opening export opportunities previously accessible only to large corporations.</p>
        
        <h2>Success Factors for Small Businesses</h2>
        <ul>
          <li>Maintain high-quality product images and descriptions</li>
          <li>Respond quickly to customer inquiries</li>
          <li>Build positive reviews and ratings</li>
          <li>Offer competitive pricing and terms</li>
          <li>Provide excellent customer service</li>
          <li>Use platform analytics to optimize strategies</li>
        </ul>
        
        <h2>Future Outlook</h2>
        <p>As internet penetration increases and digital literacy improves, B2B marketplaces will become the primary channel for business transactions in Pakistan. Early adopters will gain significant competitive advantages.</p>
      `,
      author: "Hassan Sheikh",
      date: "2024-01-05",
      readTime: "10 min read",
      category: "Digital Transformation",
      image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=800&h=400&fit=crop"
    },
    '4': {
      title: "Essential Tips for B2B Payment Security in Pakistan",
      content: `
        <h2>Securing B2B Transactions in Pakistan</h2>
        <p>Payment security is crucial for successful B2B operations. Pakistan's evolving financial landscape requires careful attention to transaction security and fraud prevention.</p>
        
        <h3>Verify Buyer Credentials</h3>
        <p>Always verify buyer business registration, NTN, and bank details before processing orders. Check company profiles on official databases and request trade references from previous suppliers.</p>
        
        <h3>Use Escrow Services</h3>
        <p>For high-value transactions, consider escrow services provided by banks or trusted third parties. This protects both buyer and seller by holding funds until delivery confirmation.</p>
        
        <h3>Bank Transfer Best Practices</h3>
        <p>Use established banks for transfers and maintain detailed transaction records. Avoid cash payments for large amounts as they lack proper documentation for accounting and legal purposes.</p>
        
        <h3>Digital Payment Platforms</h3>
        <p>Modern payment platforms offer dispute resolution, transaction tracking, and fraud protection. JazzCash, EasyPaisa, and bank digital services provide additional security layers.</p>
        
        <h3>Documentation Requirements</h3>
        <p>Maintain comprehensive records including invoices, delivery receipts, payment confirmations, and communication logs. Proper documentation is essential for dispute resolution and legal protection.</p>
        
        <h3>Trade Credit Insurance</h3>
        <p>Consider trade credit insurance for large orders or new customers. This protects against buyer default and provides additional security for extended payment terms.</p>
        
        <h3>Clear Payment Terms</h3>
        <p>Establish clear payment terms upfront including amounts, schedules, penalties for late payment, and dispute resolution procedures. Written agreements prevent misunderstandings.</p>
        
        <h3>Regular Communication</h3>
        <p>Maintain regular contact with buyers to monitor payment schedules and identify potential issues early. Proactive communication often prevents payment problems.</p>
        
        <h2>Common Security Threats</h2>
        <ul>
          <li>Fraudulent company registrations</li>
          <li>Fake bank guarantees or letters of credit</li>
          <li>Payment card fraud</li>
          <li>Wire transfer fraud</li>
          <li>Identity theft and impersonation</li>
        </ul>
        
        <h2>Red Flags to Watch</h2>
        <p>Be cautious of buyers requesting unusual payment methods, offering overpayment with refund requests, or rushing transactions without proper verification procedures.</p>
        
        <h2>Legal Recourse</h2>
        <p>Understand your legal options for payment disputes. Pakistan's commercial courts handle business disputes, and proper documentation strengthens your position in any legal proceedings.</p>
      `,
      author: "Dr. Sarah Ahmed",
      date: "2024-01-01",
      readTime: "15 min read",
      category: "Security & Finance",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=400&fit=crop"
    }
  };

  const post = blogPosts[id as keyof typeof blogPosts];

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
          <Link to="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${post.title} - Pak Bazaar Connect Blog`}
      description={post.content.substring(0, 150).replace(/<[^>]*>/g, '')}
      keywords="Pakistan business, B2B guide, wholesale tips, supplier advice"
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Image */}
        <div className="relative h-64 md:h-96 overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
              <Link to="/blog">
                <Button variant="ghost" className="text-white hover:bg-white/20 mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <div className="p-8 md:p-12">
                {/* Article Header */}
                <div className="mb-8">
                  <Badge variant="secondary" className="mb-4 font-poppins">
                    {post.category}
                  </Badge>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6 font-poppins">
                    {post.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="font-poppins">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span className="font-poppins">{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span className="font-poppins">{post.readTime}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="ml-auto">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Article Body */}
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none font-poppins"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />

                {/* Call to Action */}
                <div className="mt-12 p-6 bg-pakistani_green-50 dark:bg-pakistani_green-950 rounded-lg">
                  <h3 className="text-xl font-bold text-pakistani_green-900 dark:text-pakistani_green-100 mb-3 font-poppins">
                    Ready to Start Your B2B Journey?
                  </h3>
                  <p className="text-pakistani_green-700 dark:text-pakistani_green-300 mb-4 font-poppins">
                    Join thousands of businesses already growing with Pak Bazaar Connect.
                  </p>
                  <Link to="/signup">
                    <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins">
                      Get Started Today
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>

            {/* Related Articles */}
            <div className="mt-12">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 font-poppins">
                Related Articles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link to="/blog/1">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-2 font-poppins">
                        How to Find the Right Supplier in Pakistan
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-poppins">
                        A comprehensive guide to finding reliable suppliers...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
                <Link to="/blog/2">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <h4 className="font-semibold text-lg mb-2 font-poppins">
                        Top 10 Wholesale Niches in Pakistan
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-poppins">
                        Discover the most profitable wholesale niches...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;