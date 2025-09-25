"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";

export default function Home() {
  const track = (event: string, params?: Record<string, any>) => {
    if (typeof window !== "undefined") {
      if (typeof window.gtag === "function") {
        window.gtag("event", event, params || {});
      }
      if (typeof window.fbq === "function") {
        // Use trackCustom to avoid requiring standard event names
        window.fbq("trackCustom", event, params || {});
      }
    }
  };

  return (
    <div className="min-h-screen font-sans">
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1462332420958-a05d1e002413?q=80&w=2070&auto=format&fit=crop"
          alt="Starry night sky"
          fill
          priority
          className="object-cover opacity-40 -z-10"
        />
        <div className="mx-auto max-w-6xl px-6 py-28 text-center">
          <Badge className="mb-4">ASTROKALKI</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Unlock Your Cosmic Blueprint</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Personalized astrology insights, natal chart readings, and live consultations to help you navigate love, career, and life decisions.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg" onClick={() => track("cta_click", { id: "home_view_plans" })}>
              <Link href="/pricing">View Plans</Link>
            </Button>
            <Button asChild variant="secondary" size="lg" onClick={() => track("cta_click", { id: "home_book_consult" })}>
              <Link href="/book">Book a Consultation</Link>
            </Button>
          </div>
          <form action="/api/leads" method="post" className="mt-8 mx-auto max-w-md flex gap-2 bg-card p-2 rounded-md" onSubmit={() => track("lead_submit", { id: "hero_email_capture" })}>
            <Label htmlFor="email" className="sr-only">Email</Label>
            <Input id="email" name="email" type="email" placeholder="Enter your email for a free mini horoscope" required />
            <Button type="submit">Get Free Guide</Button>
          </form>
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-semibold">Services</h2>
        <p className="text-muted-foreground mt-2">Choose what resonates with your current journey.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Natal Chart Reading</CardTitle>
            </CardHeader>
            <CardContent>
              In-depth analysis of your birth chart covering strengths, challenges, and life themes.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Compatibility & Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              Synastry and composite readings to understand romantic and interpersonal dynamics.
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Career & Wealth Guidance</CardTitle>
            </CardHeader>
            <CardContent>
              Strategic timing, transits, and vocational insights to align your career moves.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Astrologers */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-semibold">Meet Our Astrologers</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {["Aarav Mehta","Ira Kapoor","Vihaan Sharma"].map((name) => (
            <Card key={name}>
              <CardContent className="p-0">
                <div className="relative h-56 w-full flex items-center justify-center bg-muted rounded-t-md">
                  <Image
                    src="/globe.svg"
                    alt={`${name} avatar placeholder`}
                    width={160}
                    height={160}
                    className="object-contain opacity-80"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{name}</h3>
                  <p className="text-sm text-muted-foreground">Vedic | Tarot | Western</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-semibold">What Clients Say</h2>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {["The reading clarified my career direction.", "Spot-on insights about my relationship.", "Accurate timelines that helped me plan better."].map((t, idx) => (
            <Card key={idx}>
              <CardContent className="p-6">
                <p className="text-muted-foreground">"{t}"</p>
                <div className="mt-4 text-sm">— Client {idx + 1}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="bg-primary text-primary-foreground p-8 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-semibold">Ready to explore your stars?</h3>
            <p className="opacity-90">Start with a free mini horoscope or jump straight into a full consultation.</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="secondary" onClick={() => track("cta_click", { id: "footer_see_pricing" })}><Link href="/pricing">See Pricing</Link></Button>
            <Button asChild onClick={() => track("cta_click", { id: "footer_book_now" })}><Link href="/book">Book Now</Link></Button>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}