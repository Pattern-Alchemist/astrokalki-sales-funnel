"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Script from "next/script";

export default function BookPage() {
  const params = useSearchParams();
  const preselectedPlan = params.get("plan") ?? undefined;
  const plans = useMemo(
    () => [
      { value: "starter", label: "Starter – $9/mo" },
      { value: "pro", label: "Pro – $29/mo" },
      { value: "elite", label: "Elite – $79/mo" },
      { value: "one_time", label: "One-time Consultation" },
    ],
    []
  );

  const [form, setForm] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
    timeOfBirth: "",
    placeOfBirth: "",
    modality: "vedic",
    plan: preselectedPlan ?? "starter",
    notes: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    if (preselectedPlan) setForm((f) => ({ ...f, plan: preselectedPlan }));
  }, [preselectedPlan]);

  // Calendly embed URL (replace path with your real scheduling link if needed)
  const CALENDLY_BASE = "https://calendly.com/astrokalki/consultation";
  const calendlyUrl = useMemo(() => {
    const url = new URL(CALENDLY_BASE);
    const prefill: Record<string, string> = {};
    if (form.name) prefill.name = form.name;
    if (form.email) prefill.email = form.email;
    if (Object.keys(prefill).length) {
      url.searchParams.set("name", prefill.name || "");
      url.searchParams.set("email", prefill.email || "");
    }
    return url.toString();
  }, [form.name, form.email]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch (err) {
      setStatus("error");
    }
  }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold">Book a Consultation</h1>
        <p className="text-muted-foreground mt-2">Share your birth details and preferences. We'll confirm via email.</p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Consultation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="tob">Time of Birth</Label>
                  <Input id="tob" type="time" value={form.timeOfBirth} onChange={(e) => setForm({ ...form, timeOfBirth: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="pob">Place of Birth</Label>
                  <Input id="pob" placeholder="City, Country" value={form.placeOfBirth} onChange={(e) => setForm({ ...form, placeOfBirth: e.target.value })} required />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Preferred Modality</Label>
                  <Select value={form.modality} onValueChange={(v) => setForm({ ...form, modality: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vedic">Vedic</SelectItem>
                      <SelectItem value="western">Western</SelectItem>
                      <SelectItem value="tarot">Tarot</SelectItem>
                      <SelectItem value="numerology">Numerology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Plan</Label>
                  <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (questions, focus areas)</Label>
                <Textarea id="notes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit" disabled={status === "submitting"}>
                  {status === "submitting" ? "Submitting..." : "Request Booking"}
                </Button>
                {status === "success" && <span className="text-sm text-green-600">Thanks! We'll email confirmation shortly.</span>}
                {status === "error" && <span className="text-sm text-red-600">Something went wrong. Please try again.</span>}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Calendly embed */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Select a Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-4">Pick a time that works for you. Your name and email will auto-fill if provided above.</div>
            <div
              className="calendly-inline-widget w-full"
              data-url={calendlyUrl}
              style={{ minWidth: 320, height: 700 }}
            />
            <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}