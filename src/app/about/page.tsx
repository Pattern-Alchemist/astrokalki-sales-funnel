"use client";

import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl font-bold">About ASTROKALKI</h1>
            <p className="text-muted-foreground mt-4">
              ASTROKALKI is your trusted companion for clear, compassionate, and practical astrology guidance.
              We blend Vedic and Western techniques to deliver insights you can act on.
            </p>
            <p className="text-muted-foreground mt-4">
              Our mission is to help you align with cosmic timing for love, career, and personal growth.
              Every reading is personalized and delivered by certified, experienced astrologers.
            </p>
          </div>
          <div className="relative h-72 w-full">
            <Image
              src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&auto=format&fit=crop&w=1600"
              alt="Astrology workspace"
              fill
              className="object-cover rounded-xl"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}