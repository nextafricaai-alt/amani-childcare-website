"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ArrowUpRight, Camera, Filter } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

const galleryItems = [
  { id: "1", src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=1000&q=80", title: "Interactive Literacy & Reading", category: "Classroom", description: "Dedicated reading corners equipped with early age storybooks and guided reading." },
  { id: "2", src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1000&q=80", title: "Educational Wooden Building Blocks", category: "Montessori", description: "Tactile wooden blocks for spatial reasoning, creativity, and motor skill development." },
  { id: "3", src: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=1000&q=80", title: "Outdoor Physical Play & Playground", category: "Outdoor", description: "Supervised outdoor play area designed for active movement, coordination, and fresh air." },
  { id: "4", src: "https://images.unsplash.com/photo-1567057419565-4349c679c078?w=1000&q=80", title: "Creative Painting & Expression", category: "Arts", description: "Hands-on art sessions nurturing creativity, color recognition, and self-expression." },
  { id: "5", src: "https://images.unsplash.com/photo-1522661067900-ab829854a57f?w=1000&q=80", title: "Morning Circle Time & Values", category: "Community", description: "Daily morning gatherings teaching kindness, gratitude, songs, and character traits." },
  { id: "6", src: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=1000&q=80", title: "Hygienic Nursery Facilities", category: "Facilities", description: "Bright, sanitized, child-safe room layouts with dedicated rest areas." },
  { id: "7", src: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&q=80", title: "Guided Reading Sessions", category: "Classroom", description: "One-on-one attention encouraging early speech, vocabulary, and listening." },
  { id: "8", src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=1000&q=80", title: "Group Problem Solving Activities", category: "Montessori", description: "Collaborative learning games that teach teamwork and critical thinking." },
  { id: "9", src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=1000&q=80", title: "Natural Wooden Toys & Puzzles", category: "Montessori", description: "Eco-friendly, non-toxic toys encouraging sensory exploration." },
  { id: "10", src: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1000&q=80", title: "Early Math & Shape Sorting", category: "Classroom", description: "Interactive tools introducing numbers, geometry, and counting." },
  { id: "11", src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1000&q=80", title: "Joyful Classmates & Social Growth", category: "Community", description: "Building lifelong friendships in a warm, welcoming atmosphere." },
  { id: "12", src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=1000&q=80", title: "Nature Exploration & Physical Health", category: "Outdoor", description: "Guided nature walks and outdoor activities in our enclosed garden." },
];

const categories = ["All", "Classroom", "Montessori", "Outdoor", "Arts", "Community", "Facilities"];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeModalItem, setActiveModalItem] = useState<{ src: string; title: string; category: string; description: string } | null>(null);

  const filteredItems = selectedCategory === "All"
    ? galleryItems
    : galleryItems.filter(item => item.category === selectedCategory);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModalItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="pt-20">

      {/* ── Header ─────────────────────────────────────────── */}
      <section className="section" style={{ background: "oklch(22% 0.06 155)" }}>
        <div className="container-narrow text-center">
          <Reveal>
            <span className="eyebrow eyebrow-light mb-8 inline-flex">
              <Camera className="w-3 h-3" />
              Photo Gallery
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1
              className="display-lg mb-6"
              style={{ color: "oklch(97% 0.012 85)" }}
            >
              Life at Pikadon.<br />
              <em style={{ color: "oklch(68% 0.12 75)" }}>Real moments.</em>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="body-lg max-w-xl mx-auto"
              style={{ color: "oklch(97% 0.012 85 / 0.65)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Explore our classrooms, learning materials, outdoor play areas, and daily activities. Click any card to view full screen.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Filter Tabs & Grid ─────────────────────────────── */}
      <section className="section" style={{ background: "oklch(93% 0.016 82)" }}>
        <div className="container">

          {/* Category Filter Pills */}
          <Reveal>
            <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-4 py-2 rounded-full text-xs font-sans font-semibold transition-all duration-200"
                  style={{
                    background: selectedCategory === cat
                      ? "oklch(22% 0.06 155)"
                      : "oklch(97% 0.012 85)",
                    color: selectedCategory === cat
                      ? "oklch(97% 0.012 85)"
                      : "oklch(30% 0.015 90)",
                    border: `1px solid ${selectedCategory === cat ? "oklch(22% 0.06 155)" : "oklch(68% 0.12 75 / 0.2)"}`,
                    boxShadow: selectedCategory === cat ? "0 4px 16px oklch(22% 0.06 155 / 0.2)" : "none",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </Reveal>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredItems.map((item, i) => (
              <Reveal key={item.id} delay={i * 50} direction="scale">
                <div
                  className="card-shell cursor-pointer group h-full"
                  onClick={() => setActiveModalItem(item)}
                >
                  <div className="card-core overflow-hidden relative flex flex-col h-full">
                    {/* Image */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                      <img
                        src={item.src}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                      {/* Hover Badge */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-sans font-semibold inline-flex items-center gap-2">
                          <ZoomIn className="w-4 h-4 text-[oklch(68%_0.12_75)]" />
                          Expand Photo
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col justify-between flex-1" style={{ background: "oklch(99% 0.006 85)" }}>
                      <div>
                        <span className="label-xs mb-1" style={{ color: "oklch(68% 0.12 75)" }}>
                          {item.category}
                        </span>
                        <h3
                          className="font-display font-medium text-xl leading-snug"
                          style={{ color: "oklch(22% 0.06 155)" }}
                        >
                          {item.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* ── Lightbox Modal Popup ───────────────────────────── */}
      <AnimatePresence>
        {activeModalItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/85 backdrop-blur-xl"
            onClick={() => setActiveModalItem(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-4xl w-full bg-[oklch(99%_0.006_85)] rounded-3xl overflow-hidden shadow-2xl border border-[oklch(68%_0.12_75_/0.25)] flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Photo */}
              <div className="md:w-3/5 aspect-[4/3] md:aspect-auto overflow-hidden bg-black">
                <img
                  src={activeModalItem.src}
                  alt={activeModalItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info & WhatsApp CTA */}
              <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between" style={{ background: "oklch(97% 0.012 85)" }}>
                <div>
                  <span className="eyebrow mb-3 inline-flex">{activeModalItem.category}</span>
                  <h3 className="font-display font-medium text-2xl md:text-3xl mb-3" style={{ color: "oklch(22% 0.06 155)" }}>
                    {activeModalItem.title}
                  </h3>
                  <p className="body-sm text-[oklch(30%_0.015_90)] font-sans leading-relaxed mb-6">
                    {activeModalItem.description}
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-[oklch(68%_0.12_75_/0.15)]">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold !py-2.5 w-full justify-center"
                  >
                    Book a Visit to See This Live
                    <span className="btn-arrow !w-6 !h-6">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="btn-ghost !py-2 w-full text-center justify-center !border-[oklch(22%_0.06_155_/0.2)]"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="section text-center" style={{ background: "oklch(22% 0.06 155)" }}>
        <div className="container-narrow">
          <Reveal>
            <span className="eyebrow eyebrow-light mb-8 inline-flex">Visit Pikadon</span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="display-md mb-6" style={{ color: "oklch(97% 0.012 85)" }}>
              See our centre<br />
              <em style={{ color: "oklch(68% 0.12 75)" }}>in person.</em>
            </h2>
          </Reveal>

          <Reveal delay={160}>
            <p
              className="body-lg max-w-md mx-auto mb-10"
              style={{ color: "oklch(97% 0.012 85 / 0.65)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Book a free visit. Take a full tour of all classrooms, outdoor play areas, and meet our staff.
            </p>
          </Reveal>

          <Reveal delay={220}>
            <div className="flex flex-wrap gap-3 justify-center">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold"
              >
                Book a Visit on WhatsApp
                <span className="btn-arrow">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </a>
              <Link href="/visit" className="btn-ghost" style={{ borderColor: "oklch(97% 0.012 85 / 0.25)", color: "oklch(97% 0.012 85 / 0.7)" }}>
                Directions & Hours
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}
