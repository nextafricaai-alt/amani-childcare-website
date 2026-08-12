"use client";

import { useEffect, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Pikadon Editorial Hero Component

   Features:
   - Full-bleed smooth cross-fade slideshow featuring dark-skinned children
     studio photography pointing directly at the PIKADON brand title.
   - Zoomed out, uncropped, 100% clear display with zero dark overlays.
   - Inspiring, high-impact sentence on every slide that attracts parents & kids.
   - Clean editorial corner labels.
   ──────────────────────────────────────────────────────────────────────── */

const BG_SLIDES = [
  {
    src: "black-child-pointing-pikadon.jpg",
    alt: "Dark-skinned Black child pointing directly at PIKADON",
    bgColor: "#EFA825",
    textColor: "#1A2E22",
    pillBg: "rgba(255, 255, 255, 0.94)",
    quote: "Where curiosity ignites, confidence blossoms, and every single child is known by name.",
  },
  {
    src: "black-child-celebrate-pikadon.jpg",
    alt: "Dark-skinned Black child celebrating with arms raised bursting through yellow wall with PIKADON title",
    bgColor: "#F3B529",
    textColor: "#1A2E22",
    pillBg: "rgba(255, 255, 255, 0.94)",
    quote: "A joyful haven in Najjera where little leaders discover the thrill of learning every day!",
  },
  {
    src: "black-child-lightbulb-idea.jpg",
    alt: "Dark-skinned Black child looking up thoughtfully at glowing lightbulb idea",
    bgColor: "#364147",
    textColor: "#FCFAF4",
    pillBg: "rgba(26, 46, 34, 0.94)",
    quote: "Nurturing brilliant young minds with hands-on discovery, creative problem solving, and endless wonder.",
  },
  {
    src: "black-children-circle-learning.jpg",
    alt: "Overhead view of dark-skinned Black children sitting in circle learning with teacher",
    bgColor: "#D5CBC0",
    textColor: "#1A2E22",
    pillBg: "rgba(255, 255, 255, 0.94)",
    quote: "A warm, loving family of certified caregivers dedicated to guiding your child's growth step by step.",
  },
  {
    src: "black-child-peeking-pikadon.jpg",
    alt: "Dark-skinned Black child peeking behind PIKADON poster board",
    bgColor: "#FAF8F5",
    textColor: "#1A2E22",
    pillBg: "rgba(255, 255, 255, 0.94)",
    quote: "Safe, sanitized, and playful spaces designed to make every morning feel like a magical adventure.",
  },
  {
    src: "black-child-astronaut.jpg",
    alt: "Dark-skinned Black child astronaut dreaming big",
    bgColor: "#ECEAE6",
    textColor: "#1A2E22",
    pillBg: "rgba(255, 255, 255, 0.94)",
    quote: "Empowering big dreams in little hearts — building foundational skills for a lifetime of success.",
  },
  {
    src: "black-child-blocks.jpg",
    alt: "Dark-skinned Black child playing with Montessori blocks",
    bgColor: "#E5E1D8",
    textColor: "#1A2E22",
    pillBg: "rgba(255, 255, 255, 0.94)",
    quote: "Structured Montessori play that builds focus, fine motor skills, and independent thinking.",
  },
];

export default function ScrollMorphHero() {
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % BG_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen min-h-[580px] max-h-[1080px] overflow-hidden select-none">
      <style jsx>{`
        .kpf-hero-slideshow {
          position: absolute;
          inset: 0;
          overflow: hidden;
          user-select: none;
        }
        .kpf-slide-item {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
        }
        .kpf-chrome {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 20;
          color: #1a2e22;
          text-transform: uppercase;
          letter-spacing: 0.16em;
        }
        .kpf-chrome span {
          position: absolute;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          text-shadow: 0 1px 4px rgba(255, 255, 255, 0.8);
        }
        .kpf-tl {
          top: 26px;
          left: 30px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: #2d4f39;
        }
        .kpf-tr {
          top: 26px;
          right: 30px;
        }
        .kpf-bl {
          bottom: 26px;
          left: 30px;
        }
        .kpf-br {
          bottom: 26px;
          right: 30px;
        }

        @media (max-width: 640px) {
          .kpf-chrome span {
            font-size: 9px;
            letter-spacing: 0.12em;
          }
          .kpf-tl,
          .kpf-tr {
            top: 18px;
          }
          .kpf-tl,
          .kpf-bl {
            left: 18px;
          }
          .kpf-tr,
          .kpf-br {
            right: 18px;
          }
          .kpf-bl,
          .kpf-br {
            bottom: 18px;
          }
        }
      `}</style>

      {/* Full-Bleed Clear Background Slideshow of Dark-Skinned Children Studio Photography */}
      <div className="kpf-hero-slideshow">
        {BG_SLIDES.map((slide, idx) => (
          <div
            key={slide.src}
            className="kpf-slide-item flex items-center justify-center p-2 sm:p-4 md:p-8"
            style={{
              opacity: idx === slideIdx ? 1 : 0,
              backgroundColor: slide.bgColor,
              transition:
                "opacity 1400ms cubic-bezier(0.4, 0, 0.2, 1), background-color 1400ms cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <img
              src={`/${slide.src}`}
              alt={slide.alt}
              className="w-full h-full object-contain object-center"
            />
          </div>
        ))}
      </div>

      {/* Inspiring Parent & Child Attracting Sentence Overlay */}
      <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-2xl text-center pointer-events-none px-2 sm:px-4">
        {BG_SLIDES.map((slide, idx) => (
          <div
            key={slide.src}
            className={`transition-all duration-700 ease-out transform ${
              idx === slideIdx
                ? "opacity-100 translate-y-0 relative scale-100"
                : "opacity-0 translate-y-4 absolute inset-0 pointer-events-none scale-95"
            }`}
          >
            <div
              className="inline-block px-5 py-3 sm:px-8 sm:py-4 rounded-2xl shadow-xl backdrop-blur-md border border-white/40"
              style={{
                backgroundColor: slide.pillBg,
                color: slide.textColor,
              }}
            >
              <p className="font-[family-name:var(--font-fredoka)] text-xs sm:text-base md:text-lg font-semibold leading-relaxed tracking-wide">
                "{slide.quote}"
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {BG_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSlideIdx(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              idx === slideIdx
                ? "w-8 bg-[#2D4F39]"
                : "w-2.5 bg-[#2D4F39]/40 hover:bg-[#2D4F39]/70"
            }`}
          />
        ))}
      </div>

      <div className="kpf-chrome">
        <span className="kpf-tl">PIKADON®</span>
        <span className="kpf-tr">Editorial Folio · Volume 01</span>
        <span className="kpf-bl">Licensed Child Care · Early Childhood</span>
        <span className="kpf-br">Najjera, Kampala</span>
      </div>
    </div>
  );
}
