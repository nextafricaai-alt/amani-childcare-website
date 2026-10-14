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
        background: "oklch(35.1% 0.082 337.3)",
        borderTop: "1px solid oklch(82.8% 0.166 87.0 / 0.15)",
        borderBottom: "1px solid oklch(82.8% 0.166 87.0 / 0.15)",
      }}
    >
      <ul
        className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-7 md:gap-14"
        aria-label="Trust signals"
      >
        {items.map(({ Icon, label }, i) => (
          <Reveal key={label} delay={i * 50}>
            <li className="trust-item" style={{ color: "oklch(98.5% 0.011 71.9 / 0.7)" }}>
              <Icon
                className="w-4 h-4"
                style={{ color: "oklch(82.8% 0.166 87.0)" }}
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
