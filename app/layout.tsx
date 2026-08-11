import type { Metadata } from "next";
import "./globals.css";
import { SITE_CONFIG } from "@/lib/site-config";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import WhatsAppButton from "@/components/ui/whatsapp-button";
import FadedKidsNamesBackground from "@/components/ui/faded-kids-names";

export const metadata: Metadata = {
  title: {
    default: `${SITE_CONFIG.name} — Licensed Childcare & Early Learning in ${SITE_CONFIG.estate}, ${SITE_CONFIG.city} | Ages 2–5`,
    template: `%s | ${SITE_CONFIG.name} Child Development`,
  },
  description: SITE_CONFIG.description,
  keywords: [
    `childcare ${SITE_CONFIG.estate}`,
    `daycare ${SITE_CONFIG.estate}`,
    "early childhood Kampala",
    "childcare Uganda",
    "licensed nursery Kampala",
    "child development centre Uganda",
  ],
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: SITE_CONFIG.siteUrl,
    siteName: `${SITE_CONFIG.name} Child Development Network`,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

// Schema.org ChildCare structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ChildCare",
  name: `${SITE_CONFIG.name} Child Development Network`,
  description: SITE_CONFIG.description,
  url: SITE_CONFIG.siteUrl,
  telephone: `+${SITE_CONFIG.phone}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE_CONFIG.estate,
    addressRegion: SITE_CONFIG.city,
    addressCountry: "UG",
  },
  openingHours: "Mo-Fr 07:00-18:00",
  priceRange: "UGX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[var(--cream)] text-[var(--ink)] font-body min-h-screen">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
