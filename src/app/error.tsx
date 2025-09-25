"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // You could send error to an error reporting service here
    // console.error(error)
  }, [error]);

  return (
    <main className="mx-auto max-w-6xl px-6 py-24 text-center">
      <p className="text-sm text-muted-foreground">500</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Button onClick={() => reset()}>Try again</Button>
        <Button asChild variant="secondary">
          <Link href="/">Go home</Link>
        </Button>
      </div>
      {process.env.NODE_ENV !== "production" && error?.digest && (
        <p className="mt-4 text-xs text-muted-foreground">Ref: {error.digest}</p>
      )}
    </main>
  );
}