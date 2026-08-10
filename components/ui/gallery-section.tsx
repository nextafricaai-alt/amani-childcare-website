"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ArrowUpRight, Camera } from "lucide-react";
import Reveal from "@/components/ui/reveal";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

const galleryPhotos = [
  { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80", title: "Interactive Literacy & Reading", category: "Classroom" },
  { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", title: "Educational Wooden Building Blocks", category: "Montessori" },
  { src: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800&q=80", title: "Outdoor Physical Play & Nature", category: "Outdoor" },
  { src: "https://images.unsplash.com/photo-1567057419565-4349c679c078?w=800&q=80", title: "Creative Painting & Expression", category: "Arts" },
  { src: "https://images.unsplash.com/photo-1522661067900-ab829854a57f?w=800&q=80", title: "Morning Circle Time & Values", category: "Community" },
  { src: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80", title: "Hygienic Toddler Nursery Facilities", category: "Facilities" },
];

export default function GallerySection() {
  const [activeItem, setActiveItem] = useState<{ src: string; title: string; category: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="section" style={{ background: "oklch(93% 0.016 82)" }}>
      <div className="container">
        
        {/* Header */}
        <div className="text-center mb-14">
          <Reveal>
            <span className="eyebrow mb-6 inline-flex">
              <Camera className="w-3 h-3" />
              Life at Pikadon
            </span>
          </Reveal>
          <Reveal delay={80}>
            <h2 className="display-md mx-auto max-w-2xl" style={{ color: "oklch(22% 0.06 155)" }}>
              Inside our centre.<br />
              <em style={{ color: "oklch(68% 0.12 75)" }}>Real moments.</em>
            </h2>
          </Reveal>
          <Reveal delay={140}>
            <p
              className="body-md mt-4 max-w-xl mx-auto"
              style={{ color: "oklch(50% 0.010 90)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Click any photo to view full screen and see how we structure learning, play, and daily care.
            </p>
          </Reveal>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {galleryPhotos.map(({ src, title, category }, i) => (
            <Reveal key={src} delay={i * 60} direction="scale">
              <div
                className="card-shell cursor-pointer group h-full"
                onClick={() => setActiveItem({ src, title, category })}
              >
                <div className="card-core overflow-hidden relative flex flex-col h-full">
                  {/* Photo */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                    <img
                      src={src}
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />

                    {/* Hover Zoom Badge */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-sans font-semibold inline-flex items-center gap-2">
                        <ZoomIn className="w-4 h-4 text-[oklch(68%_0.12_75)]" />
                        Expand Photo
                      </span>
                    </div>
                  </div>

                  {/* Caption */}
                  <div className="p-5 flex flex-col justify-between flex-1" style={{ background: "oklch(99% 0.006 85)" }}>
                    <span className="label-xs mb-1" style={{ color: "oklch(68% 0.12 75)" }}>
                      {category}
                    </span>
                    <h3
                      className="font-display font-medium text-lg leading-snug"
                      style={{ color: "oklch(22% 0.06 155)" }}
                    >
                      {title}
                    </h3>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-xl"
            onClick={() => setActiveItem(null)}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-6 right-6 z-10 w-11 h-11 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-3xl w-full bg-[oklch(99%_0.006_85)] rounded-3xl overflow-hidden shadow-2xl border border-[oklch(68%_0.12_75_/0.25)] flex flex-col md:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="md:w-3/5 aspect-[4/3] md:aspect-auto overflow-hidden bg-black">
                <img
                  src={activeItem.src}
                  alt={activeItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="md:w-2/5 p-6 md:p-8 flex flex-col justify-between" style={{ background: "oklch(97% 0.012 85)" }}>
                <div>
                  <span className="eyebrow mb-3 inline-flex">{activeItem.category}</span>
                  <h3 className="font-display font-medium text-2xl md:text-3xl mb-3" style={{ color: "oklch(22% 0.06 155)" }}>
                    {activeItem.title}
                  </h3>
                  <p className="body-sm text-[oklch(30%_0.015_90)] font-sans leading-relaxed mb-6">
                    A glimpse into daily life at Pikadon Child Development Centre in Najjera — built for safety, structured learning, and authentic care.
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4 border-t border-[oklch(68%_0.12_75_/0.15)]">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold !py-2.5 w-full justify-center"
                  >
                    Book a Visit
                    <span className="btn-arrow !w-6 !h-6">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                  <button
                    onClick={() => setActiveItem(null)}
                    className="btn-ghost !py-2 w-full text-center justify-center !border-[oklch(22%_0.06_155_/0.2)]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
