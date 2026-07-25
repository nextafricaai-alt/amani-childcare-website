"use client";

import dynamic from "next/dynamic";

const ScrollMorphHero = dynamic(
  () => import("@/components/ui/scroll-morph-hero"),
  { ssr: false, loading: () => <HeroFallback /> }
);

function HeroFallback() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ background: "oklch(97% 0.012 85)" }}
    />
  );
}

export default function HeroWrapper() {
  return <ScrollMorphHero />;
}
