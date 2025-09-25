import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

export const metadata: Metadata = {
  title: "ASTROKALKI – Astrology Services & Consultations",
  description: "Personalized astrology guidance, horoscopes, and consultations. Explore plans, book sessions, and start your journey with ASTROKALKI.",
  metadataBase: new URL("https://www.astrokalki.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "ASTROKALKI – Astrology Services & Consultations",
    description:
      "Personalized astrology guidance, horoscopes, and consultations. Explore plans, book sessions, and start your journey with ASTROKALKI.",
    url: "https://www.astrokalki.com/",
    siteName: "ASTROKALKI",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASTROKALKI – Astrology Services & Consultations",
    description:
      "Personalized astrology guidance, horoscopes, and consultations. Explore plans, book sessions, and start your journey with ASTROKALKI.",
    creator: "@astrokalki",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID;
  return (
    <html lang="en">
      <body className="antialiased">
        <ErrorReporter />
        {GA_ID ? (
          <>
            <Script
              id="ga4-src"
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        
        {FB_PIXEL_ID ? (
          <>
            <Script id="fb-pixel" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${FB_PIXEL_ID}');
              `}
            </Script>
            <noscript>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img height="1" width="1" style={{ display: "none" }} alt=""
                src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`} />
            </noscript>
          </>
        ) : null}
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "ASTROKALKI", "version": "1.0.0"}'
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "ASTROKALKI",
              url: "https://www.astrokalki.com",
              logo: "https://www.astrokalki.com/favicon.ico",
              sameAs: [
                "https://twitter.com/astrokalki"
              ]
            }),
          }}
        />
        <AnalyticsProvider />
        {children}
        <VisualEditsMessenger />
      </body>
    </html>
  );
}