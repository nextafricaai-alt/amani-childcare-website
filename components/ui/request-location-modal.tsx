"use client";

import { useState } from "react";
import { X, MapPin, Send, CheckCircle2 } from "lucide-react";

interface RequestLocationModalProps {
  buttonText?: string;
  className?: string;
  variant?: "gold" | "ghost" | "link";
}

export default function RequestLocationModal({
  buttonText = "Request Pikadon in your area",
  className = "",
  variant = "gold",
}: RequestLocationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !location) return;

    // Generate pre-filled WhatsApp message for location requests
    const whatsappNumber = "256706028899";
    const textMessage = `Hello Pikadon! I would love to request a Pikadon Child Development Centre campus in my area. 

📍 Proposed Location: ${location}
👤 Name: ${name}
📞 Phone: ${phone || "Not provided"}`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(textMessage)}`;

    setSubmitted(true);

    // Short delay to let the user see the success screen before opening WhatsApp
    setTimeout(() => {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setIsOpen(false);
      // Reset form
      setName("");
      setPhone("");
      setLocation("");
      setSubmitted(false);
    }, 1500);
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === "gold" && (
        <button
          onClick={() => setIsOpen(true)}
          className={`btn-gold font-sans font-semibold inline-flex items-center gap-2 ${className}`}
        >
          {buttonText}
          <MapPin className="w-3.5 h-3.5 text-[#0a1a11]" />
        </button>
      )}

      {variant === "ghost" && (
        <button
          onClick={() => setIsOpen(true)}
          className={`px-5 py-3 rounded-full border border-[#fcfaf4]/20 text-[#fcfaf4]/85 hover:border-[#e5a93c] hover:text-[#e5a93c] transition-all duration-200 text-sm font-sans font-semibold inline-flex items-center gap-2 ${className}`}
        >
          {buttonText}
          <MapPin className="w-3.5 h-3.5" />
        </button>
      )}

      {variant === "link" && (
        <button
          onClick={() => setIsOpen(true)}
          className={`text-[#e5a93c] hover:underline font-semibold text-sm inline-flex items-center gap-1.5 ${className}`}
        >
          <MapPin className="w-3.5 h-3.5" />
          {buttonText}
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#0a1a11]/85 backdrop-blur-md transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Container */}
          <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-b from-[#0e2518] to-[#0a1a11] p-6 sm:p-8 text-[#fcfaf4] shadow-2xl transition-all duration-300 transform scale-100">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#e5a93c]/15 text-[#e5a93c] mb-3">
                    <MapPin className="w-3 h-3" />
                    Pikadon Expansion Request
                  </span>
                  <h3 className="font-display text-xl sm:text-2xl font-bold leading-snug">
                    Request Pikadon in your area
                  </h3>
                  <p className="text-sm text-white/60 mt-1.5 leading-relaxed">
                    We are expanding our campuses across Uganda! Let us know where you want the next Pikadon campus built.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="req-name" className="text-xs font-bold text-white/80 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      id="req-name"
                      type="text"
                      required
                      placeholder="e.g. Patience Tumusiime"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#e5a93c] focus:bg-white/[0.08] text-white placeholder-white/30 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="req-phone" className="text-xs font-bold text-white/80 uppercase tracking-wider">
                      Phone Number (WhatsApp preferred)
                    </label>
                    <input
                      id="req-phone"
                      type="tel"
                      placeholder="e.g. 0706028899"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#e5a93c] focus:bg-white/[0.08] text-white placeholder-white/30 outline-none text-sm transition-all"
                    />
                  </div>

                  {/* Location Input */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="req-loc" className="text-xs font-bold text-white/80 uppercase tracking-wider">
                      Proposed Area / Town *
                    </label>
                    <input
                      id="req-loc"
                      type="text"
                      required
                      placeholder="e.g. Bugolobi, Muyenga, Entebbe, Mbarara"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/15 focus:border-[#e5a93c] focus:bg-white/[0.08] text-white placeholder-white/30 outline-none text-sm transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-gold w-full mt-2 font-sans font-semibold inline-flex items-center justify-center gap-2 py-3"
                >
                  Send Request
                  <Send className="w-4 h-4 text-[#0a1a11]" />
                </button>
              </form>
            ) : (
              /* Success Screen */
              <div className="flex flex-col items-center justify-center py-8 text-center gap-4 animate-fade-in">
                <CheckCircle2 className="w-16 h-16 text-[#e5a93c]" />
                <div>
                  <h4 className="text-xl font-bold">Thank You!</h4>
                  <p className="text-sm text-white/70 mt-2">
                    Opening WhatsApp to submit your request for <strong className="text-white">{location}</strong>. We'll be in touch!
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
