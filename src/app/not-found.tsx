import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-24 text-center">
      <p className="text-sm text-muted-foreground">404</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you’re looking for doesn’t exist or has been moved.</p>
      <div className="mt-6">
        <Link href="/" className="inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-accent">
          Go back home
        </Link>
      </div>
    </main>
  );
}