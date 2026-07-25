// Central site configuration — change [NAME] and [PHONE] here only
export const SITE_CONFIG = {
  name: "Amani",
  tagline: "Child Development Network",
  estate: "Najjera",
  city: "Kampala",
  country: "Uganda",

  // WhatsApp
  phone: "256706028899", // International format without +
  whatsappMessage:
    "Hello Amani, I'd like to book a visit. My child is ___ years old. My name is ___.",

  // Contact
  hours: "Mon–Fri 7:00–18:00, Sat by arrangement",
  email: "hello@amanichild.ug",

  // Founding cohort
  foundingSpots: 10,
  foundingSpotsRemaining: 7, // Update as spots fill

  // SEO
  siteUrl: "https://amanichild.ug",
  description:
    "Amani is a licensed child development centre in Najjera, Kampala for children aged 2–5 — where every caregiver is vetted and trained, every day is structured, and you hear from us every single day.",
};

export function getWhatsAppUrl(customMessage?: string): string {
  const msg = encodeURIComponent(customMessage ?? SITE_CONFIG.whatsappMessage);
  return `https://wa.me/${SITE_CONFIG.phone}?text=${msg}`;
}
