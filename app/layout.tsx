import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ASSETS } from "@/lib/assets";

const SITE_URL = "https://itzam.ai";
const SITE_NAME = "Itzam.ai";
const TITLE = "Itzam.ai — Intelligence, deployed.";
const DESCRIPTION =
  "Itzam.ai is the AI agency for LATAM operators. Senior engineers design, build, and ship production-grade AI systems — agents, copilots, and automations — in 30 days, not 30 months.";
const KEYWORDS = [
  "AI agency",
  "LATAM AI",
  "AI consulting México",
  "agencia de IA",
  "IA México",
  "production AI systems",
  "AI agents",
  "AI copilots",
  "enterprise AI",
  "machine learning agency",
  "AI automation",
  "Itzam",
  "Itzam.ai",
];

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Itzam.ai",
  },
  description: DESCRIPTION,
  keywords: KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: "Itzam.ai" }],
  creator: "Itzam.ai",
  publisher: "Itzam.ai",
  category: "technology",
  alternates: {
    canonical: "/",
    languages: {
      en: "/en",
      es: "/es",
      "x-default": "/en",
    },
  },
  icons: {
    icon: [{ url: ASSETS.logoGold, type: "image/png" }],
    shortcut: [ASSETS.logoGold],
    apple: [{ url: ASSETS.logoGold }],
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
    alternateLocale: ["es_MX"],
    images: [
      {
        url: ASSETS.logoGold,
        width: 1200,
        height: 630,
        alt: "Itzam.ai — Intelligence, deployed.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [ASSETS.logoGold],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: SITE_URL,
  logo: ASSETS.logoGold,
  description: DESCRIPTION,
  areaServed: "Latin America",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
