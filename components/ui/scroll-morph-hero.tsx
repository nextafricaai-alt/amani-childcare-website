"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, useTransform, useSpring, useMotionValue, AnimatePresence } from "framer-motion";
import { ArrowUpRight, X, ZoomIn, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/site-config";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
  src: string;
  title: string;
  index: number;
  total: number;
  phase: AnimationPhase;
  target: { x: number; y: number; rotation: number; scale: number; opacity: number };
  onClick: () => void;
}

// --- FlipCard Component ---
const IMG_WIDTH = 55;
const IMG_HEIGHT = 78;

function FlipCard({ src, title, index, phase, target, onClick }: FlipCardProps) {
  return (
    <motion.div
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{ type: "spring", stiffness: 40, damping: 15 }}
      style={{
        position: "absolute",
        width: IMG_WIDTH,
        height: IMG_HEIGHT,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      className="cursor-pointer group"
      onClick={onClick}
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={src}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg flex flex-col items-center justify-center p-2 border"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            backgroundColor: "oklch(22% 0.06 155)",
            borderColor: "oklch(68% 0.12 75)",
          }}
        >
          <div className="text-center">
            <ZoomIn className="w-3.5 h-3.5 mx-auto mb-1 text-[oklch(68%_0.12_75)]" />
            <p className="text-[7px] font-bold uppercase tracking-widest text-white leading-tight">
              View
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 1800;

// Full bleed background hero slides uploaded by user
const HERO_SLIDES = [
  { src: "hero-slides/slide1.jpg", title: "Hudson & Patience Tumusiime", caption: "Founders & Executive Leadership at Pikadon" },
  { src: "hero-slides/slide2.jpg", title: "Spacious & Hygienic Classrooms", caption: "Designed for safety, focus, and early development" },
  { src: "hero-slides/slide3.webp", title: "Themed Early Childhood Spaces", caption: "Vibrant activity areas for sensory & physical play" },
  { src: "hero-slides/slide4.jpg", title: "Interactive Learning & Literacy", caption: "Individual caregiver attention and rich learning materials" },
  { src: "hero-slides/slide5.jpg", title: "Structured Daily Rhythm", caption: "Balanced learning, rest, healthy meals, and play" },
  { src: "hero-slides/slide6.jpg", title: "Pikadon Childcare Family", caption: "Warm, safe, and nurturing environment for ages 2–5" },
];

const GALLERY_ITEMS = [
  { src: "https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&q=80", title: "Interactive Classroom Learning" },
  { src: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&q=80", title: "Storytime & Literacy Corner" },
  { src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80", title: "Engaged Group Activities" },
  { src: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80", title: "Educational Wooden Blocks" },
  { src: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&q=80", title: "Guided Early Childhood Education" },
  { src: "https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?w=800&q=80", title: "Safe Outdoor Playground" },
  { src: "https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?w=800&q=80", title: "Nursery & Care Environment" },
  { src: "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&q=80", title: "Tactile Sensory Play" },
  { src: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&q=80", title: "Montessori Learning Tools" },
  { src: "https://images.unsplash.com/photo-1567057419565-4349c679c078?w=800&q=80", title: "Creative Arts & Crafts" },
  { src: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=800&q=80", title: "Early Mathematics & Logic" },
  { src: "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80", title: "Joyful Classmates & Community" },
  { src: "https://images.unsplash.com/photo-1540479859555-17af45c78602?w=800&q=80", title: "Social Interaction & Play" },
  { src: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&q=80", title: "Structured Daily Classroom Rhythm" },
  { src: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&q=80", title: "Problem Solving & Discovery" },
  { src: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&q=80", title: "Fine Motor Skills & Drawing" },
  { src: "https://images.unsplash.com/photo-1522661067900-ab829854a57f?w=800&q=80", title: "Circle Time & Values Sharing" },
  { src: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&q=80", title: "Nature Exploration & Physical Play" },
  { src: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=800&q=80", title: "Bright, Hygienic Nursery Facilities" },
  { src: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", title: "Amani Family & Child Development" },
];

const lerp = (start: number, end: number, t: number) => start * (1 - t) + end * t;

export default function ScrollMorphHero() {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 390, height: 750 });
  const [activeModalItem, setActiveModalItem] = useState<{ src: string; title: string } | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth || window.innerWidth,
          height: containerRef.current.offsetHeight || window.innerHeight,
        });
      }
    };

    updateDimensions();

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (scrollRef.current >= MAX_SCROLL && e.deltaY > 0) return;
      if (scrollRef.current <= 0 && e.deltaY < 0) return;

      e.preventDefault();
      const newScroll = Math.min(Math.max(scrollRef.current + e.deltaY, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;

      if (scrollRef.current >= MAX_SCROLL && deltaY > 0) return;
      if (scrollRef.current <= 0 && deltaY < 0) return;

      touchStartY = touchY;
      const newScroll = Math.min(Math.max(scrollRef.current + deltaY, 0), MAX_SCROLL);
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, { passive: false });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  const morphProgress = useTransform(virtualScroll, [0, 1200], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 40, damping: 20 });

  const scrollRotate = useTransform(virtualScroll, [1200, 1800], [0, 180]);
  const smoothScrollRotate = useSpring(scrollRotate, { stiffness: 40, damping: 20 });

  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 30, damping: 20 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      mouseX.set(normalizedX * 100);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("line"), 500);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 2500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const scatterPositions = useMemo(() => {
    return GALLERY_ITEMS.map(() => ({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 600,
      rotation: (Math.random() - 0.5) * 180,
      scale: 0.5,
      opacity: 0,
    }));
  }, []);

  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
    const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
    const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
    return () => {
      unsubscribeMorph();
      unsubscribeRotate();
      unsubscribeParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  // Autoplay full bleed background slideshow when morphing finishes (morphValue > 0.3)
  useEffect(() => {
    if (morphValue < 0.3) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [morphValue]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveModalItem(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isMobile = containerSize.width < 768;

  // Ring radius tailored for mobile vs desktop
  const circleRadius = isMobile
    ? Math.min(containerSize.width * 0.44, 165)
    : Math.min(containerSize.height * 0.38, 380);

  const prevSlide = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  };
  const nextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  const isFullBleedActive = morphValue > 0.35;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        background: isFullBleedActive ? "oklch(14% 0.018 95)" : "oklch(97% 0.012 85)",
        transition: "background-color 700ms ease-out",
      }}
    >

      {/* ── FULL BLEED BACKGROUND SLIDESHOW (Covers 100% Width & Height) ── */}
      <AnimatePresence>
        {isFullBleedActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0 w-full h-full overflow-hidden"
          >
            {/* Crossfading Slide Images */}
            <AnimatePresence mode="wait">
              <motion.img
                key={currentSlideIndex}
                src={HERO_SLIDES[currentSlideIndex].src}
                alt={HERO_SLIDES[currentSlideIndex].title}
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </AnimatePresence>

            {/* Premium Dark Vignette Overlay for Crisp High-Contrast Typography */}
            <div
              className="absolute inset-0 z-10"
              style={{
                background: `
                  radial-gradient(circle at 50% 50%, rgba(14, 24, 18, 0.55) 0%, rgba(14, 24, 18, 0.82) 100%),
                  linear-gradient(to bottom, rgba(14, 24, 18, 0.7) 0%, rgba(14, 24, 18, 0.4) 50%, rgba(14, 24, 18, 0.85) 100%)
                `,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Initial Ethereal Mesh Background (Visible during ring morph) ── */}
      {!isFullBleedActive && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-0 opacity-80"
            style={{
              backgroundImage: `
                radial-gradient(circle at 18% 22%, oklch(68% 0.12 75 / 0.18) 0%, transparent 45%),
                radial-gradient(circle at 82% 28%, oklch(22% 0.06 155 / 0.12) 0%, transparent 50%),
                radial-gradient(circle at 50% 85%, oklch(68% 0.12 75 / 0.10) 0%, transparent 55%)
              `,
            }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0"
            style={{
              width: circleRadius * 2,
              height: circleRadius * 2,
              border: "1px dashed oklch(68% 0.12 75 / 0.18)",
              opacity: introPhase === "circle" ? Math.max(1 - morphValue * 1.5, 0) : 0,
              transition: "opacity 400ms cubic-bezier(0.23, 1, 0.32, 1)",
            }}
          />
        </>
      )}

      {/* ── Main Hero Content Stack ── */}
      <div className="flex h-full w-full flex-col items-center justify-center perspective-1000 relative z-20">

        {/* Central Typography Block */}
        <div className="absolute z-20 flex flex-col items-center justify-center text-center pointer-events-none top-1/2 -translate-y-1/2 px-4 sm:px-6 w-full max-w-4xl">

          {/* Eyebrow badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={
              introPhase === "circle"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: -12 }
            }
            transition={{ duration: 0.8 }}
            className={`eyebrow mb-3 sm:mb-5 pointer-events-auto !text-[9px] sm:!text-xs !py-1.5 !px-4 ${
              isFullBleedActive ? "eyebrow-light !bg-black/60 !border-white/20 !text-amber-200 backdrop-blur-md shadow-xl" : ""
            }`}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: isFullBleedActive ? "#F59E0B" : "oklch(68% 0.12 75)" }}
            />
            {isFullBleedActive ? `Our Centre & Campus · ${HERO_SLIDES[currentSlideIndex].title}` : `Now enrolling · ${SITE_CONFIG.foundingSpotsRemaining} places remain`}
          </motion.div>

          {/* High-Impact Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
            animate={
              introPhase === "circle"
                ? {
                    opacity: 1,
                    y: 0,
                    filter: "blur(0px)",
                    scale: 1 + morphValue * (isMobile ? 0.05 : 0.15),
                  }
                : { opacity: 0, filter: "blur(8px)" }
            }
            transition={{ duration: 0.4, type: "spring", stiffness: 60, damping: 20 }}
            className="font-display font-light text-3xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[1.03] mb-4 sm:mb-6 select-none drop-shadow-md"
            style={{
              color: isFullBleedActive ? "oklch(97% 0.012 85)" : "oklch(22% 0.06 155)",
              transformOrigin: "center center",
              transition: "color 500ms ease",
            }}
          >
            {isFullBleedActive ? (
              <>
                Pikadon {SITE_CONFIG.estate}.<br />
                <em style={{ color: "oklch(68% 0.12 75)", fontStyle: "italic" }}>
                  Work in peace.
                </em>
              </>
            ) : (
              <>
                Work in peace.<br />
                <em style={{ color: "oklch(68% 0.12 75)", fontStyle: "italic" }}>
                  Your child
                </em>{" "}
                is safe, loved & growing.
              </>
            )}
          </motion.h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={
              introPhase === "circle"
                ? { opacity: 1 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.4 }}
            className="text-xs sm:text-lg md:text-xl font-sans leading-relaxed max-w-xs sm:max-w-2xl mb-6 sm:mb-8"
            style={{
              color: isFullBleedActive ? "oklch(95% 0.01 85 / 0.9)" : "oklch(30% 0.015 90)",
              transition: "color 500ms ease",
            }}
          >
            Pikadon is a licensed child development centre in {SITE_CONFIG.estate} for children aged 2–5 — where every caregiver is vetted and trained, every day is structured, and you hear from us every single day.
          </motion.p>

          {/* Interactive CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={
              introPhase === "circle"
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 12 }
            }
            transition={{ duration: 0.8, delay: 0.25 }}
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
              className={`btn-ghost !py-3 !px-7 sm:!py-4 sm:!px-9 !text-xs sm:!text-base ${
                isFullBleedActive ? "!border-white/30 !text-white hover:!bg-white/10 backdrop-blur-md" : ""
              }`}
            >
              Our Promise
            </Link>
          </motion.div>

          {/* Scroll cue */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={
              introPhase === "circle" && morphValue < 0.3
                ? { opacity: 0.7 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.6 }}
            className="text-[9px] sm:text-[11px] font-sans font-semibold tracking-[0.2em] uppercase mt-2"
            style={{ color: "oklch(68% 0.12 75)" }}
          >
            SCROLL TO EXPLORE ↓
          </motion.p>
        </div>

        {/* ── Full-Bleed Slideshow Controls & Caption Bar (Bottom Bar) ── */}
        <AnimatePresence>
          {isFullBleedActive && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
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
          )}
        </AnimatePresence>

        {/* ── Animated Flip Cards Ring (Arc sits over background) ── */}
        <div className="relative flex items-center justify-center w-full h-full z-20">
          {GALLERY_ITEMS.slice(0, isMobile ? 12 : TOTAL_IMAGES).map((item, i) => {
            const count = isMobile ? 12 : TOTAL_IMAGES;
            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            if (introPhase === "scatter") {
              target = scatterPositions[i];
            } else if (introPhase === "line") {
              const lineSpacing = isMobile ? 40 : 70;
              const lineTotalWidth = count * lineSpacing;
              const lineX = i * lineSpacing - lineTotalWidth / 2;
              target = { x: lineX, y: 0, rotation: 0, scale: isMobile ? 0.6 : 1, opacity: 1 };
            } else {
              const circleAngle = (i / count) * 360;
              const circleRad = (circleAngle * Math.PI) / 180;
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
              };

              const baseRadius = Math.min(containerSize.width, containerSize.height * 1.5);
              const arcRadius = baseRadius * (isMobile ? 1.3 : 1.1);
              const arcApexY = containerSize.height * (isMobile ? 0.38 : 0.32);
              const arcCenterY = arcApexY + arcRadius;

              const spreadAngle = isMobile ? 110 : 130;
              const startAngle = -90 - spreadAngle / 2;
              const step = spreadAngle / (count - 1);

              const scrollProgress = Math.min(Math.max(rotateValue / 180, 0), 1);
              const maxRotation = spreadAngle * 0.8;
              const boundedRotation = -scrollProgress * maxRotation;

              const currentArcAngle = startAngle + i * step + boundedRotation;
              const arcRad = (currentArcAngle * Math.PI) / 180;

              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: isMobile ? 1.0 : 1.8,
              };

              const baseScale = isMobile ? 0.65 : 1;

              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(baseScale, arcPos.scale, morphValue),
                opacity: 1,
              };
            }

            return (
              <FlipCard
                key={i}
                src={item.src}
                title={item.title}
                index={i}
                total={count}
                phase={introPhase}
                target={target}
                onClick={() => setActiveModalItem(item)}
              />
            );
          })}
        </div>
      </div>

      {/* ── Fullscreen Lightbox Modal ── */}
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
              className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative max-w-3xl w-full bg-[oklch(99%_0.006_85)] rounded-3xl overflow-hidden shadow-2xl border border-[oklch(68%_0.12_75_/0.25)] flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="md:w-3/5 aspect-[4/3] md:aspect-auto overflow-hidden bg-black">
                <img
                  src={activeModalItem.src}
                  alt={activeModalItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details & WhatsApp CTA */}
              <div className="md:w-2/5 p-5 md:p-8 flex flex-col justify-between" style={{ background: "oklch(97% 0.012 85)" }}>
                <div>
                  <span className="eyebrow mb-2 inline-flex">Gallery Feature</span>
                  <h3 className="font-display font-medium text-xl md:text-3xl mb-2" style={{ color: "oklch(22% 0.06 155)" }}>
                    {activeModalItem.title}
                  </h3>
                  <p className="body-sm text-[oklch(30%_0.015_90)] font-sans leading-relaxed mb-4">
                    A glimpse into daily life at Amani Child Development Centre in Najjera — built for safety, structured learning, and authentic care.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-3 border-t border-[oklch(68%_0.12_75_/0.15)]">
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gold !py-2.5 w-full justify-center !text-xs sm:!text-sm"
                  >
                    Book a Visit to See This
                    <span className="btn-arrow !w-5 !h-5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </span>
                  </a>
                  <button
                    onClick={() => setActiveModalItem(null)}
                    className="btn-ghost !py-2 w-full text-center justify-center !text-xs !border-[oklch(22%_0.06_155_/0.2)]"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
