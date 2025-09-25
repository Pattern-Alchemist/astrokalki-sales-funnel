"use client";

import { useState } from "react";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ name: "", email: "", goal: "", timezone: "" });

  function next() { setStep((s) => Math.min(3, s + 1)); }
  function prev() { setStep((s) => Math.max(1, s - 1)); }

  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-xl px-6 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to ASTROKALKI</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
                </div>
                <div className="flex justify-end">
                  <Button onClick={next}>Next</Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal">Your Primary Goal</Label>
                  <Input id="goal" placeholder="Love, career, clarity, timing…" value={data.goal} onChange={(e) => setData({ ...data, goal: e.target.value })} />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" placeholder="e.g., IST, PST" value={data.timezone} onChange={(e) => setData({ ...data, timezone: e.target.value })} />
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="secondary" onClick={prev}>Back</Button>
                  <Button onClick={next}>Next</Button>
                </div>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground">All set! Choose a plan to get started.</p>
                <div className="flex gap-3">
                  <Button asChild><a href="/pricing">See Pricing</a></Button>
                  <Button asChild variant="secondary"><a href="/book">Book Consult</a></Button>
                </div>
                <div className="flex justify-start">
                  <Button variant="secondary" onClick={prev}>Back</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}