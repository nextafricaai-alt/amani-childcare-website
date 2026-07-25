"use client";

import { MessageCircle } from "lucide-react";
import { getWhatsAppUrl } from "@/lib/site-config";

export default function WhatsAppButton() {
  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Book a visit on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 pl-4 pr-3 py-3 rounded-full text-white font-sans font-semibold text-sm min-h-[44px]"
      style={{
        background: "#25D366",
        boxShadow: "0 4px 24px rgba(37, 211, 102, 0.4), 0 1px 4px rgba(0,0,0,0.15)",
        transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms cubic-bezier(0.23, 1, 0.32, 1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1.05) translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(37, 211, 102, 0.5), 0 2px 8px rgba(0,0,0,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(1) translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(37, 211, 102, 0.4), 0 1px 4px rgba(0,0,0,0.15)";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "scale(0.97)";
      }}
    >
      <MessageCircle className="w-4.5 h-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
      <span className="hidden sm:inline">Book a Visit</span>

      {/* Inner arrow island */}
      <span
        className="flex items-center justify-center w-6 h-6 rounded-full ml-1"
        style={{ background: "rgba(255,255,255,0.2)" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
          <path d="M2 8L8 2M8 2H4M8 2V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </a>
  );
}
