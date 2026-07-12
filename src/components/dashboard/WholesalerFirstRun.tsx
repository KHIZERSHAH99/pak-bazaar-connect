import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Store, Package, Wallet, ArrowRight } from 'lucide-react';

/**
 * Phase 1 — First-run wizard for wholesalers.
 * Big Urdu + Roman labels, low-friction "next step" surfacing.
 * Auto-hides once all three setup steps are complete.
 */
const WholesalerFirstRun: React.FC = () => {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['wholesaler-first-run', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: shops } = await supabase
        .from('shops').select('id').eq('owner_id', user.id).limit(1);
      const shopIds = shops?.map((s) => s.id) ?? [];
      const hasShop = shopIds.length > 0;

      let hasProduct = false;
      if (hasShop) {
        const query = supabase.from('products').select('id').limit(1) as any;
        const { data: prods } = await query.in('shop_id', shopIds);
        hasProduct = (prods?.length ?? 0) > 0;
      }

      const { data: pm } = await supabase
        .from('payment_methods').select('id').eq('user_id', user.id).limit(1);
      const hasPayment = (pm?.length ?? 0) > 0;

      return { hasShop, hasProduct, hasPayment };
    },
    enabled: !!user,
    staleTime: 60_000,
  });

  if (isLoading || !data) return null;
  if (data.hasShop && data.hasProduct && data.hasPayment) return null;

  const steps = [
    {
      done: data.hasShop,
      icon: Store,
      ur: 'دکان بنائیں',
      roman: 'Dukaan banayein',
      en: 'Create your shop',
      to: '/dashboard/shops',
    },
    {
      done: data.hasProduct,
      icon: Package,
      ur: 'پہلا پروڈکٹ لگائیں',
      roman: 'Pehla product lagayein',
      en: 'Add your first product',
      to: '/dashboard/products',
    },
    {
      done: data.hasPayment,
      icon: Wallet,
      ur: 'پیسے وصول کرنے کا طریقہ',
      roman: 'Paise wasool karne ka tareeqa',
      en: 'Set up a payment method',
      to: '/dashboard/payment',
    },
  ];

  const completed = steps.filter((s) => s.done).length;
  const pct = Math.round((completed / steps.length) * 100);

  return (
    <Card className="p-4 sm:p-6 border-border bg-gradient-to-br from-primary/5 via-background to-yellow-300/5">
      <div className="flex items-center justify-between mb-4 gap-3">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold font-poppins">
            آپ کا دکاندار سفر شروع کریں
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground font-poppins">
            Get set up in 3 easy steps — {completed}/{steps.length} complete
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-14 h-14 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <span className="text-sm font-bold font-poppins">{pct}%</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {steps.map((s) => {
          const Icon = s.done ? CheckCircle2 : s.icon;
          return (
            <Link
              key={s.en}
              to={s.to}
              className={`group flex flex-col gap-2 p-4 rounded-lg border transition-all min-h-[120px] ${
                s.done
                  ? 'bg-primary/10 border-primary/30'
                  : 'bg-card border-border hover:border-primary hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon
                  className={`w-6 h-6 ${
                    s.done ? 'text-primary' : 'text-yellow-300'
                  }`}
                />
                {!s.done && (
                  <ArrowRight className="w-4 h-4 ml-auto text-muted-foreground group-hover:text-primary" />
                )}
              </div>
              <div>
                <div className="text-lg font-semibold font-poppins" dir="rtl">
                  {s.ur}
                </div>
                <div className="text-xs text-muted-foreground font-poppins">
                  {s.roman}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Card>
  );
};

export default WholesalerFirstRun;