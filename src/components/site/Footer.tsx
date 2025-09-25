"use client";

export default function Footer() {
  return (
    <footer className="border-t py-10 mt-10">
      <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div>
          <div className="font-semibold">ASTROKALKI</div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
        <div className="text-sm text-muted-foreground">
          Crafted with cosmic care.
        </div>
      </div>
    </footer>
  );
}