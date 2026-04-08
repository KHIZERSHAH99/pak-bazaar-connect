import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Users, BadgeCheck, Truck, CreditCard } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

const TrustSignalsSection: React.FC = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState({ shops: 0, products: 0, orders: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [shopsRes, productsRes, ordersRes] = await Promise.all([
          supabase.from('shops_public_safe').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
        ]);
        setStats({
          shops: shopsRes.count || 0,
          products: productsRes.count || 0,
          orders: ordersRes.count || 0,
        });
      } catch (e) {
        console.error('Error fetching stats:', e);
      }
    };
    fetchStats();
  }, []);

  const isUrdu = language === 'ur';

  const trustPoints = [
    {
      icon: <BadgeCheck className="h-6 w-6" />,
      title: isUrdu ? 'تصدیق شدہ ہول سیلرز' : 'Verified Wholesalers',
      desc: isUrdu ? 'ہر سپلائر کی تصدیق ہوتی ہے' : 'Every supplier is verified before listing',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: isUrdu ? 'محفوظ لین دین' : 'Secure Transactions',
      desc: isUrdu ? 'آپ کی ادائیگی محفوظ ہے' : 'Your payments are tracked & protected',
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: isUrdu ? '0% پلیٹ فارم فیس' : '0% Platform Fee',
      desc: isUrdu ? 'خریدنا اور بیچنا مکمل مفت' : 'Completely free to buy and sell',
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: isUrdu ? 'پورے پاکستان میں ڈلیوری' : 'Nationwide Delivery',
      desc: isUrdu ? 'کراچی سے پشاور تک' : 'From Karachi to Peshawar',
    },
  ];

  // Format numbers nicely - show real numbers when small, rounded when large
  const formatStat = (n: number) => {
    if (n === 0) return '—';
    if (n < 100) return `${n}+`;
    if (n < 1000) return `${Math.floor(n / 10) * 10}+`;
    return `${(n / 1000).toFixed(1)}K+`;
  };

  return (
    <section className="py-10 md:py-16 bg-muted/30 border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Live Stats Bar */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-16 mb-10 md:mb-14">
          {[
            { value: formatStat(stats.shops), label: isUrdu ? 'رجسٹرڈ دکانیں' : 'Registered Shops' },
            { value: formatStat(stats.products), label: isUrdu ? 'پروڈکٹس' : 'Products Listed' },
            { value: formatStat(stats.orders), label: isUrdu ? 'آرڈرز مکمل' : 'Orders Completed' },
          ].map((stat, i) => (
            <div key={i} className="text-center min-w-[80px]">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary font-poppins">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground font-poppins mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Points Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {trustPoints.map((point, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center p-4 md:p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="bg-primary/10 p-3 rounded-full mb-3">
                <div className="text-primary">{point.icon}</div>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground font-poppins mb-1" dir={isUrdu ? 'rtl' : 'ltr'}>
                {point.title}
              </h3>
              <p className="text-xs text-muted-foreground font-poppins leading-relaxed" dir={isUrdu ? 'rtl' : 'ltr'}>
                {point.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Social Proof Line */}
        <div className="mt-8 md:mt-10 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-full px-4 py-2">
            <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-foreground font-poppins" dir={isUrdu ? 'rtl' : 'ltr'}>
              {isUrdu 
                ? 'کراچی الیکٹرانکس مارکیٹ کے ہول سیلرز کا بھروسہ' 
                : 'Trusted by electronics wholesalers in Karachi'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignalsSection;
