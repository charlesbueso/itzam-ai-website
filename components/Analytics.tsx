import Script from "next/script";

/**
 * Google Analytics 4 — loaded site-wide via the root layout.
 * Uses next/script with `afterInteractive` so it never blocks first paint.
 */
const GA_MEASUREMENT_ID = "G-JVXTVD9NXY";

export default function Analytics() {
  // Allow disabling locally with `NEXT_PUBLIC_DISABLE_ANALYTICS=1`.
  if (process.env.NEXT_PUBLIC_DISABLE_ANALYTICS === "1") return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
