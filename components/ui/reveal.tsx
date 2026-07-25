"use client";

import { useEffect, useRef } from "react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "right" | "scale";
  threshold?: number;
  once?: boolean;
  style?: React.CSSProperties;
}

/**
 * Scroll-reveal wrapper using IntersectionObserver + CSS transitions.
 * Uses transform+opacity only → GPU-safe. No window.scroll listeners.
 * Emil Kowalski compliant: ease-out, no layout-triggering props.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
  threshold = 0.15,
  once = true,
  style,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          if (once) observer.unobserve(el);
        } else if (!once) {
          el.classList.remove("is-visible");
        }
      },
      { threshold, rootMargin: "-60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold]);

  return (
    <div
      ref={ref}
      data-reveal={direction === "up" ? "" : direction}
      data-delay={delay > 0 ? String(delay) : undefined}
      className={className}
      style={{
        ...style,
        transitionDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {children}
    </div>
  );
}
