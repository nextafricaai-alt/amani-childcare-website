import { ShieldCheck, HeartPulse, Video, MessageSquare, Cross } from "lucide-react";
import Reveal from "@/components/ui/reveal";

const items = [
  { Icon: ShieldCheck, label: "Licensed & Inspected" },
  { Icon: HeartPulse, label: "First-Aid Certified" },
  { Icon: Video, label: "CCTV Throughout" },
  { Icon: MessageSquare, label: "Daily WhatsApp Reports" },
  { Icon: Cross, label: "Christian Values" },
];

export default function TrustStrip() {
  return (
    <div
      className="w-full py-5 px-4"
      style={{
        background: "oklch(28% 0.07 155)",
        borderTop: "1px solid oklch(68% 0.12 75 / 0.15)",
        borderBottom: "1px solid oklch(68% 0.12 75 / 0.15)",
      }}
    >
      <ul
        className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-7 md:gap-14"
        aria-label="Trust signals"
      >
        {items.map(({ Icon, label }, i) => (
          <Reveal key={label} delay={i * 50}>
            <li className="trust-item" style={{ color: "oklch(97% 0.012 85 / 0.7)" }}>
              <Icon
                className="w-4 h-4"
                style={{ color: "oklch(68% 0.12 75)" }}
                aria-hidden
              />
              {label}
            </li>
          </Reveal>
        ))}
      </ul>
    </div>
  );
}
