import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { ASSETS } from "@/lib/assets";
import Analytics from "@/components/Analytics";
import HubSpot from "@/components/HubSpot";

const SITE_URL = "https://itzam.ai";
const SITE_NAME = "Itzam.ai";
const TITLE = "Itzam.ai — AI for Sales Teams in Mexico and LatAm.";
const DESCRIPTION =
  "Itzam.AI automates your sales operation with AI — in weeks, not months. From a 2-week diagnostic to deployed AI systems, built for commercial teams in Mexico and LatAm.";
const KEYWORDS = [
  "AI for sales teams",
  "IA para equipos de ventas",
  "AI agency",
  "AI agency LATAM",
  "AI agency Mexico",
  "agencia de IA",
  "agencia de IA México",
  "agencia de IA LatAm",
  "consultoría de IA",
  "AI consulting",
  "AI consulting Mexico",
  "AI consulting LatAm",
  "AI Opportunity Assessment",
  "Sales Playbook Generator",
  "Customer Support Engine",
  "Business Brain Lab",
  "sales automation",
  "automatización de ventas",
  "AI agents",
  "agentes de IA",
  "AI copilots",
  "copilotos de IA",
  "AI automation",
  "automatización con IA",
  "enterprise AI",
  "IA empresarial",
  "LLM consulting",
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
  authors: [{ name: "Itzam.ai", url: SITE_URL }],
  creator: "Itzam.ai",
  publisher: "Itzam.ai",
  category: "technology",
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
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

// ─────────────────────────── Structured data ───────────────────────────
// Rich, machine-readable description so search engines and LLM crawlers can
// answer "what is Itzam.ai" with high fidelity.

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE_URL}#organization`,
  name: SITE_NAME,
  legalName: "Itzam.ai",
  alternateName: ["Itzam", "Itzam AI"],
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: ASSETS.logoGold,
    width: 1200,
    height: 1200,
  },
  image: ASSETS.logoGold,
  description: DESCRIPTION,
  slogan: "Intelligence, deployed.",
  foundingDate: "2025",
  knowsLanguage: ["en", "es"],
  knowsAbout: [
    "Artificial Intelligence",
    "Large Language Models",
    "AI Agents",
    "Retrieval-Augmented Generation",
    "Machine Learning",
    "Generative AI",
    "AI Copilots",
    "AI Automation",
    "Cloud Infrastructure",
    "Enterprise AI",
  ],
  areaServed: [
    { "@type": "Place", name: "Latin America" },
    { "@type": "Country", name: "Mexico" },
    { "@type": "Country", name: "United States" },
  ],
  serviceType: [
    "AI Opportunity Assessment",
    "Sales Playbook Generator",
    "Customer Support Engine",
    "Itzam Business Brain Lab",
    "AI Agent Development",
    "AI Copilot Development",
    "AI Automation",
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "contact@itzam.ai",
      availableLanguage: ["en", "es"],
      areaServed: ["MX", "US", "LATAM"],
    },
  ],
  sameAs: [
    "https://www.linkedin.com/company/itzam-ai",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}#website`,
  url: SITE_URL,
  name: SITE_NAME,
  description: DESCRIPTION,
  inLanguage: ["en-US", "es-MX"],
  publisher: { "@id": `${SITE_URL}#organization` },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
        <HubSpot />
        <SpeedInsights />
      </body>
    </html>
  );
}
