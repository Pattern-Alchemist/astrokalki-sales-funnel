"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session } = useSession();
  return (
    <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">ASTROKALKI</Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/pricing">Pricing</Link>
          <Link href="/book">Book</Link>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          {session?.user && <Link href="/admin">Admin</Link>}
        </nav>
        <div className="flex items-center gap-2">
          {session?.user ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">Hi, {session.user.name || session.user.email}</span>
              <Button asChild size="sm"><Link href="/pricing">Get Started</Link></Button>
              <form action="/api/auth/sign-out" method="post">
                <Button type="submit" variant="secondary" size="sm">Sign out</Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
              <Button asChild size="sm"><Link href="/register">Get Started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}