"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ZoomIn, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

// Full bleed background hero slides uploaded by user
const HERO_SLIDES = [
  { src: "hero-slides/slide2.jpg", title: "Spacious & Hygienic Classrooms", caption: "Designed for safety, focus, and early development" },
  { src: "hero-slides/slide3.webp", title: "Themed Early Childhood Spaces", caption: "Vibrant activity areas for sensory & physical play" },
  { src: "hero-slides/slide4.jpg", title: "Interactive Learning & Literacy", caption: "Individual caregiver attention and rich learning materials" },
  { src: "hero-slides/slide5.jpg", title: "Structured Daily Rhythm", caption: "Balanced learning, rest, healthy meals, and play" },
  { src: "hero-slides/slide6.jpg", title: "Pikadon Childcare Family", caption: "Warm, safe, and nurturing environment for ages 2–5" },
];

export default function ScrollMorphHero() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeModalItem, setActiveModalItem] = useState<{ src: string; title: string; caption?: string } | null>(null);

  // Autoplay full bleed background slideshow every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModalItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <div className="relative w-full h-[100svh] min-h-[640px] max-h-[960px] overflow-hidden bg-[oklch(97%_0.012_85)]">
      {/* ── FULL BLEED BACKGROUND SLIDESHOW ── */}
      <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlideIndex}
            src={HERO_SLIDES[currentSlideIndex].src}
            alt={HERO_SLIDES[currentSlideIndex].title}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
      </div>

      {/* ── Main Hero Content Stack ── */}
      <div className="flex h-full w-full flex-col items-center justify-center relative z-20">
        <div className="absolute z-20 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4 sm:px-6 w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="eyebrow mb-3 sm:mb-5 pointer-events-auto !text-[9px] sm:!text-xs !py-1.5 !px-4 eyebrow-light !bg-black/60 !border-white/20 !text-amber-200 backdrop-blur-md shadow-xl"
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
            {`Our Centre & Campus · ${HERO_SLIDES[currentSlideIndex].title}`}
          </motion.div>

          <motion.h1
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="font-display font-light text-3xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.03] mb-4 sm:mb-6 select-none drop-shadow-lg text-[oklch(97%_0.012_85)]"
          >
            Work in peace.<br />
            <em style={{ color: "oklch(68% 0.12 75)", fontStyle: "italic" }}>
              Your child
            </em>{" "}
            is safe, loved & growing.
          </motion.h1>

          <motion.p
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-xs sm:text-lg md:text-xl font-sans leading-relaxed max-w-xs sm:max-w-2xl mb-6 sm:mb-8 text-white/90 drop-shadow-md"
          >
            Pikadon is a licensed child development centre in {SITE_CONFIG.estate} for children aged 2–5 — where every caregiver is vetted and trained, every day is structured, and you hear from us every single day.
          </motion.p>

          <motion.div
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap gap-3 sm:gap-5 justify-center pointer-events-auto mb-2"
          >
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold !py-3 !px-7 sm:!py-4 sm:!px-9 !text-xs sm:!text-base shadow-2xl"
            >
              Book a Visit
              <span className="btn-arrow !w-5 !h-5 sm:!w-6 sm:!h-6">
                <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </a>
            <Link
              href="/our-promise"
              className="btn-ghost !py-3 !px-7 sm:!py-4 sm:!px-9 !text-xs sm:!text-base !border-white/30 !text-white hover:!bg-white/10 backdrop-blur-md"
            >
              Our Promise
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0.8 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.6 }}
            className="text-[9px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] uppercase mt-2 text-white/80 drop-shadow"
          >
            SCROLL TO EXPLORE ↓
          </motion.p>
        </div>

        {/* ── Full-Bleed Slideshow Controls & Caption Bar (Bottom Bar) ── */}
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute bottom-6 left-6 right-6 z-30 flex flex-col sm:flex-row items-center justify-between gap-3 pointer-events-auto"
        >
          {/* Active Slide Caption Badge */}
          <div
            className="bg-black/60 backdrop-blur-xl border border-white/15 px-4 py-2 rounded-2xl text-white flex items-center gap-3 cursor-pointer hover:bg-black/80 transition-colors shadow-2xl"
            onClick={() => setActiveModalItem(HERO_SLIDES[currentSlideIndex])}
          >
            <div className="w-7 h-7 rounded-xl bg-[oklch(68%_0.12_75)] text-black flex items-center justify-center flex-shrink-0 font-bold text-xs">
              {currentSlideIndex + 1}
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold font-sans text-white">
                {HERO_SLIDES[currentSlideIndex].title}
              </p>
              <p className="text-[10px] text-white/70 font-sans hidden sm:block">
                {HERO_SLIDES[currentSlideIndex].caption}
              </p>
            </div>
            <ZoomIn className="w-4 h-4 text-white/60 ml-2" />
          </div>

          {/* Prev / Next & Indicator Dots */}
          <div className="flex items-center gap-3 bg-black/60 backdrop-blur-xl border border-white/15 px-3 py-2 rounded-2xl shadow-2xl">
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1.5 px-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentSlideIndex === idx
                      ? "w-5 bg-[oklch(68%_0.12_75)]"
                      : "w-1.5 bg-white/30 hover:bg-white/60"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              aria-label="Next slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* ── Modal Lightbox for Slide Detail View ── */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-3xl w-full bg-[oklch(22%_0.06_155)] rounded-3xl overflow-hidden border border-white/20 shadow-2xl"
            >
              <button
                onClick={() => setActiveModalItem(null)}
                className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="relative aspect-[4/3] w-full bg-black">
                <img
                  src={activeModalItem.src}
                  alt={activeModalItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6 text-left">
                <span className="eyebrow eyebrow-light mb-2 inline-flex">
                  Pikadon Campus Facility
                </span>
                <h3 className="font-display text-2xl font-semibold text-white mb-2">
                  {activeModalItem.title}
                </h3>
                <p className="body-md text-white/80 font-sans">
                  {activeModalItem.caption || "High-quality early childhood learning environment built to international standards."}
                </p>
                <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-white/10">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold !py-2.5 !px-5"
                  >
                    Schedule a Visit
                    <ArrowUpRight className="w-4 h-4 ml-1" />
                  </a>
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="btn-ghost !py-2.5 !px-5 !border-white/30 !text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
