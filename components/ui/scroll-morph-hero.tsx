"use client";

import { useEffect, useState } from "react";

/* ────────────────────────────────────────────────────────────────────────
   Pikadon Editorial Hero Component

   High-End Design Features:
   - Customized card layouts per slide:
     - Pointing girl slide: Quote card positioned in the bottom right corner.
     - Celebrate boy & Peeking girl slides: Sleek, long and small horizontal cards
       positioned directly BELOW the word PIKADON without covering it.
     - Moody dark chalk dream slides: Strategic left-editorial glassmorphism cards.
   - Full-bleed smooth cross-fade slideshow featuring dark moody chalk-drawn
     career dream photography and bright studio children photography.
   - Zoomed out, uncropped, 100% clear display.
   ──────────────────────────────────────────────────────────────────────── */

const BG_SLIDES = [
  {
    src: "black-child-pointing-pikadon.jpg",
    alt: "Dark-skinned Black child pointing directly at PIKADON",
    bgColor: "#EFA825",
    badge: "✨ PIKADON EARLY LEARNING",
    quote: "Where curiosity ignites, confidence blossoms, and every single child is known by name.",
    author: "Pikadon Campus Vision · Najjera",
    pillBg: "rgba(255, 255, 255, 0.95)",
    textColor: "#1A2E22",
    accentColor: "#2D4F39",
    btnBg: "#2D4F39",
    btnText: "#FFFFFF",
    layoutType: "bottom-right",
    posClass: "bottom-16 sm:bottom-20 right-4 sm:right-10 md:right-14",
  },
  {
    src: "black-child-celebrate-pikadon.jpg",
    alt: "Dark-skinned Black child celebrating with arms raised bursting through yellow wall with PIKADON title",
    bgColor: "#F3B529",
    badge: "🎉 JOYFUL LEARNING HAVEN",
    quote: "A vibrant haven in Najjera where little leaders discover the thrill of learning every day!",
    author: "Tariq · Age 5 · Senior Kinder",
    pillBg: "rgba(255, 255, 255, 0.95)",
    textColor: "#1A2E22",
    accentColor: "#D97706",
    btnBg: "#D97706",
    btnText: "#FFFFFF",
    layoutType: "horizontal-below-pikadon",
    posClass: "top-[66%] sm:top-[68%] right-[2%] sm:right-[5%] md:right-[8%]",
  },
  {
    src: "black-child-doctor-dream.jpg",
    alt: "Dark-skinned Black child dreaming of being a doctor with chalk drawings",
    bgColor: "#142533",
    badge: "🩺 FUTURE DOCTOR PROMISE",
    quote: "My nanny at Pikadon says if I listen to my parents, eat well, and stay curious, I will be a great doctor one day!",
    author: "Kato · Age 5 · Junior Scholar",
    pillBg: "rgba(15, 23, 42, 0.92)",
    textColor: "#FCFAF4",
    accentColor: "#38BDF8",
    btnBg: "#38BDF8",
    btnText: "#0F172A",
    layoutType: "left-editorial",
    posClass: "top-28 sm:top-36 left-4 sm:left-10 md:left-14",
  },
  {
    src: "black-child-dark-astronaut.jpg",
    alt: "Dark-skinned Black child astronaut space dream with chalk helmet and rocket",
    bgColor: "#181E29",
    badge: "🚀 BIG DREAMS & DISCOVERY",
    quote: "My nanny at Pikadon says if I dream big and keep asking questions, I can explore the universe as an astronaut!",
    author: "Zuri · Age 4 · Explorer Class",
    pillBg: "rgba(15, 23, 42, 0.92)",
    textColor: "#FCFAF4",
    accentColor: "#F472B6",
    btnBg: "#F472B6",
    btnText: "#0F172A",
    layoutType: "left-editorial",
    posClass: "top-28 sm:top-36 left-4 sm:left-10 md:left-14",
  },
  {
    src: "black-child-lightbulb-idea.jpg",
    alt: "Dark-skinned Black child looking up thoughtfully at glowing lightbulb idea",
    bgColor: "#364147",
    badge: "💡 CREATIVE THINKING",
    quote: "Nurturing brilliant young minds with hands-on discovery, problem solving, and endless wonder.",
    author: "Montessori Discovery Method",
    pillBg: "rgba(26, 46, 34, 0.94)",
    textColor: "#FCFAF4",
    accentColor: "#FBBF24",
    btnBg: "#FBBF24",
    btnText: "#1A2E22",
    layoutType: "bottom-right",
    posClass: "bottom-16 sm:bottom-20 right-4 sm:right-10 md:right-14",
  },
  {
    src: "black-children-circle-learning.jpg",
    alt: "Overhead view of dark-skinned Black children sitting in circle learning with teacher",
    bgColor: "#D5CBC0",
    badge: "💛 VETTED CARE & WARMTH",
    quote: "A warm, loving family of certified caregivers dedicated to guiding your child's growth step by step.",
    author: "Caregiver & Nanny Excellence",
    pillBg: "rgba(255, 255, 255, 0.95)",
    textColor: "#1A2E22",
    accentColor: "#059669",
    btnBg: "#059669",
    btnText: "#FFFFFF",
    layoutType: "left-editorial",
    posClass: "top-28 sm:top-36 left-4 sm:left-10 md:left-14",
  },
  {
    src: "black-child-peeking-pikadon.jpg",
    alt: "Dark-skinned Black child peeking behind PIKADON poster board",
    bgColor: "#FAF8F5",
    badge: "🛡️ SAFE & SANITIZED SPACES",
    quote: "Safe, sanitized, and playful spaces designed to make every morning feel like a magical adventure.",
    author: "Pikadon Health Standard",
    pillBg: "rgba(255, 255, 255, 0.95)",
    textColor: "#1A2E22",
    accentColor: "#2563EB",
    btnBg: "#2563EB",
    btnText: "#FFFFFF",
    layoutType: "horizontal-below-pikadon",
    posClass: "top-[70%] sm:top-[72%] right-[2%] sm:right-[5%] md:right-[8%]",
  },
];

