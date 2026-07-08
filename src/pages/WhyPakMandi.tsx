import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Store,
  ShoppingBag,
  ShieldCheck,
  Search,
  Wallet,
  Star,
  MessageSquare,
  TrendingUp,
  Users,
  Truck,
  FileText,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

const setMeta = (name: string, content: string) => {
  let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("name", name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const setOg = (property: string, content: string) => {
  let tag = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute("property", property);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const WhyPakMandi = () => {
  useEffect(() => {
    document.title = "Why PakMandi — Pakistan's Digital Wholesale Bazaar";
    setMeta(
      "description",
      "PakMandi is Pakistan's trust infrastructure for B2B trade — connecting wholesalers and retailers with verified profiles, transparent pricing, and digital order tracking."
    );
    setOg("og:title", "Why PakMandi — Pakistan's Digital Wholesale Bazaar");
    setOg(
      "og:description",
      "Discover, compare, and order from verified wholesalers across Pakistan. Built for how traditional trade actually works."
    );
    setOg("og:type", "website");

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "PakMandi",
      url: "https://pakmandi.com",
      description:
        "B2B wholesale marketplace connecting Pakistani wholesalers and retailers.",
    });
    document.head.appendChild(ld);
    return () => {
      document.head.removeChild(ld);
    };
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground font-poppins">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background" />
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 mb-6 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-yellow-300" />
            Pakistan ka Digital Wholesale Bazaar
          </div>
          <h1 className="text-3xl md:text-5xl font-bold leading-tight mb-4">
            Business shouldn't depend on{" "}
            <span className="text-yellow-300">who you know.</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            PakMandi is the trust layer that connects Pakistani wholesalers and
            retailers — replacing phone calls, market visits, and paper ledgers
            with a single platform built for how trade actually works here.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="min-h-[48px]">
              <Link to="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-[48px]">
              <Link to="/shops">Browse Wholesalers</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Before PakMandi */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-destructive text-sm font-medium mb-3">
            <XCircle className="h-4 w-4" /> Before PakMandi
          </div>
          <h2 className="text-2xl md:text-4xl font-bold">
            Trade in Pakistan runs on personal networks.
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            If you're outside that decades-old circle, you're locked out.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-muted">
                <Store className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">For Wholesalers</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Invisible to new retailers — only your existing circle knows you exist.",
                "Inventory tracked on paper or basic Excel — no real-time view.",
                "Pricing is inconsistent — different retailers, different rates.",
                "Informal credit with zero tracking — cash flow is a constant struggle.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-muted">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">For Retailers</h3>
            </div>
            <ul className="space-y-3 text-sm text-muted-foreground">
              {[
                "Call 10 wholesalers, visit 3 markets, ask friends — just to source one product.",
                "No way to compare prices or stock across suppliers in one place.",
                "Minimum order quantities are unclear until you're on the phone.",
                "Credit access depends entirely on years of personal trust — new retailers get nothing.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* The trust gap */}
      <section className="border-y border-border bg-card/40">
        <div className="container mx-auto px-4 py-14 max-w-4xl text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            The real problem: no trust between strangers.
          </h2>
          <p className="text-muted-foreground">
            No verification. No reviews. No dispute resolution. Payments in cash
            with no paper trail. Deals stuck in WhatsApp threads no one can
            manage. That's the gap PakMandi fills.
          </p>
        </div>
      </section>

      {/* After PakMandi */}
      <section className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-yellow-300 text-sm font-medium mb-3">
            <CheckCircle2 className="h-4 w-4" /> After PakMandi
          </div>
          <h2 className="text-2xl md:text-4xl font-bold">
            One platform. Verified partners. Real numbers.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Store className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Wholesalers win</h3>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                { icon: TrendingUp, t: "Digital storefront open 24/7 — every retailer in Pakistan can find you." },
                { icon: FileText, t: "Central real-time inventory replaces paper registers." },
                { icon: Wallet, t: "Transparent bulk pricing tiers — consistent for every buyer." },
                { icon: ShieldCheck, t: "Verified trust badge — build reputation with strangers." },
                { icon: Truck, t: "Order history & digital credit trail — no more lost payments." },
              ].map(({ icon: Icon, t }) => (
                <li key={t} className="flex gap-2">
                  <Icon className="h-4 w-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Retailers win</h3>
            </div>
            <ul className="space-y-3 text-sm">
              {[
                { icon: Search, t: "Compare multiple wholesalers on one screen — price, stock, MOQ upfront." },
                { icon: Star, t: "Verified suppliers with reviews — buy with confidence, even the first time." },
                { icon: FileText, t: "Clear terms before you order — no surprises on the phone." },
                { icon: Users, t: "Build a digital credit reputation — unlock better terms as you grow." },
                { icon: MessageSquare, t: "In-app messaging + order tracking — everything in one place." },
              ].map(({ icon: Icon, t }) => (
                <li key={t} className="flex gap-2">
                  <Icon className="h-4 w-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      {/* Bottom line */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-14 max-w-4xl text-center">
          <p className="text-lg md:text-2xl font-semibold leading-snug">
            Business runs on{" "}
            <span className="line-through text-muted-foreground">who you know</span>{" "}
            → <span className="text-yellow-300">what you offer.</span>
          </p>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            PakMandi replaces phone calls, market visits, and paper ledgers with
            discovery, transparency, and trust. Both sides win because the
            platform becomes the trust layer they never had.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16 max-w-4xl">
        <Card className="p-8 md:p-12 text-center border-border bg-gradient-to-br from-card to-background">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Ready to join Pakistan's digital mandi?
          </h2>
          <p className="text-muted-foreground mb-6">
            Sign up in under 2 minutes. Urdu supported. Mobile-first.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="min-h-[48px]">
              <Link to="/signup?role=wholesaler">
                <Store className="mr-2 h-4 w-4" /> Join as Wholesaler
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="min-h-[48px]">
              <Link to="/signup?role=seller">
                <ShoppingBag className="mr-2 h-4 w-4" /> Join as Retailer
              </Link>
            </Button>
          </div>
        </Card>
      </section>
    </main>
  );
};

export default WhyPakMandi;