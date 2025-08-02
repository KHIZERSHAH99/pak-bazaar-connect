import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "How to Find the Right Supplier in Pakistan",
      excerpt: "A comprehensive guide to finding reliable suppliers for your business in Pakistan's growing B2B marketplace.",
      content: "Finding the right supplier is crucial for any business success. In Pakistan's diverse market, there are several key factors to consider when selecting suppliers. First, verify their credentials and business registration. Check their track record with other businesses and ask for references. Quality certifications like ISO standards can indicate reliability. Location matters too - suppliers closer to major cities often have better logistics. Communication is vital - ensure they respond promptly and understand your requirements clearly.",
      author: "Ahmad Ali",
      date: "2024-01-15",
      readTime: "8 min read",
      category: "Business Guide",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Top 10 Wholesale Niches in Pakistan for 2024",
      excerpt: "Discover the most profitable wholesale niches in Pakistan's market and how to capitalize on emerging trends.",
      content: "Pakistan's wholesale market offers numerous opportunities across various sectors. Textile and garments remain the largest export sector, with cotton products leading the way. Electronics and mobile accessories show rapid growth due to increasing smartphone adoption. Food products, especially rice, spices, and processed foods, have strong domestic and export demand. Surgical instruments from Sialkot are world-renowned for quality. Leather goods from Karachi and Kasur maintain strong international demand. Sports goods, particularly from Sialkot, serve global markets. Chemical and pharmaceutical products are growing sectors. Agricultural machinery has rising demand. Home textiles and handicrafts offer unique opportunities.",
      author: "Fatima Khan",
      date: "2024-01-10",
      readTime: "12 min read",
      category: "Market Analysis",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Why B2B Marketplaces Are the Future for Small Businesses",
      excerpt: "Learn how digital B2B platforms are transforming small business operations and creating new growth opportunities.",
      content: "B2B marketplaces are revolutionizing how small businesses operate in Pakistan. Digital platforms eliminate geographical barriers, allowing small suppliers to reach customers nationwide. Reduced marketing costs make it affordable for small businesses to compete with larger companies. Direct communication between buyers and sellers improves trust and reduces transaction costs. Online payment systems provide security and transparency. Digital catalogs showcase products professionally without expensive physical showrooms. Data analytics help businesses understand market trends and customer preferences. Mobile accessibility ensures business can continue anywhere, anytime.",
      author: "Hassan Sheikh",
      date: "2024-01-05",
      readTime: "10 min read",
      category: "Digital Transformation",
      image: "https://images.unsplash.com/photo-1553484771-371a605b060b?w=600&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Essential Tips for B2B Payment Security in Pakistan",
      excerpt: "Best practices for secure payment processing and fraud prevention in B2B transactions across Pakistan.",
      content: "Payment security is paramount in B2B transactions. Always verify buyer credentials before processing large orders. Use escrow services for high-value transactions to protect both parties. Bank transfers through legitimate financial institutions provide transaction trails. Avoid cash payments for large amounts - they lack proper documentation. Digital payment platforms offer dispute resolution mechanisms. Keep detailed records of all transactions for accounting and legal purposes. Consider trade credit insurance for large orders. Establish clear payment terms upfront to avoid disputes. Regular communication with buyers helps identify potential issues early.",
      author: "Dr. Sarah Ahmed",
      date: "2024-01-01",
      readTime: "15 min read",
      category: "Security & Finance",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop"
    }
  ];

  return (
    <Layout
      title="Business Insights Blog - Pak Bazaar Connect"
      description="Expert insights, guides, and market analysis for Pakistan's B2B marketplace. Learn from industry experts and grow your business."
      keywords="Pakistan business blog, B2B insights, wholesale guides, supplier tips, Pakistan trade"
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-pakistani_green-600 to-pakistani_green-800 text-white py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-poppins">
                Business Insights & Guides
              </h1>
              <p className="text-xl text-green-100 font-poppins">
                Expert insights and practical guides for Pakistan's B2B marketplace
              </p>
            </div>
          </div>
        </div>

        {/* Blog Posts */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <Badge variant="secondary" className="font-poppins">
                      {post.category}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span className="font-poppins">{new Date(post.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-poppins">{post.readTime}</span>
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold hover:text-pakistani_green-600 transition-colors font-poppins">
                    <Link to={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-300 font-poppins">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4" />
                      <span className="font-poppins">{post.author}</span>
                    </div>
                    <Link to={`/blog/${post.id}`}>
                      <Button variant="ghost" size="sm" className="text-pakistani_green-600 hover:text-pakistani_green-700 font-poppins">
                        Read More
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Newsletter Signup */}
          <div className="mt-16">
            <Card className="bg-gradient-to-r from-pakistani_green-50 to-green-50 dark:from-pakistani_green-950 dark:to-green-950 border-pakistani_green-200 dark:border-pakistani_green-800">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-pakistani_green-900 dark:text-pakistani_green-100 mb-4 font-poppins">
                  Stay Updated with Business Insights
                </h3>
                <p className="text-pakistani_green-700 dark:text-pakistani_green-300 mb-6 font-poppins">
                  Get the latest market trends, business tips, and industry insights delivered to your inbox.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 rounded-lg border border-pakistani_green-300 focus:outline-none focus:ring-2 focus:ring-pakistani_green-500 font-poppins"
                  />
                  <Button className="bg-pakistani_green-600 hover:bg-pakistani_green-700 text-white font-poppins">
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;