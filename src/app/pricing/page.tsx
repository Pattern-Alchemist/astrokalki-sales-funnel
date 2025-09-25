"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter as UIDialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import Link from "next/link";
import { useCallback, useState } from "react";
import { loadRazorpay } from "@/lib/razorpay";
import { useRouter } from "next/navigation";

const plans = [
  {
    name: "One Question",
    subtitle: "Relationship / Money / Career / Other",
    price: "₹100",
    period: "",
    features: [
      "Astrology extract",
      "Tarot Card",
      "Numerology",
      "Palmistry",
      "Duration: 7–8 mins (Audio Call)",
      "Validation/Follow-Up: NIL",
    ],
    highlight: false,
    slug: "one-question",
  },
  {
    name: "SILVER – Three Questions",
    price: "₹500",
    period: "",
    features: [
      "Astrology extract",
      "Tarot Card",
      "Numerology",
      "Duration: 30 mins (Audio)",
      "Validation/Follow-Up: NIL",
    ],
    highlight: false,
    slug: "silver",
  },
  {
    name: "GOLD – Three Questions",
    price: "₹1,000",
    period: "",
    features: [
      "Astrology + Numerology + Tarot + Palmistry",
      "Validation/Follow-Up: 1 Free Call (after 30 days)",
      "Duration: 45 mins (Audio)",
    ],
    highlight: true,
    slug: "gold",
  },
  {
    name: "PLATINUM",
    price: "₹2,000",
    period: "",
    features: [
      "Astrology + Numerology + Tarot + Palmistry",
      "Validation/Follow-Up: 2 Free Calls (within 30 days) + WhatsApp Support",
      "Duration: 45–60 mins (Audio)",
    ],
    highlight: false,
    slug: "platinum",
  },
  {
    name: "DIAMOND",
    price: "₹3,000",
    period: "",
    features: [
      "Karma Pattern, Soul Contract, Shadow Integration, Crystals & Stones",
      "Validation/Follow-Up: 4 Free Follow-Up Calls (within 90 days) + WhatsApp Support + PDF Summary",
      "Duration: 90 mins (45+45 split) + 1-Month Validity",
    ],
    highlight: false,
    slug: "diamond",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [coupon, setCoupon] = useState("");
  const [gstOpen, setGstOpen] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<{ slug: string; name: string } | null>(null);
  const [gst, setGst] = useState({
    name: "",
    email: "",
    gstin: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const amounts: Record<string, number> = {
    // INR in paise
    "one-question": 10000,
    silver: 50000,
    gold: 100000,
    platinum: 200000,
    diamond: 300000,
  };

  const handleCheckout = useCallback(async (slug: string, displayName: string) => {
    try {
      setLoadingPlan(slug);
      await loadRazorpay();

      const amount = amounts[slug];
      if (!amount) throw new Error("Invalid plan selected");

      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          currency: "INR",
          notes: {
            plan: slug,
            coupon: coupon || undefined,
            invoice_name: gst.name || undefined,
            invoice_email: gst.email || undefined,
            gstin: gst.gstin || undefined,
            address: gst.address || undefined,
            city: gst.city || undefined,
            state: gst.state || undefined,
            pincode: gst.pincode || undefined,
          },
        }),
      });
      const data = await orderRes.json();
      if (!orderRes.ok) throw new Error(data?.error || "Failed to create order");

      const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) {
        console.error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID");
        throw new Error("Payment config missing");
      }

      // Fire analytics: begin_checkout
      try {
        const valueInr = amount / 100;
        if (typeof window !== "undefined") {
          if (typeof (window as any).gtag === "function") {
            (window as any).gtag("event", "begin_checkout", {
              currency: "INR",
              value: valueInr,
              items: [{ item_id: slug, item_name: displayName, price: valueInr, quantity: 1 }],
            });
          }
          if (typeof (window as any).fbq === "function") {
            (window as any).fbq("track", "InitiateCheckout", {
              value: valueInr,
              currency: "INR",
              content_ids: [slug],
              content_name: displayName,
              content_type: "product",
            });
          }
        }
      } catch {}

      const options: any = {
        key,
        amount,
        currency: "INR",
        name: "ASTROKALKI",
        description: `${displayName} plan`,
        order_id: data.order.id,
        notes: { plan: slug },
        theme: { color: "#0f172a" },
        prefill: {
          name: gst.name || undefined,
          email: gst.email || undefined,
        },
        handler: async (response: any) => {
          // Verify signature on server
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData?.ok) {
            // Fire analytics: purchase
            try {
              const valueInr = amount / 100;
              if (typeof window !== "undefined") {
                if (typeof (window as any).gtag === "function") {
                  (window as any).gtag("event", "purchase", {
                    transaction_id: response.razorpay_payment_id,
                    value: valueInr,
                    currency: "INR",
                    items: [{ item_id: slug, item_name: displayName, price: valueInr, quantity: 1 }],
                  });
                }
                if (typeof (window as any).fbq === "function") {
                  (window as any).fbq("track", "Purchase", {
                    value: valueInr,
                    currency: "INR",
                    contents: [{ id: slug, quantity: 1 }],
                    content_type: "product",
                  });
                }
              }
            } catch {}

            router.push(`/onboarding?plan=${slug}`);
          } else {
            console.error("Payment verification failed", verifyData?.error);
          }
        },
        modal: {
          ondismiss: () => setLoadingPlan(null),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPlan(null);
      setGstOpen(false);
      setPendingPlan(null);
    }
  }, [coupon, gst]);

  const startPurchase = (slug: string, name: string) => {
    try {
      if (typeof window !== "undefined") {
        if (typeof (window as any).gtag === "function") {
          (window as any).gtag("event", "select_item", {
            items: [{ item_id: slug, item_name: name }],
            item_list_name: "pricing_cards",
          });
        }
        if (typeof (window as any).fbq === "function") {
          (window as any).fbq("trackCustom", "SelectPlan", { plan: slug, name });
        }
      }
    } catch {}
    setPendingPlan({ slug, name });
    setGstOpen(true);
  };

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <h1 className="text-4xl font-bold text-center">Choose Your Plan</h1>
        <p className="text-muted-foreground text-center mt-2">Upgrade, downgrade, or cancel anytime.</p>
        {/* Coupon code */}
        <div className="mt-6 flex items-center gap-2 justify-center">
          <Input
            value={coupon}
            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
            placeholder="Coupon code (optional)"
            className="max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (typeof window !== "undefined") {
                try {
                  if (typeof (window as any).gtag === "function") {
                    (window as any).gtag("event", "add_promotion", { promotion_name: coupon || "" });
                  }
                  if (typeof (window as any).fbq === "function") {
                    (window as any).fbq("trackCustom", "ApplyCoupon", { coupon });
                  }
                } catch {}
              }
            }}
          >
            Apply
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-10">
          {plans.map((p) => (
            <Card
              key={p.name}
              className={`${p.highlight ? "border-primary " : ""}flex flex-col h-full`}
            >
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3">
                  <span className="leading-tight">
                    <span className="inline-flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.slug === "gold" ? (
                        <span className="text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">Most popular</span>
                      ) : null}
                    </span>
                    {"subtitle" in p && (p as any).subtitle ? (
                      <span className="block text-sm text-muted-foreground mt-1">{(p as any).subtitle}</span>
                    ) : null}
                  </span>
                  <span className="text-2xl font-semibold">{p.price}{p.period && (<span className="text-sm text-muted-foreground">{p.period}</span>)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {p.features.map((f) => (<li key={f}>• {f}</li>))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                {(["platinum", "diamond"] as const).includes(p.slug as any) ? (
                  <Button asChild className="w-full" variant="secondary">
                    <Link
                      href={`/book?plan=${p.slug}`}
                      onClick={() => {
                        try {
                          if (typeof window !== "undefined") {
                            if (typeof (window as any).gtag === "function") {
                              (window as any).gtag("event", "select_item", {
                                items: [{ item_id: p.slug, item_name: p.name }],
                                item_list_name: "pricing_cards_book",
                              });
                            }
                            if (typeof (window as any).fbq === "function") {
                              (window as any).fbq("track", "Contact", { content_name: p.slug });
                            }
                          }
                        } catch {}
                      }}
                    >
                      Book a Call
                    </Link>
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => startPurchase(p.slug, p.name)}
                    disabled={loadingPlan === p.slug}
                  >
                    {loadingPlan === p.slug ? "Processing..." : "Buy Now"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-center">FAQs</h2>
          <p className="text-muted-foreground text-center mt-2">Quick answers to common questions.</p>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">How do I book a session?</summary>
              <div className="mt-2 text-sm text-muted-foreground">
                Choose a plan above. For Platinum/Diamond, click "Book a Call" to pick a time. Other plans go through secure payment and then you'll be guided to booking.
              </div>
            </details>
            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">What's included in each plan?</summary>
              <div className="mt-2 text-sm text-muted-foreground">
                Each card lists tools, duration, and follow-ups. Higher tiers include combined modalities and free follow-up calls; Diamond adds PDF summary.
              </div>
            </details>
            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">Can I reschedule?</summary>
              <div className="mt-2 text-sm text-muted-foreground">
                Yes—rescheduling is allowed up to 12 hours before the call. Use your confirmation link or contact support.
              </div>
            </details>
            <details className="rounded-lg border p-4">
              <summary className="cursor-pointer font-medium">Do you offer refunds?</summary>
              <div className="mt-2 text-sm text-muted-foreground">
                Sessions are time-reserved services. If there's an issue, reach out and we'll make it right per our fair-use policy.
              </div>
            </details>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-center">Compare Plans</h2>
          <p className="text-muted-foreground text-center mt-2">All prices in INR. Choose the depth of guidance that fits your needs.</p>
          <div className="mt-8 overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-muted/50 text-sm">
                <tr>
                  <th className="px-4 py-3 font-medium">Plan / Service</th>
                  <th className="px-4 py-3 font-medium">Tools / Insights</th>
                  <th className="px-4 py-3 font-medium">Validation / Follow-Up</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Fees (₹)</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="px-4 py-4 align-top">
                    <div className="font-medium">One Question</div>
                    <div className="text-xs text-muted-foreground">Relationship / Money / Career / Other</div>
                  </td>
                  <td className="px-4 py-4 align-top text-sm">Astrology extract; Tarot Card; Numerology; Palmistry</td>
                  <td className="px-4 py-4 align-top text-sm">NIL</td>
                  <td className="px-4 py-4 align-top text-sm">7–8 mins (Audio Call)</td>
                  <td className="px-4 py-4 align-top font-semibold">₹100</td>
                  <td className="px-4 py-4 align-top text-right">
                    <Button size="sm" onClick={() => startPurchase("one-question", "One Question")}>
                      Buy
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 align-top font-medium">SILVER – Three Questions</td>
                  <td className="px-4 py-4 align-top text-sm">Astrology extract; Tarot Card; Numerology</td>
                  <td className="px-4 py-4 align-top text-sm">NIL</td>
                  <td className="px-4 py-4 align-top text-sm">30 mins (Audio)</td>
                  <td className="px-4 py-4 align-top font-semibold">₹500</td>
                  <td className="px-4 py-4 align-top text-right">
                    <Button size="sm" onClick={() => startPurchase("silver", "SILVER – Three Questions")}>
                      Buy
                    </Button>
                  </td>
                </tr>
                <tr className="bg-accent/30">
                  <td className="px-4 py-4 align-top">
                    <div className="font-medium">GOLD – Three Questions</div>
                    <span className="inline-block mt-1 text-xs rounded-full bg-primary/10 text-primary px-2 py-0.5">Popular</span>
                  </td>
                  <td className="px-4 py-4 align-top text-sm">Astrology + Numerology + Tarot + Palmistry</td>
                  <td className="px-4 py-4 align-top text-sm">1 Free Call (after 30 days)</td>
                  <td className="px-4 py-4 align-top text-sm">45 mins (Audio)</td>
                  <td className="px-4 py-4 align-top font-semibold">₹1,000</td>
                  <td className="px-4 py-4 align-top text-right">
                    <Button size="sm" onClick={() => startPurchase("gold", "GOLD – Three Questions")}>
                      Buy
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 align-top font-medium">PLATINUM</td>
                  <td className="px-4 py-4 align-top text-sm">Astrology + Numerology + Tarot + Palmistry</td>
                  <td className="px-4 py-4 align-top text-sm">2 Free Calls (within 30 days) + WhatsApp Support</td>
                  <td className="px-4 py-4 align-top text-sm">45–60 mins (Audio)</td>
                  <td className="px-4 py-4 align-top font-semibold">₹2,000</td>
                  <td className="px-4 py-4 align-top text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href="/book?plan=platinum">Book</Link>
                    </Button>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-4 align-top font-medium">DIAMOND</td>
                  <td className="px-4 py-4 align-top text-sm">Karma Pattern, Soul Contract, Shadow Integration, Crystals & Stones</td>
                  <td className="px-4 py-4 align-top text-sm">4 Free Follow-Up Calls (within 90 days) + WhatsApp Support + PDF Summary</td>
                  <td className="px-4 py-4 align-top text-sm">90 mins (45+45 split) + 1-Month Validity</td>
                  <td className="px-4 py-4 align-top font-semibold">₹3,000</td>
                  <td className="px-4 py-4 align-top text-right">
                    <Button asChild size="sm" variant="secondary">
                      <Link href="/book?plan=diamond">Book</Link>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold text-center">What clients say</h2>
          <p className="text-muted-foreground text-center mt-2">Real experiences from recent sessions.</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                "Accurate and compassionate guidance. The follow-up call really helped me stay on track."
                <div className="mt-4 text-foreground font-medium">— Aakriti S.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                "I booked the Gold plan—totally worth it. Clear direction for my career decisions."
                <div className="mt-4 text-foreground font-medium">— Rahul K.</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                "The Diamond session plus PDF summary was perfect for revisiting insights later."
                <div className="mt-4 text-foreground font-medium">— Neha M.</div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      {/* GST Details Dialog */}
      <Dialog open={gstOpen} onOpenChange={setGstOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invoice & contact details</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={gst.name} onChange={(e) => setGst({ ...gst, name: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={gst.email} onChange={(e) => setGst({ ...gst, email: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="gstin">GSTIN (optional)</Label>
              <Input id="gstin" value={gst.gstin} onChange={(e) => setGst({ ...gst, gstin: e.target.value.toUpperCase() })} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="address">Address</Label>
              <Textarea id="address" value={gst.address} onChange={(e) => setGst({ ...gst, address: e.target.value })} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={gst.city} onChange={(e) => setGst({ ...gst, city: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={gst.state} onChange={(e) => setGst({ ...gst, state: e.target.value })} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" inputMode="numeric" value={gst.pincode} onChange={(e) => setGst({ ...gst, pincode: e.target.value })} />
              </div>
            </div>
          </div>
          <UIDialogFooter>
            <Button
              variant="secondary"
              onClick={() => setGstOpen(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => pendingPlan && handleCheckout(pendingPlan.slug, pendingPlan.name)}
              disabled={!pendingPlan || !gst.name || !gst.email || loadingPlan === pendingPlan?.slug}
            >
              {loadingPlan === pendingPlan?.slug ? "Processing..." : "Continue to pay"}
            </Button>
          </UIDialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
}