// Central site configuration — Pikadon Child Development Network
export const SITE_CONFIG = {
  name: "Pikadon",
  networkName: "Pikadon Child Development Network",
  centreName: "Pikadon Najjera Centre",
  tagline: "Child Development Network",
  estate: "Najjera",
  city: "Kampala",
  country: "Uganda",

  // WhatsApp
  phone: "256706028899", // International format without +
  whatsappMessage:
    "Hello Pikadon, I'd like to book a visit. My child is ___ years old. My name is ___.",

  // Contact & Links
  hours: "Mon–Fri 7:00–18:00, Sat by arrangement",
  email: "hello@pikadon.ug",
  appUrl: "https://app.pikadon.ug",

  // Founding cohort
  foundingSpots: 10,
  foundingSpotsRemaining: 7, // Update as spots fill

  // SEO
  siteUrl: "https://pikadon.ug",
  description:
    "Pikadon is a licensed child development centre in Najjera for children aged 2–5 — where every caregiver is vetted and trained, every day is structured, and you hear from us every single day.",
};

export function getWhatsAppUrl(customMessage?: string): string {
  const msg = encodeURIComponent(customMessage ?? SITE_CONFIG.whatsappMessage);
  return `https://wa.me/${SITE_CONFIG.phone}?text=${msg}`;
}
