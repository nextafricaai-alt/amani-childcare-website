/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // OKLCH tokens exposed as Tailwind utilities
        green: {
          DEFAULT: "oklch(22% 0.06 155)",
          mid: "oklch(28% 0.07 155)",
          light: "oklch(35% 0.08 155)",
        },
        gold: {
          DEFAULT: "oklch(68% 0.12 75)",
          pale: "oklch(78% 0.09 78)",
        },
        cream: {
          DEFAULT: "oklch(97% 0.012 85)",
          deep: "oklch(93% 0.016 82)",
          raised: "oklch(99% 0.006 85)",
        },
        ink: {
          DEFAULT: "oklch(18% 0.02 95)",
          body: "oklch(30% 0.015 90)",
          muted: "oklch(50% 0.010 90)",
        },
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      transitionTimingFunction: {
        "ease-out-strong": "cubic-bezier(0.23, 1, 0.32, 1)",
        "ease-in-out-strong": "cubic-bezier(0.77, 0, 0.175, 1)",
        "ease-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)", filter: "blur(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)", filter: "blur(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 700ms cubic-bezier(0.23, 1, 0.32, 1) forwards",
        "scale-in": "scale-in 500ms cubic-bezier(0.23, 1, 0.32, 1) forwards",
      },
    },
  },
  plugins: [],
};