export default function ScrollMorphHero() {
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % BG_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-screen min-h-[640px] max-h-[1080px] overflow-hidden select-none">
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
          z-index: 30;
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

      {/* Full-Bleed Clear Background Slideshow of Dark-Skinned Children Studio & Chalk Dream Photography */}
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

      {/* Strategic Floating High-End Quote Cards Layer */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
        {BG_SLIDES.map((slide, idx) => (
          <div
            key={slide.src}
            className={`absolute ${slide.posClass} transition-all duration-700 ease-out transform ${
              idx === slideIdx
                ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
                : "opacity-0 translate-y-4 pointer-events-none scale-95"
            }`}
          >
            {slide.layoutType === "horizontal-below-pikadon" ? (
              /* Long and Small Horizontal Card sitting directly below the PIKADON title without covering it */
              <div
                className="w-[90vw] max-w-md sm:max-w-lg md:max-w-xl rounded-xl p-3 sm:p-4 shadow-xl backdrop-blur-xl border border-white/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-4 relative overflow-hidden"
                style={{
                  backgroundColor: slide.pillBg,
                  color: slide.textColor,
                  boxShadow: "0 12px 30px -10px rgba(0, 0, 0, 0.22)",
                }}
              >
                <div
                  className="absolute top-0 left-0 bottom-0 w-1.5"
                  style={{ backgroundColor: slide.accentColor }}
                />
                <div className="flex-1 pl-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase mb-1 bg-black/5 dark:bg-white/10">
                    <span style={{ color: slide.accentColor }}>●</span>
                    <span>{slide.badge}</span>
                  </div>
                  <blockquote className="font-[family-name:var(--font-fredoka)] text-xs sm:text-sm font-semibold leading-tight">
                    "{slide.quote}"
                  </blockquote>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center pl-2 sm:pl-0 border-t sm:border-t-0 sm:border-l border-black/10 dark:border-white/10 pt-1.5 sm:pt-0 sm:pl-4">
                  <span className="text-[11px] sm:text-xs font-medium opacity-80 whitespace-nowrap">
                    {slide.author}
                  </span>
                  <a
                    href="/visit"
                    className="px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all shrink-0 hover:scale-105 shadow-sm"
                    style={{
                      backgroundColor: slide.btnBg,
                      color: slide.btnText,
                    }}
                  >
                    Book Visit →
                  </a>
                </div>
              </div>
            ) : (
              /* Editorial Card (Left or Bottom Right) */
              <div
                className="w-[92vw] sm:w-[400px] md:w-[440px] rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-xl border border-white/30 relative overflow-hidden"
                style={{
                  backgroundColor: slide.pillBg,
                  color: slide.textColor,
                  boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.25)",
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: slide.accentColor }}
                />
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2.5 bg-white/20 border border-white/20">
                  <span style={{ color: slide.accentColor }}>●</span>
                  <span>{slide.badge}</span>
                </div>
                <blockquote className="font-[family-name:var(--font-fredoka)] text-sm sm:text-base md:text-lg font-semibold leading-snug tracking-wide mb-3.5">
                  "{slide.quote}"
                </blockquote>
                <div className="flex items-center justify-between pt-2.5 border-t border-black/10 dark:border-white/10 text-xs sm:text-sm">
                  <span className="font-medium opacity-80">{slide.author}</span>
                  <a
                    href="/visit"
                    className="inline-flex items-center gap-1 font-bold hover:underline transition-all"
                    style={{ color: slide.accentColor }}
                  >
                    Book a Visit →
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Pill Indicators (Bottom Center) */}
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
